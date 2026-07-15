# Release evidence — The Cold Ember v1.1.0

This record covers the verified v1.1.0 runtime as of July 15, 2026 in America/Chicago. It contains no deployment credentials, cookies, personal email addresses, or private form contents.

> Release state: the application runtime is verified on both production hosts from the same exact source commit. The final evidence-only commit, parity redeploys, final smoke checks, tag, and GitHub release are intentionally not claimed here; those closeout steps follow this record.

## Release identity

| Field | Verified value |
| --- | --- |
| Release candidate | `v1.1.0` |
| Runtime source commit | `eec62187fc3a0254441192e0bb3f6d479dc2e467` |
| Public source | `https://github.com/shanto12/sherlock-cold-ember` |
| GitHub Actions | Run `29439165347` — success for the runtime commit |
| Netlify production | `https://sherlock-cold-ember.netlify.app` — deploy `6a57cc1fed7c4dd459b3b8e0` |
| Private Sites production | `https://the-cold-ember-casebook.shanto.chatgpt.site` — version 4 `appgprj_6a57a5a66324819181d4c4a018e4fd5f~appgver_28146451ea9c8191a6d50a4f5d2d565a`; deploy `appgdep_6a57cd040edc8191a330d6cc3d56338a` succeeded |
| Runtime provenance | Netlify and Sites were published from the same exact runtime source commit above |
| Evidence window | July 15, 2026 through 1:26:49 PM CDT |

## Enterprise release evidence matrix

| Requirement | Status | Verification method | Current evidence |
| --- | --- | --- | --- |
| Public GitHub source and CI | Pass | GitHub + GitHub Actions | Public repository is available; run `29439165347` succeeded for runtime SHA `eec62187fc3a0254441192e0bb3f6d479dc2e467` |
| Locked install, lint, strict typecheck, and both production builds | Pass | Local release gate + CI | `npm run verify` completed cleanly, including lint, strict typecheck, Vinext build, Next production build, and repository tests |
| Production dependency audit | Pass | `npm audit --omit=dev` via release gate | 0 vulnerabilities |
| Local multi-viewport journey suite | Pass | Playwright | 33 passed, 42 intentionally skipped, 0 failed |
| Deployed Netlify journey suite | Pass | Playwright against production URL | 37 passed, 38 intentionally skipped, 0 failed |
| Dialogue quotation provenance | Pass | Source-text test + live primary-source requests | 4 tests passed; all 5 primary URLs resolved and all 7 credited lines were present in the linked texts |
| Exact runtime deployed to both hosts | Pass | Git commit + deployment metadata | Netlify deploy and private Sites version 4 both trace to the same runtime source commit |
| Source credential hygiene | Pass | Tracked-source scan + ignore review | No credential material was found in the intended public source; generated host state, logs, and local artifacts remain excluded |
| Netlify production availability | Pass | API/HTTP + Playwright + real Chrome | Production route loaded and the complete deployed interaction journey passed |
| Netlify security headers and CSP | Pass | Production response-header inspection | CSP and the expected browser protections were present, including HSTS, MIME sniffing prevention, frame denial, referrer policy, permissions policy, COOP, and CORP |
| Netlify form delivery — automation | Pass | Playwright + Netlify backend/API | Submission `6a57cd1102c1404bf8ee69ed` was recorded at July 15, 2026, 1:10:25 PM CDT |
| Netlify form delivery — real Chrome | Pass | Shanto's real Chrome profile + Netlify backend/API | Submission `6a57d0e95e5ef9757761ebbe` was recorded as record #5 at July 15, 2026, 1:26:49 PM CDT |
| Desktop every-control pass | Pass | Shanto's real Chrome profile | Every visible primary control and workflow was activated; full control inventory is recorded below |
| Desktop console health | Pass | Shanto's real Chrome profile | Site-origin console warnings: 0; site-origin console errors: 0 |
| Responsive real-Chrome review | Pass | Shanto's real Chrome profile | A 375 × 812 capture verified the responsive layout with the chapter index, sound control, and mixer |
| Responsive automated layouts | Pass | Local and production Playwright | Local suite covered 1440, 390, and 320 widths; deployed production journeys passed in the production suite |
| Private Sites publish | Pass | Sites deployment API | Version 4 deploy `appgdep_6a57cd040edc8191a330d6cc3d56338a` completed successfully and remains owner-only |
| Private Sites headers | Pass | Authenticated HTTP header smoke | Authenticated request returned HTTP 200 with CSP and the expected security headers |
| Private Sites real-Chrome UI rerun | Limited | Shanto's real Chrome profile | Owner access gate and account choice were reached; MFA prevented the private UI journey from being rerun in real Chrome during this evidence window |
| Application auth, login, logout | N/A | Architecture and UI inventory | The application has no app-level account system. The private Sites owner gate is host-level access, not application auth |
| Password-manager behavior | N/A | DOM/control inventory | The application has no password fields or password workflow |
| Backend runner jobs / task workers | N/A | Architecture review | The application has no runner, queue, cron, or background task workflow |
| Applicable backend completion | Pass | Netlify backend/API | Both controlled form submissions were confirmed in Netlify's backend rather than inferred from browser success UI |

