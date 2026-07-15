import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const root = process.cwd();
const manifestPath = join(root, "lib/cinematic-audio-manifest.ts");
const manifestSource = readFileSync(manifestPath, "utf8");
const objectStart = manifestSource.indexOf("{", manifestSource.indexOf("Object.freeze("));
const objectEnd = manifestSource.lastIndexOf("} as const");
assert.ok(objectStart > 0 && objectEnd > objectStart, "generated manifest should stay JSON-shaped");
const manifest = JSON.parse(manifestSource.slice(objectStart, objectEnd + 1));

const walk = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const collectAssets = (value, assets = new Map()) => {
  if (!value || typeof value !== "object") return assets;
  if (
    typeof value.url === "string" &&
    typeof value.sha256 === "string" &&
    typeof value.sizeBytes === "number"
  ) {
    const existing = assets.get(value.url);
    if (existing) assert.deepEqual(existing, value, `metadata should agree for ${value.url}`);
    else assets.set(value.url, value);
  }
  for (const child of Object.values(value)) collectAssets(child, assets);
  return assets;
};

test("ships a complete, fingerprinted, secret-free cinematic inventory", () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.provenance.runtimeApiRequired, false);
  assert.equal(manifest.provenance.containsSecrets, false);
  assert.equal(manifest.provenance.celebrityOrActorVoiceLikenesses, false);
  assert.equal(manifest.provenance.measuredTextCharactersUsed, 6_063);
  assert.equal(Object.keys(manifest.cast).length, 7);
  for (const role of Object.values(manifest.cast)) {
    assert.equal(role.originalNonCelebrityVoice, true);
    assert.deepEqual(role.likenessReferences, []);
  }

  const scenes = Object.entries(manifest.scenes);
  assert.deepEqual(
    scenes.map(([id]) => id),
    ["summons", "passage", "room", "archive", "conclusion"],
  );
  assert.equal(scenes.reduce((sum, [, scene]) => sum + scene.lines.length, 0), 20);
  const dialogueSource = readFileSync(join(root, "lib/dialogue-script.ts"), "utf8");
  for (const [sceneId, scene] of scenes) {
    assert.equal(scene.lines.length, 4);
    assert.equal(scene.master.codec, "mp3");
    assert.equal(scene.master.sampleRateHz, 44_100);
    assert.equal(scene.master.channels, 2);
    assert.ok(scene.masterLoudness.integratedLufs >= -22);
    assert.ok(scene.masterLoudness.integratedLufs <= -15);
    assert.ok(scene.masterLoudness.truePeakDbfs <= -1);
    let previousEnd = 0;
    for (const [index, line] of scene.lines.entries()) {
      assert.equal(line.index, index);
      assert.ok(line.startMs >= previousEnd, `${sceneId} cue ${index} should be monotonic`);
      assert.ok(line.endMs > line.startMs, `${sceneId} cue ${index} should have duration`);
      assert.ok(line.endMs <= scene.durationMs, `${sceneId} cue ${index} should fit its scene`);
      assert.equal(line.alignment.authoredTextMatched, true);
      assert.ok(dialogueSource.includes(line.text), `${sceneId} cue ${index} should match authored text`);
      previousEnd = line.endMs;
    }
  }

  assert.doesNotMatch(manifestSource, /\bvoice[_-]?id\b/i);
  assert.doesNotMatch(manifestSource, /sk_[A-Za-z0-9]{20,}/);
});

test("matches every public audio file to its declared SHA-256 and size", () => {
  const assets = collectAssets(manifest);
  assert.equal(assets.size, 45);
  let totalBytes = 0;
  for (const [url, metadata] of assets) {
    assert.match(url, /^\/audio\/cinematic\/[a-z0-9/_.-]+\.[a-f0-9]{12}\.mp3$/i);
    assert.ok(url.endsWith(`.${metadata.sha256.slice(0, 12)}.mp3`));
    const path = join(root, "public", url);
    let audio;
    try {
      audio = readFileSync(path);
    } catch (error) {
      assert.fail(`${url} should be readable: ${error instanceof Error ? error.message : error}`);
    }
    assert.equal(audio.length, metadata.sizeBytes, `${url} size should match`);
    const digest = createHash("sha256").update(audio).digest("hex");
    assert.equal(digest, metadata.sha256, `${url} hash should match`);
    totalBytes += metadata.sizeBytes;
  }
  assert.equal(totalBytes, 12_886_180);

  const publicRoot = join(root, "public/audio/cinematic");
  const shipped = walk(publicRoot)
    .filter((path) => path.endsWith(".mp3"))
    .map((path) => `/${relative(join(root, "public"), path)}`)
    .sort();
  assert.deepEqual(shipped, [...assets.keys()].sort());
});
