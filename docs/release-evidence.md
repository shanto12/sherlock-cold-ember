# Release evidence — The Cold Ember v1.2.0

This public record covers the cinematic-audio v1.2.0 application runtime
verified on July 15, 2026 in America/Chicago. It intentionally contains no
deployment credential, browser secret, private email address, or provider key.

## Release identity

| Field | Verified value |
| --- | --- |
| Release | `v1.2.0` |
| Verified application commit | `7ddcd9cede5e74a02a9f032c27663e76a3be17c2` |
| Public source | https://github.com/shanto12/sherlock-cold-ember |
| Feature and hardening PRs | #1 default-on cinematic audio; #2 static cache policy; #3 generated Sites routing guard; #4 verified Sites Worker cache adapter |
| Exact-main GitHub Actions | Run `29450552670` — success; job `Lint, test, build, and audit`; 0 annotations |
| Netlify production | https://sherlock-cold-ember.netlify.app — deploy `6a57f5d3dd7fdd0496d11e44` |
| Netlify immutable deploy | https://6a57f5d3dd7fdd0496d11e44--sherlock-cold-ember.netlify.app |
| Private Sites parity | https://the-cold-ember-casebook.shanto.chatgpt.site — version 11 `appgprj_6a57a5a66324819181d4c4a018e4fd5f~appgver_46e1015321b88191bbebc6b84812ed43`; deploy `appgdep_6a57f61d4abc8191aae71dabe33fb202` succeeded |
| Source parity | Netlify deploy title and Sites version source both identify the exact verified commit above; local HEAD and `origin/main` matched |
| Evidence window | July 15, 2026 through 4:32:54 PM CDT |

The Netlify deployment was a direct production publish, so Netlify reports a
null `commit_ref`. Provenance is established by its exact-SHA deploy title,
the clean local checkout, `origin/main`, the successful exact-main CI run,
and byte-identical canonical/immutable production responses.

## Enterprise release evidence matrix

| Requirement | Status | Verification method | Current production evidence |
| --- | --- | --- | --- |
| Public GitHub showcase | Pass | GitHub | Repository, source, tests, audio inventory, rights notice, provenance, and this evidence record are public; no secret is tracked |
| Pull-request and CI release path | Pass | GitHub + GitHub Actions | PRs #1–#4 passed before merge; exact-main run `29450552670` succeeded with 0 annotations |
| Locked install, lint, strict typecheck, rendered tests, and both production builds | Pass | Local release gate + CI | `npm run verify` passed; the final Sites adapter raised the rendered suite to 8/8 passing tests |
| Production dependency audit | Pass | npm audit via local gate + CI | 0 production vulnerabilities |
| Local multi-viewport journey suite | Pass | Playwright | 87 checks enumerated; 35 passed, 52 intentional environment/viewport skips, 0 failed at 1440, 390, and 320 widths |
| Deployed Netlify journey suite | Pass | Playwright against the production URL | 87 checks enumerated; 40 passed, 47 intentional environment/viewport skips, 0 failed in 5.6 minutes |
| Real Chrome final pass | Pass | Shanto's real Chrome profile | Full desktop control inventory, 375 × 812 mobile pass, exact-final default-on smoke, and site-origin console inspection completed |
| Default-on conversation | Pass | SSR test + Playwright + real Chrome | Fresh production load exposes `Turn conversation off`; the first ordinary interaction starts the active scene without a dedicated audio CTA |
| Scene-aware automatic playback | Pass | Playwright + real Chrome | All five index destinations reported their matching scene conversation as playing |
| Visible conversation off/on | Pass | Real Chrome + Playwright | Header, persistent console, and mixer controls stopped and restarted the active scene truthfully |
| Complete stop semantics | Pass | Playwright | Off clears dialogue, ambience, Foley, captions, timers, scheduled nodes, and suspended context state |
| Cinematic audio inventory | Pass | Manifest/hash test + production HTTP | 45 fingerprinted MP3 files, 12,886,180 aggregate bytes, five scenes, five ambience loops, five masters, five dialogue/Foley stems, ten Foley effects, seven character voices, and twenty authored lines |
| Audio quality gates | Pass | FFmpeg analysis + forced alignment | All five masters passed alignment, codec, loudness, and peak checks; dialogue ducking and clean scene transitions passed |
| Runtime privacy | Pass | Production request monitoring + source scan | Browser made only same-origin self-hosted audio requests; no ElevenLabs, provider endpoint, provider voice ID, credential, or visitor data left the site |
| Audio/cache integrity | Pass | Netlify and authenticated Sites HTTP | Representative MP3 was `audio/mpeg`, 721,650 bytes, SHA-256 `8234ba09ffb9e751b6818706e8ec27ffd52e046fb5d6f675fa87b30678dff1f2`, and immutable for one year on both hosts |
| Streaming range behavior | Pass / host variance | Direct HTTP | Canonical Netlify returned `206`, `Accept-Ranges: bytes`, and the exact requested 1,024-byte range; private Sites normalized Range to a cached full `200` response |
| Production route and media availability | Pass | Playwright + direct HTTP | Root, metadata routes, 404 recovery, scene imagery, and all 45 audio assets passed |
| Desktop and mobile layout | Pass | Real Chrome + Playwright | 1440 desktop and 375 real-Chrome mobile captures passed; automated 390 and 320 layouts passed |
| Console and page errors | Pass | Real Chrome + Playwright monitors | 0 site-origin warnings/errors in real Chrome; 0 relevant console errors, page errors, non-aborted failed requests, or unexpected same-origin HTTP failures in production automation |
| Security headers and CSP | Pass | Direct production header inspection | Both hosts returned all eight required policies, including CSP with `media-src 'self'` and `script-src-attr 'none'`, HSTS, `autoplay=(self)`, frame denial, nosniff, referrer policy, COOP, and CORP |
| Production form workflow | Pass | Real Chrome + Playwright + Netlify backend | Required-field validation, every field, consent, submit, success, and close passed; backend recorded real-Chrome submission `6a57ee9ced4a29c630336246` as record #8 at 3:33:32 PM CDT |
| Application APIs/backend completion | Pass | Netlify backend/API | Form delivery was confirmed in Netlify's persisted backend, not inferred from success UI |
| Private Sites publication | Pass | Sites deployment API + authenticated HTTP | Exact-source version 11 succeeded, owner-only access remained 1 user / 0 groups, root security passed, and exact audio bytes/hash/cache passed |
| App auth, login, and logout | N/A | Architecture and UI inventory | The application has no app-level account system; the private Sites owner gate is host-level access |
| Password-manager behavior | N/A | DOM and workflow inventory | There is no password field or password workflow |
| Runner jobs, queue, cron, background tasks | N/A | Architecture review | The product has no runner, queue, cron, or background task workflow |
| Credential hygiene | Pass | Key-pattern scan + Git inventory + GitHub security | No provider key, private key, `.env`, PEM, or secret file is tracked; secret scanning and push protection are enabled |

