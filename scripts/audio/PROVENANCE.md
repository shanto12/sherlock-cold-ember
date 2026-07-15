# Cinematic audio provenance

The Cold Ember Casebook soundtrack is produced offline and served as static,
fingerprinted media. The browser never receives an ElevenLabs credential and
the deployed site makes no runtime request to a speech provider.

## Original cast and source policy

- Seven roles use original voices created with ElevenLabs Voice Design: the
  consulting detective, doctor/chronicler, two inspectors, contralto,
  Baker Street landlady, and night driver.
- The production prompts explicitly prohibit actor, celebrity, adaptation, or
  living-person likenesses. No account voice clone or celebrity-labelled voice
  is used.
- Dialogue is generated with `eleven_v3`; ambience and Foley are generated with
  `eleven_text_to_sound_v2`.
- The published v1.2 recordings were generated on **July 15, 2026** under the
  maintainer's paid **Creator** subscription. ElevenLabs documents commercial
  rights for paid-plan output in its
  [billing guidance](https://elevenlabs.io/docs/overview/administration/billing),
  subject to its [Terms of Service](https://elevenlabs.io/terms-of-use) and
  Prohibited Use Policy.
- Production consumed **6,063 text characters**, measured from the account
  counter immediately before and after the complete generation pass.

The source of truth is [`production-plan.mjs`](./production-plan.mjs). It holds
all public voice directions, dialogue delivery notes, ambience prompts, Foley
prompts, cue positions, and mix intent. It contains no provider IDs or secrets.

## Mix architecture

Each of the five scenes has three runtime-ready layers:

1. A dialogue stem containing the four voices and timed scene Foley.
2. A seamless 30-second ambience loop for independent atmosphere control.
3. An audit master with the ambience sidechain-ducked under dialogue.

Individual dialogue, Foley, and ambience stems are preserved for remastering.
FFmpeg applies speech normalization, high-pass cleanup, stereo 44.1 kHz/192
kbps encoding, 25 ms attack and 650 ms release ambience ducking, and a
true-peak-safe final limiter. The published directory contains exactly **45
fingerprinted MP3 files** totaling **12,886,180 bytes**.

## Objective master QA

| Scene | Duration | Integrated loudness | True peak | Forced-alignment loss | Timing |
| --- | ---: | ---: | ---: | ---: | --- |
| Summons | 26.590 s | -19.1 LUFS | -2.2 dBFS | 0.033199 | monotonic |
| Passage | 25.520 s | -19.1 LUFS | -2.2 dBFS | 0.065320 | monotonic |
| Room | 27.510 s | -18.4 LUFS | -2.1 dBFS | 0.039990 | monotonic |
| Archive | 20.200 s | -19.2 LUFS | -3.2 dBFS | 0.097674 | monotonic |
| Conclusion | 22.650 s | -18.2 LUFS | -2.2 dBFS | 0.065221 | monotonic |

All five masters passed `ffprobe` as stereo MP3 at 44.1 kHz and 192 kbps. All
20 authored lines matched the timestamp alignment returned with their generated
speech. A second ElevenLabs Forced Alignment pass validated every completed
master—including its ambience and Foley—with monotonic word timing.

## Auditable maintainer rebuild

The generator reads the credential only from the macOS Keychain service
`codex-elevenlabs-api-key` for the current macOS account. It does not accept a
credential through source, command-line arguments, or browser configuration.

```sh
node scripts/audio/generate-cinematic-audio.mjs
node scripts/audio/verify-forced-alignment.mjs
node scripts/audio/generate-cinematic-audio.mjs
node scripts/audio/render-manifest.mjs
```

Use `--remix` to rebuild scene stems and masters without spending generation
credits. Use `--force` only for an intentional full regeneration. Work files,
provider alignment data, and the local credit ledger remain under the ignored
`work/` directory. The checked-in
`lib/cinematic-audio-manifest.ts` contains only public metadata, caption cue
times, content hashes, and fingerprinted URLs; voice IDs are intentionally
omitted. Fresh provider generation is intentionally nondeterministic; the
published release is defined by the checked-in hashes and byte sizes, not by an
expectation that a future generation pass will produce identical performances.
