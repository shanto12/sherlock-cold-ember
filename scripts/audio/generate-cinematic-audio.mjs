#!/usr/bin/env node

/**
 * Offline cinematic audio producer for The Cold Ember Casebook.
 *
 * Security boundary:
 * - Reads the ElevenLabs key directly from macOS Keychain into process memory.
 * - Never accepts a key as a CLI argument or environment variable.
 * - Never writes credentials, request headers, or raw API responses to disk.
 * - Produces only static, fingerprinted audio suitable for a public website.
 */

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { production } from "./production-plan.mjs";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(SCRIPT_DIR, "../..");
const WORK_DIR = join(ROOT_DIR, "work/audio/cinematic");
const RAW_DIR = join(WORK_DIR, "raw");
const PROCESSED_DIR = join(WORK_DIR, "processed");
const PUBLIC_DIR = join(ROOT_DIR, "public/audio/cinematic");
const MANIFEST_CANDIDATE = join(WORK_DIR, "cinematic-audio-manifest.json");
const QA_REPORT = join(WORK_DIR, "qa-report.json");
const CREDIT_LEDGER = join(WORK_DIR, "credit-ledger.json");
const FORCED_ALIGNMENT_REPORT = join(WORK_DIR, "forced-alignment.json");
const KEYCHAIN_SERVICE = "codex-elevenlabs-api-key";
const API_BASE = "https://api.elevenlabs.io";
const FORCE = process.argv.includes("--force");
const REMIX = process.argv.includes("--remix");

const say = (message) => process.stdout.write(`${message}\n`);
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

const slugify = (value) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const round = (value, decimals = 3) => {
  const scale = 10 ** decimals;
  return Math.round(value * scale) / scale;
};

const sha256File = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");

const ensureDirectory = (path) => mkdirSync(path, { recursive: true });

const run = (program, args, options = {}) => {
  const result = spawnSync(program, args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0) {
    const diagnostic = [result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n")
      .slice(-8_000);
    throw new Error(`${program} failed (${result.status})\n${diagnostic}`);
  }
  return result;
};

const getKey = () => {
  const key = execFileSync(
    "/usr/bin/security",
    [
      "find-generic-password",
      "-a",
      process.env.USER,
      "-s",
      KEYCHAIN_SERVICE,
      "-w",
    ],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  ).trim();
  if (!/^sk_[A-Za-z0-9]+$/.test(key)) {
    throw new Error(`No valid ElevenLabs key found in Keychain service ${KEYCHAIN_SERVICE}.`);
  }
  return key;
};

const key = getKey();

const request = async (path, { method = "GET", body, binary = false } = {}) => {
  let lastError;
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          "xi-api-key": key,
          ...(body ? { "content-type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(180_000),
      });
      if (!response.ok) {
        const safeBody = (await response.text()).slice(0, 2_000);
        const error = new Error(
          `ElevenLabs ${method} ${path.split("?")[0]} returned ${response.status}: ${safeBody}`,
        );
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
        const retryAfter = Number(response.headers.get("retry-after"));
        await sleep(Number.isFinite(retryAfter) ? retryAfter * 1_000 : attempt * 2_000);
        continue;
      }
      return binary ? Buffer.from(await response.arrayBuffer()) : response.json();
    } catch (error) {
      lastError = error;
      if (attempt === 5) break;
      await sleep(attempt * 2_000);
    }
  }
  throw lastError;
};

const probe = (path) => {
  const result = run("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a:0",
    "-show_entries",
    "stream=codec_name,sample_rate,channels,bit_rate:format=duration,size",
    "-of",
    "json",
    path,
  ]);
  const parsed = JSON.parse(result.stdout);
  const stream = parsed.streams?.[0] ?? {};
  return {
    durationSeconds: round(Number(parsed.format?.duration ?? 0)),
    durationMs: Math.round(Number(parsed.format?.duration ?? 0) * 1_000),
    sizeBytes: Number(parsed.format?.size ?? statSync(path).size),
    codec: stream.codec_name ?? "unknown",
    sampleRateHz: Number(stream.sample_rate ?? 0),
    channels: Number(stream.channels ?? 0),
    bitRate: Number(stream.bit_rate ?? 0),
  };
};

