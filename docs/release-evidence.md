# Release evidence — The Cold Ember v1.2.0

This public record covers the immutable cinematic-audio v1.2.0 runtime and its
post-release drift audit, verified July 15, 2026 in America/Chicago. It contains
no deployment credential, browser secret, private email address, provider key,
or provider voice identifier.

## Final release identity

| Field | Verified value |
| --- | --- |
| Immutable release | [`v1.2.0`](https://github.com/shanto12/sherlock-cold-ember/releases/tag/v1.2.0), published at 5:34:20 PM CDT |
| Runtime source and tag target | [`8681e2c57d62f7acd3888ce53a623f15f1effecc`](https://github.com/shanto12/sherlock-cold-ember/commit/8681e2c57d62f7acd3888ce53a623f15f1effecc) |
| Public source | https://github.com/shanto12/sherlock-cold-ember |
| Feature, evidence, and hardening PRs | [#1](https://github.com/shanto12/sherlock-cold-ember/pull/1) default-on cinematic audio; [#2](https://github.com/shanto12/sherlock-cold-ember/pull/2) static cache policy; [#3](https://github.com/shanto12/sherlock-cold-ember/pull/3) Sites routing guard; [#4](https://github.com/shanto12/sherlock-cold-ember/pull/4) Sites media adapter; [#5](https://github.com/shanto12/sherlock-cold-ember/pull/5) enterprise evidence; [#6](https://github.com/shanto12/sherlock-cold-ember/pull/6) CodeQL/offline-provider hardening; [#7](https://github.com/shanto12/sherlock-cold-ember/pull/7) final evidence, provenance, and public governance |
| Runtime release-quality CI | [Run `29455183900`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29455183900) — success on the exact runtime SHA; 0 annotations |
| Runtime CodeQL | [Run `29455183310`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29455183310) — Actions and JavaScript/TypeScript succeeded; 0 annotations; 0 open alerts |
| Netlify production | https://sherlock-cold-ember.netlify.app — deploy `6a580934077a4d3d9a244293`, published at 5:27:24 PM CDT |
| Netlify immutable deploy | https://6a580934077a4d3d9a244293--sherlock-cold-ember.netlify.app |
| Private Sites parity | https://the-cold-ember-casebook.shanto.chatgpt.site — version 13 `appgprj_6a57a5a66324819181d4c4a018e4fd5f~appgver_3db6d347394481918c49f4a9a9773410`; deploy `appgdep_6a58097981108191aba5416bd0a483c3` succeeded at 5:28:28 PM CDT |
| Evidence window | July 15, 2026 through the 5:44 PM CDT post-release drift audit |

The final Netlify publication was a direct atomic deploy and therefore reports
a null `commit_ref`. Its exact-SHA title, the immediately preceding Git-linked
production build from the same commit, byte-identical canonical/immutable
responses, clean source checkout at release, successful exact-SHA CI, and the
immutable tag establish provenance.

This file was finalized after immutable release publication. Its non-runtime
documentation, governance, and test closeout does not redefine or redeploy the
runtime: the immutable tag, release body, Netlify deploy above, and Sites
version above remain the release identity. Netlify's supported `[skip netlify]`
marker preserves that production artifact while public evidence and repository-
governance files advance on `main`.

## Enterprise release evidence matrix

| Requirement | Status | Verification method | Current production evidence |
| --- | --- | --- | --- |
| Public GitHub showcase | Pass | GitHub | Public repository, immutable release, source, tests, rights notices, audio/visual provenance, security policy, contribution guidance, and evidence are available without exposing a secret |
| Pull-request and CI release path | Pass | GitHub + GitHub Actions | PRs #1–#7 passed protected PR/check gates; the exact runtime commit passed release-quality CI and both CodeQL analyses |
| Locked install, lint, strict typecheck, rendered tests, and both production builds | Pass | Local release gate + CI | `npm run verify` passed with 8/8 immutable-release tests; the visual-provenance and two repository-governance regressions extend the maintained gate to 11/11 without changing runtime code |
| Production dependency audit | Pass | npm audit via local gate + CI | 0 production vulnerabilities |
| Local multi-viewport journey suite | Pass | Playwright | 87 checks enumerated; 35 passed, 52 intentional environment/viewport skips, 0 failed at 1440, 390, and 320 widths |
| Deployed Netlify journey suite | Pass | Playwright against production | 87 checks enumerated; 40 passed, 47 intentional environment/viewport skips, 0 failed in 5.6 minutes |
| Exact-final deployment smoke | Pass | Playwright against immutable runtime | 15 checks enumerated; 5 passed, 10 intentional viewport-only skips, 0 failed in 22.7 seconds |
| Post-release drift smoke | Pass | Playwright + HTTP | 5 production checks passed, 1 opt-in live-form check intentionally skipped, 0 failed; all 45 MP3 hashes/cache policies passed again |
| Real Chrome final pass | Pass | Shanto's real Chrome profile | Every visible primary desktop workflow, all five automatic conversations, complete form flow, and 375 × 812 mobile pass completed |
| Default-on conversation | Pass | SSR test + Playwright + real Chrome | Fresh production load exposes `Turn conversation off`; the first ordinary trusted interaction starts the active scene without a dedicated audio CTA |
| Scene-aware automatic playback | Pass | Playwright + real Chrome | All five chapter destinations reported their matching conversation playing; scene transitions did not overlap conversations |
| Visible conversation off/on | Pass | Real Chrome + Playwright | Header, persistent console, and mixer controls stopped and restarted the active scene truthfully |
| Complete stop semantics | Pass | Playwright | Off clears dialogue, ambience, Foley, captions, timers, scheduled nodes, and suspended audio state |
| Cinematic audio inventory | Pass | Manifest/hash test + production HTTP | 45 fingerprinted MP3s, 12,886,180 aggregate bytes, five scenes, five ambience loops, five masters, five dialogue/Foley stems, ten Foley effects, seven original voices, and twenty authored lines |
| Audio quality gates | Pass | FFmpeg analysis + forced alignment | All five masters passed alignment, codec, loudness, peak, dialogue-ducking, and transition checks |
| Runtime privacy | Pass | Request monitoring + source scan | Browsers made only same-origin self-hosted media requests; no ElevenLabs endpoint, provider voice ID, credential, or visitor data left the site |
| Visual provenance | Pass | Public manifest + hash regression | Five original project-specific tableaux, five AVIF derivatives, social art, and icons have documented dimensions, bytes, SHA-256 hashes, and no-likeness policy |
| Audio/cache integrity | Pass | Netlify and authenticated Sites HTTP | Representative MP3 was `audio/mpeg`, 721,650 bytes, SHA-256 `8234ba09ffb9e751b6818706e8ec27ffd52e046fb5d6f675fa87b30678dff1f2`, and immutable for one year on both hosts |
| Streaming range behavior | Pass / host variance | Direct HTTP | Netlify returned `206`, the exact requested 1,024-byte range, and `Content-Range: bytes 0-1023/721650`; private Sites normalized Range to a cached full-file `200`; integrity and playback passed on both |
| Production route and media availability | Pass | Playwright + direct HTTP | Root, robots, sitemap, metadata, designed 404, scene imagery, and all 45 audio assets passed on canonical and immutable Netlify URLs |
| Desktop and mobile layout | Pass | Real Chrome + Playwright | Real Chrome passed desktop and 375 × 812 mobile; automation passed 390 and 320 layouts |
| Console, page, and request errors | Pass | Real Chrome + Playwright monitors | Site-origin Chrome warnings/errors: 0; automation found 0 relevant console errors, page errors, non-aborted failed requests, or unexpected same-origin failures |
| Security headers and CSP | Pass | Direct production header inspection | Both hosts returned nine policies: CSP, HSTS, frame denial, nosniff, referrer, permissions, COOP, CORP, and cross-domain policy; Netlify's platform-normalized one-year HSTS remains present with `includeSubDomains` and `preload` |
| Production form workflow | Pass | Real Chrome + Playwright + Netlify backend | Validation, every field, consent, submit, success, and close passed; Netlify persisted receipt `6a57ee9ced4a29c630336246` as record #8 at 3:33:32 PM CDT |
| Application APIs/backend completion | Pass | Netlify backend/API | Form delivery was verified in the persisted backend, not inferred from success UI |
| Private Sites publication | Pass | Sites deployment API + authenticated HTTP | Exact-source version 13 remains private to 1 user / 0 groups; unauthenticated root is `401/no-store`; authenticated routes, headers, media bytes, hashes, and cache pass |
| App auth, login, and logout | N/A | Architecture/UI inventory | The application has no account system; private Sites uses a host-level owner gate |
| Password-manager behavior | N/A | DOM/workflow inventory | No password field or password workflow exists |
| Runner jobs, queue, cron, background tasks | N/A | Architecture review | The product has no runner, queue, cron, or background task; the applicable form backend is verified separately |
| Credential hygiene | Pass | Key-pattern scan + Git inventory + GitHub security | No provider key, private key, `.env`, PEM, or secret file is tracked; provider-pattern secret scanning and push protection are enabled; open secret alerts: 0 |

Intentional Playwright skips are production-only, viewport-duplicate, local-
only, or opt-in live-form boundaries. They are counted explicitly and are not
failures. Production verification does not create a second live inquiry unless
the dedicated flag is set.

## Real Chrome control inventory

| Area | Controls and workflow verified | Result |
| --- | --- | --- |
| Global navigation | Wordmark, index open/close, all five chapters, previous/next navigation, footer return | Pass |
| Motion and case state | Pause/resume motion, Case Notes open/close, seven observations, clear notes | Pass |
| Default-on conversation | Initial on state, first ordinary-interaction unlock, scenes 01–05, header off/on | Pass |
| Sound console and mixer | Persistent off/on, open/close, master/atmosphere/dialogue sliders, replay, caption dismissal | Pass |
| Story interactions | Begin, evidence inspection, telegram, route, horse/hansom transition, inspection light, four clue controls | Pass |
| Reference and deduction | Four book tabs/panels, all three choices, reveal, replay case | Pass |
| Field notes | All five disclosure controls | Pass |
| Commission workflow | Both CTAs, both close paths, validation, every field, project selection, consent, submit, success close | Pass |
| Mobile 375 × 812 | Index, sound off/on, navigation, mixer, responsive artwork/copy/control composition | Pass |

The Chrome profile emitted third-party wallet-extension messages. Filtering to
the production site origin returned zero warnings and zero errors. The only
source changes after the exhaustive real-Chrome pass were offline provider-
tool hardening, tests, and a development-only parser dependency; browser
runtime code and shipped assets were unchanged. The exact final runtime then
passed Playwright, HTTP, header, and media-integrity verification.

## Repository and supply-chain controls

- `main` requires the release-quality job plus CodeQL Actions and JavaScript/
  TypeScript analyses, with strict/admin enforcement, pull requests, linear
  history, and conversation resolution. Force pushes and deletion are disabled.
- Actions are limited to GitHub-owned, SHA-pinned actions. The workflow token
  is read-only and cannot approve pull requests.
- Fourteen CodeQL findings were fixed. Two centralized offline provider-write
  findings were reviewed and dismissed as documented false positives only
  after origin/schema/size/path validation, mode-0600 exclusive temporary
  files, `fsync`, and atomic replacement were implemented and tested.
- Private vulnerability reporting, immutable releases, provider-pattern secret
  scanning, push protection, Dependabot security updates, and automated fixes
  are enabled. Open CodeQL, Dependabot, and secret-scanning alerts: 0.
- Generic non-provider secret patterns and general validity checks require
  GitHub Secret Protection on an eligible Team/Enterprise organization and are
  not available to this user-owned repository's current plan. They are not
  misreported as enabled.
- Weekly Dependabot version maintenance uses peer-aware React and Vite/RSC npm
  groups with custom new-release cooldowns. GitHub Actions use GitHub's default
  cooldown. All major npm and Action upgrades remain intentionally manual and
  must pass the full release gate.

## Rights and safety disposition

- Seven original, non-celebrity Victorian performances use no actor recording,
  clone, name, sample, or likeness.
- Seven short public-domain Arthur Conan Doyle echoes are visibly attributed to
  primary Wikisource texts; surrounding case dialogue is original.
- Five project-specific, AI-assisted scene compositions and their derivatives
  contain no third-party photography, franchise mark, copied cover, or screen-
  adaptation asset; exact provenance is in [`visual-assets.md`](./visual-assets.md).
- Smoking is non-promotional historical context. The site contains a tobacco-
  harm notice and an independent/unofficial adaptation disclosure.

## Final disposition

**PASS.** The immutable v1.2.0 runtime has current evidence for every applicable
public-source, production-hosting, default-on cinematic audio, real-Chrome,
responsive, accessibility, backend, dependency, header, media-integrity, CI,
CodeQL, repository-protection, rights, and credential-hygiene gate. The only
documented host variance is Sites' cached full-file `200` for Range requests
versus Netlify's byte-range `206`; playback and exact content integrity pass on
both.
