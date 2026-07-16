# Release evidence — The Cold Ember v1.3.0

This public record covers the immutable ink-glass v1.3.0 runtime, verified July
15, 2026 in America/Chicago. It contains no deployment credential, browser
secret, private email address, provider key, or provider voice identifier.

## Final release identity

| Field | Verified value |
| --- | --- |
| Immutable release | [`v1.3.0`](https://github.com/shanto12/sherlock-cold-ember/releases/tag/v1.3.0), published as the latest release at 10:25:51 PM CDT |
| Runtime source and tag target | [`edfa98b706c72c12c6759383e6d0200cfcd7392b`](https://github.com/shanto12/sherlock-cold-ember/commit/edfa98b706c72c12c6759383e6d0200cfcd7392b) |
| Public source | https://github.com/shanto12/sherlock-cold-ember |
| Runtime pull request | [#12](https://github.com/shanto12/sherlock-cold-ember/pull/12) — translucent story surfaces, merged through the protected branch at the exact runtime tree |
| Pull-request release-quality CI | [Run `29467659777`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29467659777) — success before merge |
| Pull-request CodeQL | [Run `29467659057`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29467659057) — Actions and JavaScript/TypeScript succeeded before merge |
| Runtime release-quality CI | [Run `29467833061`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29467833061) — success on the exact runtime SHA at 10:02:12 PM CDT |
| Runtime CodeQL | [Run `29467832924`](https://github.com/shanto12/sherlock-cold-ember/actions/runs/29467832924) — Actions and JavaScript/TypeScript succeeded on the exact runtime SHA at 9:59:14 PM CDT |
| Netlify production | https://sherlock-cold-ember.netlify.app — deploy `6a5848ba955ac500087d319f`, published at 9:58:36 PM CDT |
| Netlify immutable deploy | https://6a5848ba955ac500087d319f--sherlock-cold-ember.netlify.app |
| Private Sites parity | https://the-cold-ember-casebook.shanto.chatgpt.site — version 14 `appgprj_6a57a5a66324819181d4c4a018e4fd5f~appgver_1bd1e44bf6988191a950e75c279188da`; deploy `appgdep_6a584a1d70c08191af8e333eb970f2ba` succeeded at 10:04:44 PM CDT |
| Evidence window | July 15, 2026 through immutable release publication at 10:25:51 PM CDT |

The Git-linked Netlify deployment reports `commit_ref`
`edfa98b706c72c12c6759383e6d0200cfcd7392b`. Its canonical and immutable
aliases, exact-source CI, exact Sites version, annotated tag target, and
immutable GitHub release therefore agree on one browser runtime.

This evidence file is a documentation closeout. Merging it with a supported
`[skip netlify]` commit does not redefine or redeploy the runtime: the tag,
release, Netlify deploy, and Sites version above remain the v1.3.0 identity.
The v1.2.0 cinematic-audio baseline remains independently preserved in
[`release-evidence.md`](./release-evidence.md).

## Enterprise release evidence matrix

| Requirement | Status | Verification method | Current production evidence |
| --- | --- | --- | --- |
| Public GitHub showcase | Pass | GitHub | Public source, immutable latest release, tests, design contract, rights notices, provenance, security policy, contribution guidance, and this evidence are recruiter-visible without exposing a secret |
| Pull-request and CI release path | Pass | GitHub + GitHub Actions | PR #12 passed release-quality and both CodeQL gates before merge; the exact merged runtime then passed release-quality run `29467833061` and CodeQL run `29467832924` |
| Exact release provenance | Pass | Git, GitHub, Netlify, and Sites | Annotated tag `v1.3.0`, immutable release, Netlify `commit_ref`, and Sites version 14 resolve to runtime `edfa98b706c72c12c6759383e6d0200cfcd7392b` |
| Locked install, lint, strict typecheck, rendered tests, and both production builds | Pass | Exact-source local release gate + CI | `npm run verify` passed ESLint, strict TypeScript, the Vinext/Sites build, the Next.js/Netlify build, and 13/13 maintained source/render tests |
| Production dependency audit | Pass | npm audit via local gate + CI | 0 production vulnerabilities |
| Local multi-viewport journey suite | Pass | Playwright | 90 checks enumerated; 38 passed, 52 intentional environment/viewport skips, and 0 failed at 1440px, 390px, and 320px |
| Deployed Netlify journey suite | Pass | Playwright against canonical production | 90 checks enumerated; 43 passed, 47 intentional environment/viewport skips, and 0 failed in 6.1 minutes |
| Targeted deployed translucency smoke | Pass | Playwright against the exact deployed artifact | 3/3 ink-glass checks passed |
| Real Chrome final pass | Pass | Shanto's real Chrome profile | Every visible primary desktop control and workflow passed, followed by a responsive 390 × 844 mobile control and composition pass against canonical production |
| Ink-glass visual treatment | Pass | Source regression + Playwright + real Chrome | All five desktop story panels used bounded directional translucent gradients; fixed cinematic artwork remained visible while scrolling; copy, labels, controls, borders, and focus indicators remained fully opaque |
| Mobile visual treatment | Pass | Playwright + real Chrome | All five 4:5 scene images decoded above their copy at 390 and 320 widths; denser no-blur surfaces did not overlap artwork or overflow horizontally; text opacity remained `1` |
| Reduced-motion and increased-contrast safety | Pass | Source regression + Playwright | Both modes raised surface density and removed blur; reduced motion stopped transitions, increased contrast reached the defined high-density treatment, and navigation remained usable |
| Default-on conversation | Pass | SSR test + Playwright + real Chrome | Fresh production exposed `Turn conversation off`; the first ordinary trusted interaction started the active scene without a dedicated audio CTA |
| Scene-aware automatic playback | Pass | Playwright + real Chrome | All five chapter destinations loaded the matching conversation; transitions did not overlap scenes and off stopped the active experience |
| Visible conversation off/on | Pass | Real Chrome + Playwright | Header and mixer controls stopped and restarted the active scene truthfully; captions and control state followed the sound state |
| Sound mixer and cinematic controls | Pass | Real Chrome + Playwright | Open/close, master/atmosphere/dialogue sliders, replay, conversation off/on, caption dismissal, and responsive mixer layout passed |
| Cinematic audio integrity | Pass | Manifest/hash regression + production HTTP | The locked 45-file same-origin audio inventory retained its expected hashes, audio MIME types, cache policies, and scene mappings; no v1.3 visual change altered the v1.2 performance masters |
| Production routes and media | Pass | Playwright + direct HTTP | Canonical and immutable root, robots, sitemap, designed 404, scene imagery, and representative audio succeeded; checked canonical/immutable documents and media matched the release artifact |
| Desktop and mobile layout | Pass | Real Chrome + Playwright | Real Chrome passed desktop and 390 × 844 mobile; automation also covered 1440, 390, and 320 widths with decoded art, safe copy ordering, and no horizontal overflow |
| Console and page errors | Pass | Real Chrome + Playwright monitors | Production site-origin Chrome warnings/errors: 0; six recorded warnings were traced only to an installed wallet extension and kept separate from site evidence; Playwright reported 0 page errors or relevant console errors |
| Failed network and HTTP requests | Pass | Playwright request/response monitoring + direct HTTP | Current canonical-production automation found 0 non-aborted failed requests and 0 unexpected same-origin failures; this network claim is automation/direct-HTTP evidence, while real Chrome supplied the manual interaction and console pass |
| Preview-toolbar isolation | Pass | Playwright log provenance | A Netlify deploy-preview toolbar produced its own frame and device-permission messages; those platform-injected preview messages did not occur on canonical production and are not counted as application errors |
| Security headers and CSP | Pass with documented host variance | Direct production header inspection + Playwright | Canonical and immutable Netlify returned CSP, HSTS, frame denial, nosniff, referrer, permissions, COOP, CORP, and cross-domain policies; the active CSP restricts media/connect/form traffic to the site and denies frames/objects |
| Netlify HSTS normalization | Pass with documented discrepancy | Direct canonical and immutable HTTP | Source requests a two-year `max-age=63072000`; Netlify currently returns its platform-normalized one-year `max-age=31536000; includeSubDomains; preload`. HSTS remains active on both aliases, and the returned production value is recorded rather than misreported as the configured value |
| Production form workflow | Pass | Real Chrome + Playwright + Netlify backend | Empty-submit validation, every field, project selection, consent, submit, success, and close passed; Netlify persisted synthetic receipt `6a584c9d931816d075094dae` as record #9 at 10:14:37 PM CDT |
| Applicable API/backend completion | Pass | Netlify backend/API | The inquiry was confirmed in persisted Netlify form data, not inferred from the browser success message |
| Private Sites publication | Pass | Sites deployment API + authenticated HTTP | Exact-source version 14 remains limited to 1 user / 0 groups; unauthenticated root is `401/no-store`; deployment `appgdep_6a584a1d70c08191af8e333eb970f2ba` succeeded, and authenticated root/headers passed while representative image SHA-256 `4aa41ff5329c15ff10a0ba2225e7928b2478dd8db2e1a432c2f0af8a5652f214` and audio SHA-256 `ea99e129003a2b255cee20c87884afc7888e38470b4c9d48d5d7ee50066fb74f` matched the checked-in files |
| App auth, login, and logout | N/A | Architecture/UI inventory | The public application has no account system; private Sites uses a host-level owner gate rather than application login/logout controls |
| Password-manager behavior | N/A | DOM and real-Chrome workflow inventory | No password field or password workflow exists, so there was no password-manager interaction to exercise |
| Runner jobs, queue, cron, background tasks | N/A | Architecture review | The product has no runner, job queue, cron, or background task; the applicable form backend is verified separately |
| Credential hygiene | Pass | Key-pattern/source/build review + Git inventory | No provider key, private key, `.env`, PEM, deployment credential, private address, or provider voice identifier is tracked or shipped; production audio and images are self-hosted |
| Rights and attribution | Pass | Public provenance and source review | Original non-celebrity Victorian performances use no actor recording, clone, sample, or likeness; short public-domain Arthur Conan Doyle echoes are attributed to primary texts; visual assets are project-specific and documented |

Intentional Playwright skips are production-only, viewport-duplicate,
local-only, or opt-in live-form boundaries. They are counted explicitly and
are not failures. The production form proof was made deliberately once in real
Chrome and verified in the backend rather than duplicated by the ordinary
automation run.

## Real Chrome control inventory

| Area | Controls and workflow verified | Result |
| --- | --- | --- |
| Global navigation | Wordmark, index open/close, all five chapter destinations, previous/next navigation, and footer return to beginning | Pass |
| Motion and case state | Pause/resume motion, Case Notes open/close, observation state, clear notes, and replay reset | Pass |
| Default-on conversation | Initial on state, first-interaction unlock, scenes 01–05, header off/on, and active-scene status | Pass |
| Sound mixer | Open/close, master/atmosphere/dialogue sliders, replay active scene, conversation off/on, and caption dismissal | Pass |
| Story interactions | Begin Inquiry, telegram open/fold, route clue, evidence inspection, inspection light on/off, and all four clue controls | Pass |
| Reference and deduction | All four book tabs, all three deduction choices, correct reveal, case close, and replay case | Pass |
| Field notes | All five disclosure controls | Pass |
| Commission workflow | Both calls to action, close button, Escape close, empty validation, every field, project selection, consent, submit, persisted success, and success close | Pass |
| Mobile 390 × 844 | Index, conversation off/on, chapter navigation, mixer, inline artwork, story copy, controls, and horizontal safe-area composition | Pass |

The real-Chrome profile contained an installed wallet extension. Its six
warnings were isolated by source and reported separately; filtering to
`https://sherlock-cold-ember.netlify.app` returned zero warnings and zero
errors. Request-failure evidence came from the current Playwright production
run and direct HTTP checks, not from a hidden claim that real Chrome exposed a
network inspector to the release harness.

## Ink-glass accessibility disposition

- Desktop chapter copy uses directional glass: strongest behind the reading
  edge and progressively clearer away from text, so the fixed image remains
  present during scrolling without placing unprotected text over it.
- Evidence, reference, deduction, field-note, commission, and scene-navigation
  surfaces use progressively denser semantic tokens according to text size and
  interaction risk.
- Translucency is applied to surface backgrounds, never to container `opacity`;
  text, controls, borders, and focus indicators resolve at opacity `1`.
- At 860px and below, each scene becomes an inline 4:5 image followed by a
  denser no-blur copy surface. Reduced-motion and increased-contrast modes also
  raise density and remove blur.
- Existing keyboard, touch, safe-area, caption, mixer, form, and scene-state
  behavior remained intact under the new visual system.

## Repository and supply-chain controls

- `main` requires the release-quality job plus CodeQL Actions and JavaScript/
  TypeScript analyses, with strict/admin enforcement, pull requests, linear
  history, and conversation resolution. Force pushes and deletion are disabled.
- Actions remain limited to GitHub-owned, SHA-pinned actions with a read-only
  workflow token. The exact v1.3.0 runtime passed both protected PR checks and
  both post-merge runtime workflows.
- Production dependencies passed the locked install and audit with 0
  vulnerabilities. The new surface contract is guarded by maintained source,
  rendered, desktop, mobile, reduced-motion, and increased-contrast tests.
- Provider-pattern secret scanning and push protection remain enabled. No
  credential, private browser/profile value, or local provider secret is
  present in the repository, browser bundle, Netlify artifact, Sites artifact,
  or visitor request path. Current open CodeQL, Dependabot, and secret-scanning
  alert counts are all 0.

## Rights and safety disposition

- Seven original, non-celebrity Victorian performances use no actor recording,
  clone, name, sample, or likeness.
- Seven short public-domain Arthur Conan Doyle echoes are visibly attributed to
  primary Wikisource texts; surrounding case dialogue is original.
- Five project-specific, AI-assisted scene compositions and their derivatives
  contain no third-party photography, franchise mark, copied cover, or screen-
  adaptation asset; exact provenance is in
  [`visual-assets.md`](./visual-assets.md).
- Smoking remains non-promotional historical context. The site retains its
  tobacco-harm notice and independent/unofficial adaptation disclosure.

## Final disposition

**PASS.** The immutable v1.3.0 runtime has current evidence for every applicable
public-source, protected-CI, exact-deployment, translucent-surface,
accessibility-fallback, default-on cinematic-audio, real-Chrome, responsive,
backend, dependency, header, CSP, route, network, console, media-integrity,
rights, and credential-hygiene gate. Auth/login/logout, password-manager, and
runner-job checks are explicitly N/A because those features do not exist. The
only documented production variance is Netlify's one-year HSTS normalization
of the repository's two-year request; HSTS remains correctly active with
`includeSubDomains` and `preload` on both production aliases.