const loudness = (path) => {
  const result = run("ffmpeg", [
    "-hide_banner",
    "-nostats",
    "-i",
    path,
    "-filter_complex",
    "ebur128=peak=true",
    "-f",
    "null",
    "-",
  ]);
  const output = `${result.stdout}\n${result.stderr}`;
  const integrated = [...output.matchAll(/I:\s+(-?\d+(?:\.\d+)?) LUFS/g)].at(-1);
  const truePeak = [...output.matchAll(/Peak:\s+(-?\d+(?:\.\d+)?) dBFS/g)].at(-1);
  return {
    integratedLufs: integrated ? Number(integrated[1]) : null,
    truePeakDbfs: truePeak ? Number(truePeak[1]) : null,
  };
};

const normalizeText = (value) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const fingerprint = (sourcePath, category, baseName) => {
  const hash = sha256File(sourcePath);
  const shortHash = hash.slice(0, 12);
  const destinationDirectory = join(PUBLIC_DIR, category);
  ensureDirectory(destinationDirectory);
  const destinationPath = join(destinationDirectory, `${baseName}.${shortHash}.mp3`);
  copyFileSync(sourcePath, destinationPath);
  return {
    url: `/audio/cinematic/${category}/${baseName}.${shortHash}.mp3`,
    sha256: hash,
    ...probe(destinationPath),
  };
};

const normalizeStem = (inputPath, outputPath, targetLufs, truePeak, highpass = 35) => {
  ensureDirectory(dirname(outputPath));
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    inputPath,
    "-af",
    `highpass=f=${highpass},loudnorm=I=${targetLufs}:LRA=10:TP=${truePeak},aresample=44100`,
    "-ar",
    "44100",
    "-ac",
    "2",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath,
  ]);
};

const getSubscription = () => request("/v1/user/subscription");

const listVoices = async () => {
  const response = await request("/v1/voices");
  return response.voices ?? [];
};

const createOriginalVoice = async (roleId, role) => {
  say(`Designing original voice: ${role.publicLabel}`);
  const design = await request("/v1/text-to-voice/design", {
    method: "POST",
    body: {
      model_id: production.voiceDesignModel,
      voice_description: role.description,
      text: role.previewText,
      auto_generate_text: false,
    },
  });
  const preview = design.previews?.[0];
  if (!preview?.generated_voice_id) {
    throw new Error(`Voice Design returned no usable preview for ${roleId}.`);
  }
  const saved = await request("/v1/text-to-voice", {
    method: "POST",
    body: {
      voice_name: role.voiceName,
      voice_description: role.description,
      generated_voice_id: preview.generated_voice_id,
      labels: {
        project: "cold-ember",
        origin: "original-voice-design",
        character_role: roleId,
      },
    },
  });
  if (!saved.voice_id) throw new Error(`Could not save designed voice for ${roleId}.`);
  return saved.voice_id;
};

const prepareVoices = async () => {
  const existing = await listVoices();
  const result = {};
  for (const [roleId, role] of Object.entries(production.voiceRoles)) {
    const match = existing.find((voice) => voice.name === role.voiceName);
    result[roleId] = match?.voice_id ?? (await createOriginalVoice(roleId, role));
  }
  return result;
};

const ttsWithTimestamps = async ({ voiceId, text, seed }) =>
  request(
    `/v1/text-to-speech/${encodeURIComponent(voiceId)}/with-timestamps?output_format=${production.outputFormat}`,
    {
      method: "POST",
      body: {
        text,
        model_id: production.ttsModel,
        language_code: "en",
        seed,
        apply_text_normalization: "on",
        voice_settings: {
          stability: 0.46,
          similarity_boost: 0.8,
          style: 0.34,
          use_speaker_boost: true,
          speed: 1,
        },
      },
    },
  );

