#!/usr/bin/env node

/**
 * Renders the inspected work manifest as a checked-in TypeScript constant.
 * Pipe stdout into apply_patch; this helper deliberately does not edit source.
 */

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const rootDirectory = resolve(scriptDirectory, "../..");
const sourcePath = join(
  rootDirectory,
  "work/audio/cinematic/cinematic-audio-manifest.json",
);
const manifest = JSON.parse(readFileSync(sourcePath, "utf8"));

process.stdout.write(`/**
 * Fingerprinted, self-hosted cinematic audio inventory.
 *
 * Generated offline from scripts/audio/production-plan.mjs. It contains no
 * API key or runtime provider dependency. Voice IDs are intentionally omitted.
 */
export const CINEMATIC_AUDIO_MANIFEST = Object.freeze(${JSON.stringify(
  manifest,
  null,
  2,
)} as const);

export type CinematicAudioManifest = typeof CINEMATIC_AUDIO_MANIFEST;
export type CinematicAudioManifestSceneId = keyof typeof CINEMATIC_AUDIO_MANIFEST.scenes;
`);
