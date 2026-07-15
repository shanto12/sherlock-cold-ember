# THE COLD EMBER — Master Plan

Status: phases 1–8 complete; immutable v1.2.0 released July 15, 2026
Setting: London, winter 1895
Format: an original Sherlock Holmes moving casebook in five observations

## North star

Build a genuinely cinematic, useful, and accessible public experience—not a sepia-themed fan page. Visitors arrive as Watson, ride through London in a period-correct hansom cab, observe Holmes at a non-graphic crime scene, cross-reference evidence in his library, and choose a conclusion before Holmes reveals the chain.

The creative tension is literal fire and cold: London remains cobalt-black, wet, and hostile; gaslight, pipe ember, and correctly understood evidence introduce controlled warmth.

## Phase 1 — Historical and creative foundation

Deliverables:

- Original 1895 case premise, copy, scene chronology, and public-domain notice
- Period-accurate hansom cab, gaslight, pipe, crime-scene tools, telegram, and reference books
- Visual system: charred ink, Prussian night, frost glass, bone paper, gas flame, and pipe ember
- Typography: editorial Victorian display, condensed scene titles, and forensic monospaced labels
- Accessibility contract: normal document scroll, no sound before a trusted
  browser interaction, no gore, no flashing, keyboard/touch parity, persistent
  motion pause, captions, instant mute, and a composed reduced-motion edition

Approval: automatic. Selected direction: **THE COLD EMBER**, combining the narrative clarity of a prestige silent film with the controlled match transitions of a practical stage illusion.

## Phase 2 — Original cinematic assets

Deliverables:

- Consistent original widescreen tableaux for the hansom ride, bindery threshold, crime-room inspection, Baker Street reference room, and final deduction
- No actor likenesses, film/television costumes, franchise marks, modern objects, branded tobacco, or copied book covers
- Layer-ready compositions with safe negative space for live HTML copy
- One bespoke social card derived from the finished visual system

## Phase 3 — Moving casebook implementation

Deliverables:

- Full-screen cinematic stage behind five semantic story chapters
- Scroll-driven scene changes without scroll trapping
- Rain, gaslight, cab sway, wheel rhythm, horse breath, pipe smoke, page drift, inspection beam, and deduction-line motion built from bounded CSS/Canvas systems
- Initial opt-in procedural rain, fire, hoofbeat, wheel, room-tone, clock,
  paper, and deduction audio foundation. Phase 8 supersedes the preference with
  default-on, trusted-interaction-unlocked, self-hosted cinematic scenes while
  retaining bounded Web Audio as enhancement and fallback.
- Locally synthesized character conversations with synchronized captions, independent master/ambience/dialogue levels, and visible canonical-source attribution
- Chapter index, previous/next scene controls, play/pause, inspection light, evidence buttons, case-notes drawer, conclusion choice, replay, and consultation inquiry
- Crawlable story and field notes outside the motion layer

## Phase 4 — Conversion and trust

Deliverables:

- Clear value proposition and memorable 90-second primary journey
- “Commission an immersive mystery” inquiry through Netlify Forms
- Useful field notes on hansom cabs, Victorian footprint evidence, and tobacco-ash study
- Original/unofficial public-domain adaptation notice and tobacco historical-context notice
- Fixed canonical URL, Open Graph/X metadata, robots, sitemap, favicons, and structured website metadata

## Phase 5 — Production hardening

Deliverables:

- Next.js/Vinext dual release builds with no unused starter database/auth code
- Strict security headers and platform-compatible CSP
- Bounded animation and audio lifecycles, visibility pausing, node/timer teardown, image priority, responsive crops, and no layout overflow
- GitHub Actions for locked install, lint, typecheck, rendered tests, both builds, and production audit
- Full dependency and secret hygiene checks

## Phase 6 — Release and verification

Deliverables:

- New clean public GitHub repository with recruiter-ready README, license, topics, and release evidence
- Exact-source private Sites deployment and public Netlify production deployment
- Current-production tests for every visible control and workflow
- Real Chrome desktop and mobile passes at 1440, 390, and 320 widths
- Keyboard/focus, reduced motion, touch targets, horizontal overflow, bounded DOM, console, network, routes, forms, headers, CSP, OG, robots, sitemap, 404, and npm audit evidence
- Public v1.0.0 release only after all initial visual/interaction rows are proven

## Phase 7 — Cinematic audio expansion (v1.1.0, historical baseline)

Deliverables:

- Five authored sound mixes and five original conversations spanning Holmes, Watson, Lestrade, Gregory, Irene Adler, Mrs. Hudson, and a hansom driver
- Short canonical excerpts selected only from timeline-safe public-domain stories; the famous 1897 “game is afoot” line is excluded from this 1895 case
- Explicit user-gesture entry, no sound before browser unlock, locally
  persisted mixer preferences, and no external audio requests. Phase 8 later
  made the saved preference on by default without violating browser autoplay
  policy.
- Captions with speaker, position, full line, and story-level source links
- Real-time generated interaction accents for telegrams, clues, papers, scene changes, and the final deduction
- New automated and real-Chrome production evidence covering autoplay lock, audio context count, visibility suspension, speech/caption playback, every mixer control, mobile stacking, CSP, console, network, and complete teardown
- Public v1.1.0 release only after GitHub, Netlify, Sites, CI, and the evidence matrix agree on the same source commit

## Phase 8 — Original performance masters and default-on scenes (v1.2.0)

Deliverables:

- Conversation preference on by default, with the first ordinary trusted page
  interaction unlocking the active scene and no dedicated “Hear conversation”
  requirement
- Persistent, immediately effective conversation off/on control in the header,
  console, and mixer
- Five self-hosted cinematic scene masters produced offline from original,
  non-celebrity voices, authored dialogue, London ambience, horses, carriage,
  rain, fire, clock, telegram, glass, paper, and deduction Foley
- Build-time generation only: the provider credential remains in the maintainer's
  secure credential store and is absent from source, bundles, deployments, and
  visitor network traffic
- Authored cue timings for synchronized captions plus graceful generated-audio,
  system-voice, and timed-caption fallback layers
- Same-origin-only media policy, production asset inventory, SHA-256 hashes,
  performance provenance, and recruiter-safe public documentation
- A new full GitHub, CI, Netlify, Sites, Playwright, real-Chrome, mobile,
  security-header, network, console, and evidence-matrix release proof

## Historical boundaries

- Hansom: two wheels, one horse, enclosed passenger compartment, elevated rear driver, roof trapdoor, and wet wheel spray
- Light: dim uneven gaslight; no modern flashlight language
- Evidence: pocket lens, notebook, ruler, plaster impressions, packets, handwriting, footprints, tobacco ash, chemical stain testing, telegrams, newspapers, and trade-marked hands
- Fingerprints: known research, not routine Metropolitan Police dusting in 1895
- No DNA, UV lamp, plastic bags, yellow tape, chalk outline, modern car, electric neon, or contemporary forensic interface

## Completion rule

Met for v1.2.0. The public Netlify URL, immutable GitHub source and release,
successful CI and CodeQL runs, private Sites parity version, every-control real
Chrome pass, responsive/accessibility verification, persisted live form
submission, route/header checks, media hashes, and evidence matrix agree on the
same runtime commit. Final identifiers are recorded in
[`release-evidence.md`](./release-evidence.md).