const generateDialogue = async (voices) => {
  const generated = {};
  for (const [sceneId, scene] of Object.entries(production.scenes)) {
    generated[sceneId] = [];
    for (let index = 0; index < scene.lines.length; index += 1) {
      const line = scene.lines[index];
      const role = production.voiceRoles[line.voice];
      const number = String(index + 1).padStart(2, "0");
      const baseName = `${number}-${slugify(line.speaker)}`;
      const rawPath = join(RAW_DIR, "dialogue", sceneId, `${baseName}.mp3`);
      const alignmentPath = join(WORK_DIR, "alignment", sceneId, `${baseName}.json`);
      ensureDirectory(dirname(rawPath));
      ensureDirectory(dirname(alignmentPath));

      let alignment;
      if (!existsSync(rawPath) || FORCE || !existsSync(alignmentPath)) {
        say(`Generating dialogue ${sceneId} ${number}/04 · ${line.speaker}`);
        const apiText = `${role.deliveryPrefix} ${line.direction} ${line.text}`;
        const response = await ttsWithTimestamps({
          voiceId: voices[line.voice],
          text: apiText,
          seed: 18_950 + Object.keys(production.scenes).indexOf(sceneId) * 100 + index,
        });
        if (!response.audio_base64) throw new Error(`TTS returned no audio for ${sceneId}/${number}.`);
        writeFileSync(rawPath, Buffer.from(response.audio_base64, "base64"));
        alignment = response.normalized_alignment ?? response.alignment ?? null;
        writeFileSync(alignmentPath, JSON.stringify(alignment));
      } else {
        alignment = JSON.parse(readFileSync(alignmentPath, "utf8"));
      }

      const processedPath = join(PROCESSED_DIR, "dialogue", sceneId, `${baseName}.mp3`);
      if (!existsSync(processedPath) || FORCE) {
        normalizeStem(rawPath, processedPath, -16, -1.5, 70);
      }
      const alignmentText = alignment?.characters?.join("") ?? "";
      const authoredTextMatched = normalizeText(alignmentText).includes(normalizeText(line.text));
      const asset = fingerprint(processedPath, `dialogue/${sceneId}`, baseName);
      generated[sceneId].push({
        ...line,
        index,
        asset,
        alignment: {
          api: "ElevenLabs TTS with timestamps",
          characterCount: alignment?.characters?.length ?? 0,
          authoredTextMatched,
        },
        processedPath,
      });
    }
  }
  return generated;
};

const generateSoundAssets = async (groupName, assets, { targetLufs, truePeak, highpass, loop }) => {
  const generated = {};
  for (const [assetId, spec] of Object.entries(assets)) {
    const rawPath = join(RAW_DIR, groupName, `${assetId}.mp3`);
    const processedPath = join(PROCESSED_DIR, groupName, `${assetId}.mp3`);
    ensureDirectory(dirname(rawPath));
    ensureDirectory(dirname(processedPath));
    if (!existsSync(rawPath) || FORCE) {
      say(`Generating ${groupName}: ${assetId}`);
      const audio = await request(
        `/v1/sound-generation?output_format=${production.outputFormat}`,
        {
          method: "POST",
          body: {
            text: spec.prompt,
            duration_seconds: spec.durationSeconds,
            prompt_influence: 0.72,
            loop,
            model_id: production.soundEffectsModel,
          },
          binary: true,
        },
      );
      writeFileSync(rawPath, audio);
    }
    if (!existsSync(processedPath) || FORCE) {
      normalizeStem(rawPath, processedPath, targetLufs, truePeak, highpass);
    }
    generated[assetId] = {
      spec,
      processedPath,
      asset: fingerprint(processedPath, groupName, slugify(assetId)),
    };
  }
  return generated;
};

const effectTimeMs = (effect, cueLines) => {
  if (typeof effect.atMs === "number") return effect.atMs;
  const anchor = cueLines[effect.anchorLine];
  if (!anchor) throw new Error(`Invalid effect anchor line ${effect.anchorLine}.`);
  return Math.max(0, anchor.startMs + (effect.offsetMs ?? 0));
};

