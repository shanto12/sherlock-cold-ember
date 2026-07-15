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

## Latest local baseline

July 15, 2026 at 1:05 PM CDT:

- Cinematic-audio coverage inside the complete run: 15 passed, 24 intentionally skipped duplicate desktop-only checks, 0 failed across 1440px, 390px, and 320px
- Complete three-viewport regression suite: 33 passed, 42 intentional local skips (production-only or duplicate desktop checks), 0 failed
- TypeScript, ESLint, Vinext build, Next.js build, rendered tests, live source-text verification, and production npm audit: passed; 0 production vulnerabilities
- Dialogue-source live checks: 4 passed, proving all 5 primary source URLs resolve and all 7 credited excerpts occur in the linked public-domain text

## Latest production baseline

July 15, 2026 at 1:35 PM CDT:

- Netlify three-viewport production suite: 37 passed, 38 intentional duplicate/local-only skips, 0 failed in 2.0 minutes
- Controlled Netlify form proofs: automated submission `6a57cd1102c1404bf8ee69ed` and real-Chrome submission `6a57d0e95e5ef9757761ebbe` were both confirmed through the Forms API
- Real Chrome: every primary desktop control and workflow was exercised, all five character conversations were sampled with live captions, and the responsive 375 x 812 view was checked with its index and sound mixer
- Runtime health: 0 site-origin Chrome warnings/errors, 0 Playwright page/console failures, and 0 unexpected same-origin request failures
- Production security: root, static asset, and 404 caching plus CSP, HSTS, clickjacking, MIME, referrer, permissions, and cross-origin headers passed
- Private Sites parity: the exact runtime commit returned authenticated HTTP 200 with its hardened headers; the owner-only browser gate reached OpenAI MFA as designed, so private-runtime UI interaction is evidenced by exact-source parity and authenticated API smoke rather than a second Chrome journey
