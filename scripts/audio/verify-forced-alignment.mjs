#!/usr/bin/env node

/** Aligns each finished scene master against its authored transcript. */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const candidatePath = join(root, "work/audio/cinematic/cinematic-audio-manifest.json");
const reportPath = join(root, "work/audio/cinematic/forced-alignment.json");
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

const results = {};
for (const [sceneId, scene] of Object.entries(manifest.scenes)) {
  process.stdout.write(`Forced alignment: ${sceneId}\n`);
  const audioPath = join(root, "public", scene.master.url);
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
  if (!response.ok) {
    throw new Error(`Forced alignment ${sceneId} returned ${response.status}: ${(await response.text()).slice(0, 1000)}`);
  }
  const alignment = await response.json();
  const words = alignment.words ?? [];
  results[sceneId] = {
    provider: "ElevenLabs Forced Alignment",
    loss: Math.round(Number(alignment.loss) * 1_000_000) / 1_000_000,
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

writeFileSync(reportPath, `${JSON.stringify(results, null, 2)}\n`);
process.stdout.write(`Forced alignment passed for ${Object.keys(results).length} scene masters.\n`);