const mixDialogueStem = ({ sceneId, scene, lines, effects, outputPath, durationMs }) => {
  ensureDirectory(dirname(outputPath));
  const inputArgs = [];
  for (const line of lines) inputArgs.push("-i", line.processedPath);
  const placedEffects = scene.effects.map((effect) => ({
    ...effect,
    atMs: effectTimeMs(effect, lines),
    path: effects[effect.id].processedPath,
  }));
  for (const effect of placedEffects) inputArgs.push("-i", effect.path);

  const filters = [];
  const dialogueLabels = [];
  lines.forEach((line, index) => {
    const label = `line${index}`;
    filters.push(
      `[${index}:a]adelay=${line.startMs}|${line.startMs},apad=whole_dur=${round(durationMs / 1_000, 3)}[${label}]`,
    );
    dialogueLabels.push(`[${label}]`);
  });
  filters.push(
    `${dialogueLabels.join("")}amix=inputs=${dialogueLabels.length}:duration=longest:normalize=0[dialogue]`,
  );

  const effectLabels = [];
  placedEffects.forEach((effect, index) => {
    const inputIndex = lines.length + index;
    const label = `effect${index}`;
    const linearGain = round(10 ** ((effect.gainDb ?? -10) / 20), 5);
    filters.push(
      `[${inputIndex}:a]volume=${linearGain},adelay=${effect.atMs}|${effect.atMs},apad=whole_dur=${round(durationMs / 1_000, 3)}[${label}]`,
    );
    effectLabels.push(`[${label}]`);
  });

  const mixInputs = ["[dialogue]", ...effectLabels];
  filters.push(
    `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=longest:normalize=0,atrim=duration=${round(durationMs / 1_000, 3)},loudnorm=I=-17:LRA=9:TP=-1.8,alimiter=limit=0.8:level=false,aresample=44100[out]`,
  );

  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputArgs,
    "-filter_complex_threads",
    "1",
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[out]",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath,
  ]);
  say(`Mixed dialogue + Foley stem: ${sceneId}`);
};

const mixMaster = ({ sceneId, dialogueStem, ambience, durationMs, outputPath }) => {
  ensureDirectory(dirname(outputPath));
  const durationSeconds = round(durationMs / 1_000, 3);
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-stream_loop",
    "-1",
    "-i",
    ambience,
    "-i",
    dialogueStem,
    "-filter_complex_threads",
    "1",
    "-filter_complex",
    `[0:a]atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS,volume=0.82[amb];` +
      `[1:a]asplit=2[dialogue][sidechain];` +
      `[amb][sidechain]sidechaincompress=threshold=0.018:ratio=9:attack=25:release=650:makeup=1[ducked];` +
      `[dialogue][ducked]amix=inputs=2:duration=longest:normalize=0,atrim=duration=${durationSeconds},loudnorm=I=-18:LRA=10:TP=-1.8,alimiter=limit=0.8:level=false,aresample=44100[out]`,
    "-map",
    "[out]",
    "-ar",
    "44100",
    "-ac",
    "2",
    "-c:a",
    "libmp3lame",
    "-b:a",
    "192k",
    outputPath,
  ]);
  say(`Mixed audit master with ducked ambience: ${sceneId}`);
};

const buildScenes = ({ dialogue, ambience, effects }) => {
  const scenes = {};
  for (const [sceneId, scene] of Object.entries(production.scenes)) {
    let cursor = scene.preRollMs;
    const cueLines = dialogue[sceneId].map((line, index) => {
      const startMs = cursor;
      const endMs = startMs + line.asset.durationMs;
      cursor = endMs + (scene.gapMs[index] ?? 0);
      return { ...line, startMs, endMs };
    });
    const durationMs = cursor + scene.tailMs;
    const dialogueStemPath = join(PROCESSED_DIR, "scenes", `${sceneId}-dialogue.mp3`);
    const masterPath = join(PROCESSED_DIR, "scenes", `${sceneId}-master.mp3`);
    if (!existsSync(dialogueStemPath) || FORCE || REMIX) {
      mixDialogueStem({
        sceneId,
        scene,
        lines: cueLines,
        effects,
        outputPath: dialogueStemPath,
        durationMs,
      });
    }
    if (!existsSync(masterPath) || FORCE || REMIX) {
      mixMaster({
        sceneId,
        dialogueStem: dialogueStemPath,
        ambience: ambience[sceneId].processedPath,
        durationMs,
        outputPath: masterPath,
      });
    }

    const dialogueStem = fingerprint(dialogueStemPath, "scenes", `${sceneId}-dialogue`);
    const master = fingerprint(masterPath, "scenes", sceneId);
    const masterLoudness = loudness(masterPath);
    const dialogueLoudness = loudness(dialogueStemPath);
    scenes[sceneId] = {
      title: scene.title,
      atmosphere: scene.atmosphere,
      durationMs: master.durationMs,
      dialogueStem,
      dialogueStemLoudness: dialogueLoudness,
      ambienceLoop: ambience[sceneId].asset,
      master,
      masterLoudness,
      lines: cueLines.map((line) => ({
        index: line.index,
        speaker: line.speaker,
        text: line.text,
        voiceRole: line.voice,
        startMs: line.startMs,
        endMs: line.endMs,
        stem: line.asset,
        alignment: line.alignment,
      })),
      effects: scene.effects.map((effect) => ({
        id: effect.id,
        startMs: effectTimeMs(effect, cueLines),
        gainDb: effect.gainDb,
        asset: effects[effect.id].asset,
      })),
    };
  }
  return scenes;
};

