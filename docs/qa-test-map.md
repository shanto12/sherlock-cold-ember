# Automated QA test map

This map describes the production-oriented Playwright coverage. Browser artifacts are written to `output/playwright/` and should not be committed.

| Requirement | Automated evidence |
| --- | --- |
| Desktop layout | Chromium at 1440 x 1000 |
| Mobile layouts | Chromium at 390 x 844 and 320 x 658 |
| Primary journey | Begin, all five chapter links, full previous/next traversal and boundaries, telegram open/fold, inspection light on/off, every clue, all three conclusions, replay |
| Global controls | Motion pause/resume, case-notes drawer, clear notes, close controls, both commission calls to action |
| Inquiry workflow | Dialog open/close, Escape, focus containment/restoration, validation, field completion, encoded form submission |
| Reduced motion | OS preference, persisted pause state, animation lifecycle |
| Basic accessibility | Landmark/headings, control names, form labels, focus visibility, keyboard activation, image alternatives, touch targets |
| Runtime health | Page errors, browser console errors, failed same-origin requests, unexpected 4xx/5xx responses |
| Routing/SEO and media | Full canonical/Open Graph/X metadata, structured data, robots, sitemap, in-page deep links, designed 404 return, 1200 x 630 social art, and all ten scene assets |
| Production security | HTTPS-only executable resources, full intended CSP directives, HSTS options, clickjacking, MIME, referrer, permissions, cross-origin, and HTML/static/scene cache headers |
| Live Netlify form | Opt-in production submission with `PLAYWRIGHT_LIVE_FORM=1` |
| Responsive safety | Full-section scrolling, decoded scene art, and horizontal-overflow measurements at all three viewports |

The automated suite complements, but does not replace, the required real-Chrome production pass.

Run current production verification with `PLAYWRIGHT_BASE_URL=https://sherlock-cold-ember.netlify.app npm run test:e2e`. Add `PLAYWRIGHT_LIVE_FORM=1` for the single deliberate live-form proof.

## Latest local baseline

July 15, 2026 at 10:43 AM CDT:

- Complete three-viewport suite: 18 passed, 18 intentionally skipped production-only or duplicate-viewport checks, 0 failed in 2.0 minutes
- Focused warmed-server desktop rerun for the expanded journey, dialog, metadata, assets, and designed 404 coverage: 5 passed
- TypeScript and focused ESLint: passed with zero findings
- Production security and live Netlify form checks: pending the public production deployment
