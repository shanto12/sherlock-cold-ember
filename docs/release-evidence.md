# Release evidence — The Cold Ember

This is the auditable release record for the public production build. A row is complete only when the evidence comes from the current production commit and deployment. Do not publish a release while any required row is pending or failed.

## Release identity

| Field | Value |
| --- | --- |
| Release | `v1.0.0` |
| Git commit | Pending |
| Public GitHub repository | Pending |
| GitHub Actions run | Pending |
| Netlify production URL | `https://sherlock-cold-ember.netlify.app` |
| Netlify deploy ID | Pending |
| Sites parity URL / version | Pending |
| Verified at (America/Chicago) | Pending |
| Verifier | Pending |

Evidence must not contain deployment tokens, full form-submitter email addresses, cookies, or other secrets.

## Automated release gates

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Locked `npm ci` succeeds | Pending | GitHub Actions | — |
| ESLint succeeds with zero errors | Pending | GitHub Actions / local gate | — |
| Strict TypeScript check succeeds | Pending | GitHub Actions / local gate | — |
| Rendered behavior suite succeeds | Pending | Node test runner | — |
| Vinext/Sites production build succeeds | Pending | Build log | — |
| Next.js/Netlify production build succeeds | Pending | Build log | — |
| Production dependency audit has zero high/critical findings | Pending | `npm audit --omit=dev` | — |
| Tracked-source secret review finds no credential material | Pending | Git history/source review | — |
| Exact Git commit matches both deployments | Pending | Git / Netlify / Sites version | — |

## Current Netlify production behavior

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Home route returns 200 and the release title | Pending | API + real Chrome | — |
| Original scene images return 200 without failed requests | Pending | Network log / API | — |
| `robots.txt` returns 200 and points to the sitemap | Pending | API | — |
| `sitemap.xml` returns 200 and contains the canonical URL | Pending | API | — |
| Intentional unknown route returns the designed 404 | Pending | API + real Chrome | — |
| Open Graph image is 1200 × 630 and returns 200 | Pending | API / image inspection | — |
| Canonical, title, description, OG, and X metadata are correct | Pending | Rendered HTML / API | — |
| Netlify recognizes the `consultation` form | Pending | Netlify form dashboard/API | — |
| Valid form submission reaches Netlify and completes | Pending | Real Chrome + Netlify submission log | — |
| Invalid form is blocked with accessible field feedback | Pending | Real Chrome + Playwright | — |
| Console has no uncaught errors or CSP violations | Pending | Real Chrome / Playwright | — |
| Network has no failed first-party requests | Pending | Real Chrome / Playwright | — |

## Every-control interaction inventory

Update control labels if implementation wording changes. Each visible control must be activated in the current production deployment.

| Control or workflow | Keyboard | Pointer/touch | Real Chrome | Automation | Result / evidence |
| --- | --- | --- | --- | --- | --- |
| Skip link | Pending | N/A | Pending | Pending | — |
| Begin the inquiry | Pending | Pending | Pending | Pending | — |
| Chapter index open/close and all five chapter links | Pending | Pending | Pending | Pending | — |
| Pause/resume motion and persistence after reload | Pending | Pending | Pending | Pending | — |
| Previous/next scene controls at every boundary | Pending | Pending | Pending | Pending | — |
| Telegram reveal | Pending | Pending | Pending | Pending | — |
| Hansom route / trapdoor clue | Pending | Pending | Pending | Pending | — |
| Crime-room evidence: footprint, ash, blue glass, brass latch | Pending | Pending | Pending | Pending | — |
| Reference-room book tabs and panels | Pending | Pending | Pending | Pending | — |
| All conclusion choices and Holmes reveal | Pending | Pending | Pending | Pending | — |
| Case notes open/close, evidence state, and clear action | Pending | Pending | Pending | Pending | — |
| Replay / return-to-beginning action | Pending | Pending | Pending | Pending | — |
| Inquiry dialog open/close/cancel | Pending | Pending | Pending | Pending | — |
| Inquiry fields, select, consent, honeypot, and submit | Pending | Pending | Pending | Pending | — |
| Footer navigation and external/source links | Pending | Pending | Pending | Pending | — |

## Responsive, motion, and accessibility evidence

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Real Chrome desktop pass at 1440 px | Pending | Real Chrome profile | — |
| Real Chrome mobile pass at 390 px | Pending | Real Chrome profile / device emulation | — |
| Narrow layout pass at 320 px | Pending | Real Chrome / Playwright | — |
| Full page, including every lower section, is visually reviewed | Pending | Real Chrome screenshots / manual pass | — |
| No horizontal overflow at 1440, 390, or 320 px | Pending | Browser measurements | — |
| Touch targets and text remain usable at mobile widths | Pending | Real Chrome / Playwright | — |
| Visible focus and logical keyboard order across the journey | Pending | Real Chrome keyboard pass | — |
| Dialog focus is contained, restored, and Escape closes | Pending | Real Chrome / Playwright | — |
| Screen-reader names, landmarks, headings, tabs, and live feedback are valid | Pending | Accessibility tree / axe / manual | — |
| OS reduced-motion produces the composed still edition | Pending | Real Chrome emulation | — |
| Manual pause stops bounded animation and survives reload | Pending | Real Chrome / performance inspection | — |
| Hidden-tab lifecycle pauses Canvas work; no DOM/RAF growth | Pending | Performance / browser inspection | — |

## Headers, CSP, and cache policy

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| CSP is present and permits only the intended first-party experience | Pending | Production response headers | — |
| HSTS is present with two-year max age, subdomains, and preload | Pending | Production response headers | — |
| `nosniff`, `DENY`, referrer, permissions, COOP, and CORP headers are present | Pending | Production response headers | — |
| Next static assets use immutable one-year caching | Pending | Production asset headers | — |
| Scene assets use revalidating bounded caching | Pending | Production asset headers | — |
| HTML is not incorrectly cached as immutable | Pending | Production response headers | — |
| Netlify and Sites return equivalent security policy | Pending | Header comparison | — |

## Scope decisions and non-applicable enterprise checks

| Requirement | Status | Reason / evidence |
| --- | --- | --- |
| Authentication, login, logout | N/A by design — confirm in release | Public narrative experience with no accounts or protected state |
| Password-manager behavior | N/A by design — confirm in release | No password or authentication fields |
| External application API calls | N/A by design — confirm in release | No external runtime API dependency |
| Background runners or task jobs | N/A by design — confirm in release | No queued or background workflow |
| Database migrations and persistence | N/A by design — confirm in release | Evidence notes are browser-local; form delivery is handled by Netlify |
| Backend logs | Limited scope — confirm in release | Netlify form submission log is the only backend delivery evidence |

## Release sign-off

- [ ] Every required row is verified against the current production deploy.
- [ ] Every visible control was exercised in the user's real Chrome profile.
- [ ] The lower scrolled experience was reviewed at all required widths.
- [ ] Form delivery was proved in Netlify, not inferred from a success message.
- [ ] GitHub, Netlify, and Sites point to the exact same commit.
- [ ] No evidence contains private information or secrets.
- [ ] `v1.0.0` was created only after all checks passed.

Final disposition: **Pending**
