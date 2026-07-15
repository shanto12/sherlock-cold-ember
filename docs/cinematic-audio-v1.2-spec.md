# Cinematic audio v1.2 specification

Status: release-candidate verification complete; immutable release status is recorded in the public GitHub `v1.2.0` release

## Audience promise

The conversation preference is on by default. A visitor never has to find or
press a dedicated “Hear conversation” button. Browser security still requires
one trusted interaction before audible playback, so the first ordinary click,
tap, or non-modifier key press unlocks the current scene. Every later scene
entry starts that scene's matching conversation automatically until the visitor
turns conversation off.

The visible control must communicate one of four truthful states:

1. `Conversation on · starts with your first interaction`
2. `Conversation on · Scene 0N playing`
3. `Conversation on · Scene 0N ready`
4. `Conversation off`

Turning conversation off stops dialogue, ambience, Foley, captions, timers,
and media immediately. The off preference persists on the device. Turning it
back on is itself a trusted gesture and starts the active scene.

## Production model

- ElevenLabs is used only during an offline, maintainer-run production step.
- No API key, generation endpoint, remote voice identifier, or visitor data is
  present in the client bundle or production requests.
- The browser requests only same-origin, self-hosted audio.
- Every character voice is an original, non-celebrity Victorian performance.
  No living or historical actor voice is requested, cloned, named, sampled, or
  imitated.
- Five scene masters combine distinct character dialogue, location ambience,
  and Foley. Web Audio remains a bounded procedural enhancement and fallback.
- Captions remain authored text, not a runtime transcription dependency.

## Scene direction

| Scene | Dramatic location | Required audible details |
| --- | --- | --- |
| Summons | Baker Street at 10:17 PM | Low fire, rain at sash, telegram mechanism, paper, Mrs. Hudson, Watson, Holmes |
| Passage | Southbound hansom at 11:47 PM | One horse, four-beat hoof rhythm, wet wheels, carriage creak, wind, driver, Watson, Holmes |
| Room | Dorset Street bindery at 12:08 AM | Cold room tone, receding rain, door/footstep/glass details, Lestrade, Watson, Holmes |
| Archive | Baker Street reference room at 2:32 AM | Clock, low fire, pages and index cards, Gregory and Adler as clearly framed archival echoes, Watson, Holmes |
| Conclusion | Baker Street at dawn, 5:41 AM | Dawn rain easing, fire settling, evidence paper, Lestrade, Watson, Holmes, restrained final resolve |

## Mix and delivery targets

- Web delivery: MP3, 44.1 kHz, 192 kbps where the account permits it.
- Final masters: true peak no higher than -1 dBTP.
- Dialogue: intelligible and forward, approximately -16 LUFS when measured as
  a dialogue stem.
- Ambience: typically 8 dB below dialogue while speech is active, with smooth
  ducking rather than abrupt muting.
- Scene transitions: short fades; never overlap two conversations.
- Audio assets: deterministic paths plus duration and SHA-256 inventory.

## Accessibility and browser behavior

- Captions identify speaker, line position, and canonical source when present.
- Captions can be dismissed without stopping the audible experience.
- Conversation off is available in the header and persistent console/mixer.
- Page visibility stops speech and suspends ambience; returning never restarts
  if the visitor has turned conversation off.
- Reduced motion does not disable sound, but no audio state depends on animated
  timing.
- Failure to decode or play a generated asset falls back to timed captions and,
  when available, an original device system voice.
- Audio never starts from component mount, synthetic events, scroll alone before
  unlock, or an automated page load.

## Release gates

- Fresh profile: default preference is on; no audible load-time playback; first
  ordinary interaction starts the current scene without a dedicated audio CTA.
- Returning opted-out profile: remains off through reload and navigation.
- All five scenes: matching master, changing speakers, captions, and clean stop.
- Desktop and mobile: every visible control, mixer range, caption control,
  scene navigation, form, and core story workflow exercised.
- Runtime: no page errors, console errors, failed same-origin media requests, or
  unexpected responses.
- Security: `media-src 'self'`, `autoplay=(self)`, no public key pattern, and no
  ElevenLabs request from the browser.
- Supply chain: locked install, lint, typecheck, both builds, tests, and
  production dependency audit pass.
- Production: exact GitHub commit deployed to Netlify and private Sites, then
  verified by Playwright and one final pass in Shanto's real Chrome profile.