## Real Chrome desktop control inventory

The following visible controls and workflows were exercised against Netlify production using Shanto's real Chrome profile:

| Area | Controls and workflow verified | Result |
| --- | --- | --- |
| Global navigation | Wordmark/return, chapter index open/close, all five chapter destinations, previous/next scene navigation | Pass |
| Motion and case state | Pause/resume motion, Case Notes open/close, persisted evidence, clear notes | Pass |
| Cinematic sound | Header sound toggle, scene Hear/Stop controls, fixed sound console, mute/unmute, mixer open/close, mixer start/stop, volume controls, conversation playback, caption dismissal, provenance link | Pass |
| Hero and opening scene | Begin inquiry, inspect evidence, Enter/Hear action | Pass |
| Telegram and route | Telegram read/fold and the one-way route-clue reveal | Pass |
| Inspection scene | Inspection light on/off; footprint, ash, blue glass, and brass latch evidence controls | Pass |
| Reference books | All four book tabs | Pass |
| Conclusion | All three conclusion choices, Holmes reveal, replay | Pass |
| Field notes | All five disclosure controls | Pass |
| Commission workflow | Both inquiry CTAs, dialog close paths, required-field validation, all form controls, consent, submit, success/close | Pass |
| Footer | Footer return path | Pass |

The designed 404 recovery route was verified in the deployed Playwright suite, not in the real-Chrome control inventory above.

## Audio, dialogue, and cinematic verification

| Requirement | Status | Verification method | Evidence |
| --- | --- | --- | --- |
| User-gesture audio start and explicit stop | Pass | Real Chrome + Playwright | Sound began only after interaction and stopped through the visible scene/global controls |
| Five scene soundscapes and conversations | Pass | Playwright + real-Chrome control pass | Scene dialogue start/stop paths and soundscape controls completed without production failures |
| Mixer and persisted volume behavior | Pass | Real Chrome + Playwright | Mixer, channel controls, mute, restart, and zero-volume caption-only behavior were exercised |
| Caption and local speech fallback | Pass | Playwright | Captions remained available when speech was absent, failed, or disabled; active playback lifecycle and cancellation paths passed |
| Hidden-page and navigation cleanup | Pass | Playwright | Timers, sources, speech, and scene playback were cancelled across visibility and navigation transitions |
| Dialogue attribution | Pass | Live source verification | Seven canonical public-domain excerpts were checked against five linked primary Wikisource pages |

## Responsive, accessibility, and production safety

| Requirement | Status | Verification method | Evidence |
| --- | --- | --- | --- |
| Desktop and mobile composition | Pass | Real Chrome + Playwright | Desktop journey completed; real Chrome 375 × 812 capture and automated 390/320 layouts verified the responsive controls |
| Keyboard and accessible state | Pass | Playwright + real Chrome | Navigation, dialogs, tabs, radios, form validation, pressed/expanded states, and caption live-region behavior were exercised |
| Reduced-motion behavior | Pass | Playwright media emulation | Reduced-motion path retained the experience without continuous animation |
| Console errors and warnings | Pass | Real Chrome + Playwright | Real Chrome reported 0 site-origin warnings and 0 site-origin errors; the automated production run completed with 0 failed tests |
| Failed production workflows | Pass | Playwright + backend/API | No failed tested workflow; two independent form deliveries were confirmed in the backend |
| Security policy | Pass | Header inspection | Netlify and authenticated private Sites responses supplied CSP and the expected browser security headers |

## Limitations and closeout boundary

- The private Sites application UI was not manually rerun after its MFA gate in real Chrome. Deployment success, exact source provenance, and authenticated HTTP 200/security headers are verified; the uncompleted private-host manual UI pass is explicitly limited.
- App authentication, logout/login, password-manager behavior, and backend runner jobs do not exist in this product and are marked N/A rather than inferred as passing.
- The v1.1.0 evidence-only commit, final parity redeploys, final smoke verification, immutable tag, and GitHub release occur after this document is committed. Their identifiers must be added to the GitHub release record; this document does not pre-claim them.
- Skipped Playwright cases are intentional scope/viewport/environment skips. The recorded runs contain 0 failures.

## Runtime verification disposition

The v1.1.0 runtime evidence is **PASS** for the public Netlify production deployment and successful private Sites publication, with the private Sites real-Chrome UI rerun explicitly limited by MFA. Release closeout remains pending until the evidence-only commit is published, both hosts are brought to final source parity, final smoke checks and CI succeed, and the immutable `v1.1.0` tag/release are created.
