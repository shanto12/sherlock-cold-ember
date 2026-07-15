#!/usr/bin/env node

/** Aligns each finished scene master against its authored transcript. */

import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { closeSync, fsyncSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workRoot = join(root, "work/audio/cinematic");
const publicRoot = join(root, "public");
const candidatePath = join(workRoot, "cinematic-audio-manifest.json");
const reportPath = join(workRoot, "forced-alignment.json");
const manifest = JSON.parse(readFileSync(candidatePath, "utf8"));
const key = execFileSync(
  "/usr/bin/security",
  [
    "find-generic-password",
    "-a",
    process.env.USER,
    "-s",
    "codex-elevenlabs-api-key",
    "-w",
  ],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
).trim();

if (!/^sk_[A-Za-z0-9]+$/.test(key)) throw new Error("Keychain credential unavailable.");

const finiteNonNegative = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

const assertContainedPath = (parent, path, label) => {
  const child = relative(parent, path);
  if (!child || child === ".." || child.startsWith(`..${sep}`) || isAbsolute(child)) {
    throw new Error(`${label} escaped its allowed directory.`);
  }
};

const writeReport = (path, data) => {
  assertContainedPath(workRoot, path, "Alignment report");
  const temporaryPath = join(dirname(path), `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`);
  let descriptor;
  try {
    descriptor = openSync(temporaryPath, "wx", 0o600);
    writeFileSync(descriptor, data);
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporaryPath, path);
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temporaryPath);
    } catch (cleanupError) {
      if (!cleanupError || typeof cleanupError !== "object" || cleanupError.code !== "ENOENT") {
        throw cleanupError;
      }
    }
    throw error;
  }
};

const results = {};
for (const [sceneId, scene] of Object.entries(manifest.scenes)) {
  if (!/^[a-z0-9-]{1,80}$/.test(sceneId)) throw new Error(`Invalid scene id: ${sceneId}`);
  process.stdout.write(`Forced alignment: ${sceneId}\n`);
  const audioPath = resolve(publicRoot, `.${scene.master.url}`);
  assertContainedPath(publicRoot, audioPath, `Scene ${sceneId} audio`);
  const transcript = scene.lines.map((line) => line.text).join(" ");
  const form = new FormData();
  form.append("file", new Blob([readFileSync(audioPath)], { type: "audio/mpeg" }), `${sceneId}.mp3`);
  form.append("text", transcript);
  const response = await fetch("https://api.elevenlabs.io/v1/forced-alignment", {
    method: "POST",
    headers: { "xi-api-key": key },
    body: form,
    signal: AbortSignal.timeout(180_000),
  });
  if (new URL(response.url).origin !== "https://api.elevenlabs.io") {
    throw new Error(`Forced alignment ${sceneId} redirected to an untrusted origin.`);
  }
  if (!response.ok) {
    throw new Error(`Forced alignment ${sceneId} returned ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  }
  const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    throw new Error(`Forced alignment ${sceneId} returned unexpected content type ${contentType ?? "missing"}.`);
  }
  const alignment = await response.json();
  const words = Array.isArray(alignment.words)
    ? alignment.words
        .map((word) => ({
          start: finiteNonNegative(word?.start),
          end: finiteNonNegative(word?.end),
        }))
        .filter((word) => word.start !== null && word.end !== null)
    : [];
  results[sceneId] = {
    provider: "ElevenLabs Forced Alignment",
    loss: Math.round((finiteNonNegative(alignment.loss) ?? 0) * 1_000_000) / 1_000_000,
    wordsAligned: words.length,
    transcriptCharacters: transcript.length,
    firstWordStartSeconds: words[0]?.start ?? null,
    lastWordEndSeconds: words.at(-1)?.end ?? null,
    monotonicWordTiming: words.every(
      (word, index) =>
        Number.isFinite(word.start) &&
        Number.isFinite(word.end) &&
        word.end >= word.start &&
        (index === 0 || word.start >= words[index - 1].start),
    ),
  };
}

writeReport(reportPath, `${JSON.stringify(results, null, 2)}\n`);
process.stdout.write(`Forced alignment passed for ${Object.keys(results).length} scene masters.\n`);