Intentional Playwright skips are production-only, viewport-only, or
opt-in-live-form boundaries. They are counted explicitly and are not failures.
The final production suite does not create another live submission unless its
dedicated environment flag is set. The remote-production profile uses one
worker and a 180-second journey budget to avoid false timing failures under
high local system load; local and CI verification retain two workers and a
90-second journey budget.

## Real Chrome control inventory

The following controls were exercised against the deployed Netlify URL through
Shanto's real Chrome profile:

| Area | Controls and workflow verified | Result |
| --- | --- | --- |
| Global navigation | Wordmark return, index open/close, all five chapter destinations, previous/next scene navigation, footer return | Pass |
| Motion and case state | Pause/resume motion, Case Notes open/close, seven recorded observations, clear notes | Pass |
| Default-on conversation | Initial on state, first ordinary-interaction unlock, automatic playback in scenes 01–05, header off/on | Pass |
| Sound console and mixer | Persistent off/on, mixer open/close, master/atmosphere/dialogue sliders, replay active scene, caption dismissal | Pass |
| Hero and opening scene | Begin inquiry, inspect evidence | Pass |
| Telegram and passage | Telegram read/fold, route clue, horse/hansom scene transition | Pass |
| Inspection scene | Inspection light on/off; footprint, ash, blue glass, and brass latch controls | Pass |
| Reference archive | All four book tabs and their matching panels | Pass |
| Deduction | All three choices, Holmes reveal, replay case | Pass |
| Field notes | All five disclosure controls | Pass |
| Commission workflow | Both CTAs, both dialog close paths, required-field validation, all fields, project selector, consent, submit, success close | Pass |
| Mobile 375 × 812 | Index, sound off/on, scene navigation, mixer, responsive artwork/copy/control composition | Pass |

The real-Chrome log contained browser-extension warnings from a third-party
wallet extension. Filtering to the production site origin returned zero
warnings and zero errors; the extension messages are not application findings.

## Cinematic audio evidence

| Requirement | Status | Evidence |
| --- | --- | --- |
| Original performances | Pass | Seven distinct non-celebrity Victorian character voices; no actor recording, clone, name, sample, or likeness |
| Layered sound design | Pass | Rain, fire, telegram, paper, clock, room tone, footstep, glass, morning bell, horse, hoof rhythm, wet wheels, carriage creak, and wind are mixed by scene |
| Canonical dialogue safety | Pass | Seven brief public-domain echoes are visibly source-linked; the surrounding case and dialogue are original |
| Browser autoplay contract | Pass | Conversation preference is on by default; audible playback waits only for the first trusted ordinary interaction required by browser policy |
| Accessibility | Pass | Timed speaker captions, dismiss control, reduced-motion independence, visibility cleanup, decode/play fallback, and device-voice fallback remain available |
| Production isolation | Pass | ElevenLabs was used only offline; visitor browsers never contact it |
| Secret storage | Pass | Provider credential is outside the repository and absent from every generated asset and production bundle |

## Responsive, accessibility, and safety disposition

- Keyboard, touch, and pointer journeys; dialogs; tabs; radios; sliders;
  pressed/expanded states; form validation; caption live regions; and reduced
  motion all passed.
- The non-graphic mystery imagery, public-domain source notes, non-promotional
  tobacco warning, unofficial-adaptation disclosure, and produced-audio reuse
  restrictions remain visible and documented.
- GitHub vulnerability alerts, Dependabot security updates, automated security
  fixes, secret scanning, and push protection are enabled with zero open
  Dependabot or secret-scanning alerts during this evidence window.
- App-level authentication, password management, and background runners are
  explicitly N/A, not silently treated as passed.

## Closeout boundary

This record identifies the exact verified application commit. The commit
containing this evidence file changes documentation only. After it merges, both
hosts are rebuilt from that evidence commit and receive an exact-source smoke
check; the immutable tag, final deployment identifiers, branch protection, and
release closeout are recorded in the public GitHub `v1.2.0` release.

## Runtime verification disposition

**PASS.** The Cold Ember v1.2.0 meets the applicable production release gates
for default-on scene conversations, original cinematic sound, public source,
Netlify production, private Sites parity, desktop/mobile interaction,
accessibility, security, credential hygiene, and backend form delivery. The
only documented host variance is that private Sites returns a full cached
`200` for Range requests while canonical Netlify supplies byte-range
`206`; playback and exact-byte integrity pass on both.
