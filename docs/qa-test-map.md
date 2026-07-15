# Automated QA test map

This map describes the production-oriented Playwright coverage. Browser artifacts are written to `output/playwright/` and should not be committed.

| Requirement | Automated evidence |
| --- | --- |
| Desktop layout | Chromium at 1440 x 1000 |
| Mobile layouts | Chromium at 390 x 844 and 320 x 658 |
| Primary journey | Begin, all five chapter links, full previous/next traversal and boundaries, telegram open/fold, inspection light on/off, every clue, all three conclusions, replay |
| Global controls | Motion pause/resume, case-notes drawer, clear notes, close controls, both commission calls to action |
| Default-on audio policy | Fresh profile is armed by default; no `AudioContext` or audible media before a trusted interaction; the first ordinary click/tap/key starts the active scene without a dedicated audio CTA; one context/player per mounted experience |
| Cinematic audio lifecycle | Five-scene mix changes, hidden-tab suspension and timer release, resume, mute, stop, and complete source/node cleanup |
| Dialogue and captions | All five self-hosted scene masters, changing speakers, authored cue timing, canonical-source links, automatic scene entry, off/on persistence, immediate stop, dismiss, decode/play failure fallback, and persistent caption availability |
| Sound mixer | Master, atmosphere, and dialogue ranges; persisted values; start/stop; close; responsive layout and touch targets |
| Inquiry workflow | Dialog open/close, Escape, focus containment/restoration, validation, field completion, encoded form submission |
| Reduced motion | OS preference, persisted pause state, animation lifecycle |
| Basic accessibility | Landmark/headings, control names, form labels, focus visibility, keyboard activation, image alternatives, touch targets |
| Runtime health | Page errors, browser console errors, failed same-origin requests, unexpected 4xx/5xx responses |
| Routing/SEO and media | Full canonical/Open Graph/X metadata, structured data, robots, sitemap, in-page deep links, designed 404 return, 1200 x 630 social art, and all ten scene assets |
| Production security | HTTPS-only executable resources, full intended CSP directives, HSTS options, clickjacking, MIME, referrer, permissions, cross-origin, and HTML/static/scene cache headers |
| Audio secret/network hygiene | No secret pattern in tracked files, build output, or rendered HTML; `media-src 'self'`; `autoplay=(self)`; no browser request to ElevenLabs or another audio origin; every audio asset returns 200 with an audio MIME type |
| Live Netlify form | Opt-in production submission with `PLAYWRIGHT_LIVE_FORM=1` |
| Responsive safety | Full-section scrolling, decoded scene art, and horizontal-overflow measurements at all three viewports |

The automated suite complements, but does not replace, the required real-Chrome production pass.

Run current production verification with `PLAYWRIGHT_BASE_URL=https://sherlock-cold-ember.netlify.app npm run test:e2e`. Add `PLAYWRIGHT_LIVE_FORM=1` for the single deliberate live-form proof.

## Final local release baseline

July 15, 2026:

- Complete three-viewport regression suite: 87 checks enumerated; 35 passed,
  52 intentional environment/viewport skips, and 0 failed at 1440px, 390px,
  and 320px.
- Final focused browser regression after the CodeQL hardening: 54 checks
  enumerated; 20 passed, 34 intentional skips, and 0 failed in 2.2 minutes.
- TypeScript, ESLint, Vinext build, Next.js build, 8/8 rendered behavior tests,
  live source-text verification, and production npm audit passed with 0
  production vulnerabilities.
- The documentation/governance closeout added one byte-locked visual-provenance
  regression; the complete maintained gate then passed 9/9 tests, both builds,
  and the production audit without changing browser runtime code.
- Dialogue-source live checks: 4/4 passed, proving all five primary source URLs
  resolve and all seven credited excerpts occur in the linked public-domain
  text.

## Final production release baseline

July 15, 2026 through the 5:44 PM CDT post-release drift audit:

- Full Netlify three-viewport suite: 87 checks enumerated; 40 passed, 47
  intentional environment/viewport skips, and 0 failed in 5.6 minutes.
- Exact-final deploy smoke: 15 checks enumerated; 5 passed, 10 intentional
  viewport-only skips, and 0 failed in 22.7 seconds.
- Post-release immutable-runtime check: 5 production checks passed, the one
  opt-in live-form submission was intentionally skipped, and 0 failed. All 45
  audio hashes, MIME types, and cache policies passed again.
- Real Chrome: every visible primary desktop control and workflow, all five
  automatic conversations, the off/on controls and mixer, the complete form,
  and the responsive 375 × 812 view passed. Site-origin warnings/errors: 0.
- The persisted real-Chrome form receipt is
  `6a57ee9ced4a29c630336246`, record #8, at 3:33:32 PM CDT.
- Production security: nine response policies, root/static/scene/404 caching,
  media isolation, CSP, HSTS, clickjacking, MIME, referrer, permissions, and
  cross-origin behavior passed.
- Private Sites parity: version 13 and deployment
  `appgdep_6a58097981108191aba5416bd0a483c3` identify the exact release commit;
  owner-only access, authenticated routes, headers, media bytes, hashes, and
  cache behavior passed.