const assertProductionQA = (scenes) => {
  const failures = [];
  for (const [sceneId, scene] of Object.entries(scenes)) {
    if (scene.master.codec !== "mp3") failures.push(`${sceneId}: master is not MP3`);
    if (scene.master.sampleRateHz !== 44_100) failures.push(`${sceneId}: master is not 44.1 kHz`);
    if (scene.master.channels !== 2) failures.push(`${sceneId}: master is not stereo`);
    if (scene.masterLoudness.integratedLufs === null) failures.push(`${sceneId}: loudness unavailable`);
    if (scene.masterLoudness.integratedLufs > -15 || scene.masterLoudness.integratedLufs < -22) {
      failures.push(`${sceneId}: master loudness ${scene.masterLoudness.integratedLufs} LUFS outside -22..-15`);
    }
    if (scene.masterLoudness.truePeakDbfs === null || scene.masterLoudness.truePeakDbfs > -1) {
      failures.push(`${sceneId}: master true peak ${scene.masterLoudness.truePeakDbfs} dBFS exceeds -1`);
    }
    for (const line of scene.lines) {
      if (!line.alignment.authoredTextMatched) {
        failures.push(`${sceneId} line ${line.index + 1}: API alignment did not contain authored text`);
      }
      if (line.endMs <= line.startMs) failures.push(`${sceneId} line ${line.index + 1}: invalid cue`);
    }
  }
  if (failures.length > 0) {
    throw new Error(`Production QA failed:\n- ${failures.join("\n- ")}`);
  }
};

const directorySize = (path) => {
  if (!existsSync(path)) return 0;
  return readdirSync(path, { withFileTypes: true }).reduce(
    (sum, entry) =>
      sum +
      (entry.isDirectory()
        ? directorySize(join(path, entry.name))
        : statSync(join(path, entry.name)).size),
    0,
  );
};

const main = async () => {
  ensureDirectory(WORK_DIR);
  ensureDirectory(PUBLIC_DIR);
  if (FORCE || REMIX) rmSync(PUBLIC_DIR, { recursive: true, force: true });
  ensureDirectory(PUBLIC_DIR);

  const subscriptionBefore = await getSubscription();
  const creditLedger = existsSync(CREDIT_LEDGER)
    ? JSON.parse(readFileSync(CREDIT_LEDGER, "utf8"))
    : { productionCharacterCountStart: subscriptionBefore.character_count };
  say(
    `ElevenLabs plan ${subscriptionBefore.tier}; ${subscriptionBefore.character_limit - subscriptionBefore.character_count} text characters available.`,
  );

  const voices = await prepareVoices();
  say(`Original cast ready: ${Object.keys(voices).length} roles.`);
  const dialogue = await generateDialogue(voices);
  const ambience = await generateSoundAssets("ambience", production.ambience, {
    targetLufs: -28,
    truePeak: -3,
    highpass: 28,
    loop: true,
  });
  const effects = await generateSoundAssets("foley", production.effects, {
    targetLufs: -23,
    truePeak: -2,
    highpass: 35,
    loop: false,
  });
  const scenes = buildScenes({ dialogue, ambience, effects });
  assertProductionQA(scenes);
  if (existsSync(FORCED_ALIGNMENT_REPORT)) {
    const forcedAlignment = JSON.parse(readFileSync(FORCED_ALIGNMENT_REPORT, "utf8"));
    for (const [sceneId, result] of Object.entries(forcedAlignment)) {
      if (scenes[sceneId]) scenes[sceneId].forcedAlignment = result;
    }
  }

  const subscriptionAfter = await getSubscription();
  // Freeze the voice-generation boundary so later QA APIs cannot be counted
  // as production usage during cache-only reruns.
  const productionCharacterCountEnd =
    creditLedger.productionCharacterCountEnd ?? subscriptionAfter.character_count;
  const productionCharactersUsed =
    productionCharacterCountEnd - creditLedger.productionCharacterCountStart;
  writeFileSync(
    CREDIT_LEDGER,
    `${JSON.stringify(
      {
        productionCharacterCountStart: creditLedger.productionCharacterCountStart,
        productionCharacterCountEnd,
        productionCharacterCountLatest: subscriptionAfter.character_count,
        productionCharactersUsed,
      },
      null,
      2,
    )}\n`,
  );
  const cast = Object.fromEntries(
    Object.entries(production.voiceRoles).map(([roleId, role]) => [
      roleId,
      {
        character: role.character,
        publicLabel: role.publicLabel,
        origin: "ElevenLabs Voice Design",
        originalNonCelebrityVoice: true,
        likenessReferences: [],
      },
    ]),
  );
  const manifest = {
    schemaVersion: 1,
    release: production.release,
    mix: {
      dialogueTargetLufs: -16,
      dialogueStemTargetLufs: -17,
      masterTargetLufs: -18,
      masterTruePeakCeilingDbfs: -1,
      ambienceDucking: {
        ratio: 9,
        attackMs: 25,
        releaseMs: 650,
      },
    },
    provenance: {
      speechProvider: "ElevenLabs",
      speechModel: production.ttsModel,
      voiceOrigin: "Original Voice Design",
      soundEffectsProvider: "ElevenLabs",
      soundEffectsModel: production.soundEffectsModel,
      masteringTool: "FFmpeg loudnorm + sidechain compression",
      runtimeApiRequired: false,
      containsSecrets: false,
      celebrityOrActorVoiceLikenesses: false,
      measuredTextCharactersUsed: productionCharactersUsed,
    },
    cast,
    scenes,
  };
  writeFileSync(MANIFEST_CANDIDATE, `${JSON.stringify(manifest, null, 2)}\n`);

  const report = {
    plan: subscriptionBefore.tier,
    characterCountBefore: subscriptionBefore.character_count,
    characterCountAfter: subscriptionAfter.character_count,
    charactersUsedThisInvocation:
      subscriptionAfter.character_count - subscriptionBefore.character_count,
    charactersUsedForProduction: productionCharactersUsed,
    characterLimit: subscriptionAfter.character_limit,
    publicAudioBytes: directorySize(PUBLIC_DIR),
    publicAudioFiles: readdirSync(PUBLIC_DIR, { recursive: true }).filter((item) => item.endsWith(".mp3")).length,
    masterQa: Object.fromEntries(
      Object.entries(scenes).map(([sceneId, scene]) => [
        sceneId,
        {
          url: scene.master.url,
          sha256: scene.master.sha256,
          durationMs: scene.master.durationMs,
          ...scene.masterLoudness,
          codec: scene.master.codec,
          sampleRateHz: scene.master.sampleRateHz,
          channels: scene.master.channels,
          alignedLines: scene.lines.filter((line) => line.alignment.authoredTextMatched).length,
          totalLines: scene.lines.length,
        },
      ]),
    ),
  };
  writeFileSync(QA_REPORT, `${JSON.stringify(report, null, 2)}\n`);

  say(`QA passed for ${Object.keys(scenes).length} scene masters and 20 aligned dialogue lines.`);
  say(`Credits used this invocation: ${report.charactersUsedThisInvocation} text characters.`);
  say(`Credits used for this production: ${report.charactersUsedForProduction} text characters.`);
  say(`Public audio: ${report.publicAudioFiles} MP3 files, ${round(report.publicAudioBytes / 1_048_576, 2)} MiB.`);
  say(`Manifest candidate: ${relative(ROOT_DIR, MANIFEST_CANDIDATE)}`);
  say(`QA report: ${relative(ROOT_DIR, QA_REPORT)}`);
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
