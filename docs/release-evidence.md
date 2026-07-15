# Release evidence — The Cold Ember

This is the auditable release record for the public production build. Evidence contains no deployment tokens, cookies, personal email addresses, or private form data.

## Release identity

| Field | Value |
| --- | --- |
| Release | `v1.0.0` |
| Evidence-bearing Git commit | The commit resolved by the public `v1.0.0` tag; final SHA and parity deployment IDs are published in the GitHub release |
| Runtime-verified code commit | `4ec61291b7e6a966a38c7d112b2f40f4be2c8a18` |
| Public GitHub repository | `https://github.com/shanto12/sherlock-cold-ember` — public, MIT licensed, recruiter-facing README and topics |
| GitHub Actions evidence | Release quality run `29430366602` succeeded for the runtime code; the final evidence-only commit is independently rerun and linked from the GitHub release |
| Netlify production | `https://sherlock-cold-ember.netlify.app` — runtime-evidence deploy `6a57ae00a127e30c7b1c64df` |
| Sites parity production | `https://the-cold-ember-casebook.shanto.chatgpt.site` — private version 2, deployment `appgdep_6a57ae435bf08191bfcc61c745100dd5` |
| Verified at | July 15, 2026, 10:59–11:12 AM CDT (America/Chicago) |
| Verifier | Codex automation plus Shanto's real Chrome profile |

The final GitHub release is the immutable index for the tagged SHA, final Netlify deploy ID, final Sites version/deployment ID, and final GitHub Actions run. Runtime evidence above remains attributable to the same application code; the evidence-only commit changes documentation, not runtime behavior.

## Automated release gates

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Locked `npm ci` succeeds | Pass | GitHub Actions | Successful run `29430366602`; final tagged commit rerun |
| ESLint succeeds with zero findings | Pass | GitHub Actions + local gate | `npm run lint` exited 0; generated Netlify/Vinext/Playwright output is explicitly excluded |
| Strict TypeScript check succeeds | Pass | GitHub Actions + local gate | `npm run typecheck` exited 0 |
| Rendered behavior suite succeeds | Pass | Node test runner | 2/2 rendered tests passed |
| Vinext/Sites production build succeeds | Pass | Build log + Sites deployment | Vinext build passed; private Sites version 2 published successfully |
| Next.js/Netlify production build succeeds | Pass | Build log + deploy log | Next 16 production build passed; Netlify deploy reached `ready` |
| Production dependency audit has no findings | Pass | `npm audit --omit=dev` | 0 vulnerabilities |
| Tracked-source secret review finds no credential material | Pass | Source/history review | No token/private-key patterns, env files, credentials, private paths, or personal contact data; `.env*`, `.dev.vars*`, host state, and artifacts are ignored |
| Exact Git commit matches both deployments | Pass | Git, Sites source provenance, clean Netlify CLI build, GitHub release | The final tagged commit is pushed to both source remotes and republished to both hosts; exact IDs are indexed in the release |

## Current Netlify production behavior

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Home route returns 200 and the release title | Pass | API + real Chrome | HTTP 200; real Chrome title is `Sherlock Holmes: The Cold Ember \| Interactive Victorian Mystery` |
| Original scene images return 200 without failed requests | Pass | API + Playwright + real Chrome | All 5 AVIF and 5 JPEG files returned 200; all 10 DOM images had non-zero decoded dimensions in real Chrome |
| `robots.txt` returns 200 and points to the sitemap | Pass | API + Playwright | HTTP 200 and canonical sitemap assertion passed |
| `sitemap.xml` returns 200 and contains the canonical URL | Pass | API + Playwright | HTTP 200; canonical URL assertion passed |
| Intentional unknown route returns the designed 404 | Pass | API + Playwright + real Chrome | HTTP 404; custom “This trail goes cold” page and return link exercised |
| Open Graph image is 1200 × 630 and returns 200 | Pass | API + PNG dimension assertion | HTTP 200 `image/png`; binary dimensions asserted as 1200 × 630 |
| Canonical, title, description, OG, X, and JSON-LD metadata are correct | Pass | Rendered DOM + Playwright | Full metadata and parseable `WebSite` structured data suite passed |
| Netlify recognizes the `consultation` form | Pass | Netlify API | Form ID `6a57abd1648c3a00086ba83e`; honeypot enabled; all six fields recognized |
| Valid form submission reaches Netlify and completes | Pass | Playwright + real Chrome + Netlify backend | Browser submission `6a57ae715915311711a39962` and real-Chrome submission `6a57b097fbe3d022118a4c9e` were found in Netlify's submission log |
| Invalid form is blocked with accessible field feedback | Pass | Real Chrome + Playwright | Native validation blocked an empty submit; real Chrome found six invalid required controls before completion |
| Console has no uncaught errors or CSP violations | Pass | Real Chrome + Playwright | Zero production-origin warnings/errors in the real-profile pass; automated runtime monitor clean |
| Network has no failed first-party requests | Pass | Playwright + API matrix | Runtime monitor clean; home, metadata, icons, form endpoint, all scene assets, and 404 route returned their expected statuses |

## Every-control interaction inventory

Every visible control was activated against Netlify production in Shanto's real Chrome profile. The exact 390px and 320px touch paths were repeated with Playwright.

| Control or workflow | Keyboard | Pointer/touch | Real Chrome | Automation | Result / evidence |
| --- | --- | --- | --- | --- | --- |
| Skip link | Pass | N/A | Pass | Pass | Activated with Enter and moved into the case |
| Header wordmark / return | Pass | Pass | Pass | Pass | Returned to the beginning |
| Begin the inquiry / Inspect the evidence | Pass | Pass | Pass | Pass | Both primary hero actions activated |
| Chapter index open/close and all five chapter links | Pass | Pass | Pass | Pass | Every chapter landed in the viewport; close control exercised |
| Pause/resume motion and persistence after reload | Pass | Pass | Pass | Pass | Paused state survived reload; resume restored motion |
| Previous/next scene controls at every boundary | Pass | Pass | Pass | Pass | Traversed 1→5→1; both disabled boundaries verified |
| Telegram reveal and fold | Pass | Pass | Pass | Pass | Expanded and folded with correct state |
| Hansom roof-trapdoor clue | Pass | Pass | Pass | Pass | Route clue recorded |
| Inspection light on/off | Pass | Pass | Pass | Pass | Both pressed states verified |
| Footprint, ash, blue glass, and brass latch | Pass | Pass | Pass | Pass | All four evidence controls activated |
| Four reference-book tabs | Pass | Pass | Pass | Pass | Pointer selection plus Arrow Left/Right, Home, and End verified |
| All three conclusion choices and Holmes reveal | Pass | Pass | Pass | Pass | All radio choices and all three outcomes exercised |
| Case notes open/close, evidence state, persistence, and clear | Pass | Pass | Pass | Pass | Seven notes observed; one note persisted reload; clear returned the list to zero |
| Replay / return-to-beginning action | Pass | Pass | Pass | Pass | Replay reset the case and returned to the hero |
| All three field-note disclosures | Pass | Pass | Pass | Pass | Every disclosure opened |
| Both commission CTAs and dialog close paths | Pass | Pass | Pass | Pass | Both CTAs, X close, Escape close, contained focus, and restoration automation passed |
| Inquiry fields, select, consent, invalid state, and submit | Pass | Pass | Pass | Pass | Every field completed; native invalid state and real backend delivery proved |
| Success close, footer return, and 404 return | Pass | Pass | Pass | Pass | All final return/close controls exercised |

## Responsive, motion, and accessibility evidence

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| Real Chrome desktop pass | Pass | Shanto's real Chrome profile | Full manual pass at 1430 × 607 CSS px, DPR 2; exact 1440px viewport also passed in Playwright |
| Mobile pass at 390 px | Pass | Playwright real-browser automation | Full production journey and runtime checks passed; this width was automated, not a separate real-profile Chrome window |
| Narrow layout pass at 320 px | Pass | Playwright real-browser automation | Full production journey and runtime checks passed; automated, not a separate real-profile Chrome window |
| Full page, including every lower section, visually reviewed | Pass | Real Chrome + Playwright screenshots | Manual traversal reached every scene, field notes, commission block, and footer; retained hero/lower/footer captures |
| No horizontal overflow at 1440, 390, or 320 px | Pass | Browser measurements | All three automated widths passed; real Chrome measured 1415px content inside a 1430px viewport |
| Touch targets and text remain usable at mobile widths | Pass | Playwright | Primary targets and layout bounds passed at 390px and 320px |
| Visible focus and logical keyboard order | Pass | Real Chrome + Playwright | Skip-link Enter, tablist keys, dialog focus containment, native controls, and focus restoration verified |
| Dialog focus is contained, restored, and Escape closes | Pass | Real Chrome + Playwright | Focus was inside the inquiry dialog; Escape/X close paths and restoration suite passed |
| Names, landmarks, headings, tabs, and live feedback are valid | Pass | Semantic DOM/ARIA assertions | Custom accessibility checks and role/name assertions passed; no separate screen-reader application session was run |
| OS reduced-motion produces the composed still edition | Pass | Playwright media emulation | Zero running animations after reduced-motion reload |
| Manual pause stops bounded animation and survives reload | Pass | Real Chrome + Playwright | Persisted pause and zero-running-animation assertion passed |
| Hidden-tab lifecycle pauses Canvas work; no DOM/RAF growth | Pass | Playwright lifecycle instrumentation | Canvas drawing stopped while hidden and resumed cleanly |

## Headers, CSP, and cache policy

| Requirement | Status | Evidence method | Current-production evidence |
| --- | --- | --- | --- |
| CSP permits only the intended first-party experience | Pass | Netlify + Sites response headers | Required directives present; executable resources were HTTPS and same-origin |
| HSTS is present with subdomains and preload | Pass | Production response headers | Netlify platform policy: one year; Sites: two years; both include subdomains and preload |
| `nosniff`, `DENY`, referrer, permissions, COOP, and CORP are present | Pass | Production response headers | All required values present on both hosts |
| Next static assets use immutable one-year caching | Pass | Netlify asset headers | `public,max-age=31536000,immutable` |
| Scene assets use bounded revalidation caching | Pass | Netlify asset headers | `max-age=86400,stale-while-revalidate=604800` |
| HTML is not incorrectly cached as immutable | Pass | Netlify home headers | `public,max-age=0,must-revalidate` |
| Netlify and Sites return equivalent browser protections | Pass | Authenticated header comparison | Same CSP and core protections; documented host-managed HSTS duration is the only material header difference |

## Scope decisions and non-applicable checks

| Requirement | Status | Reason / evidence |
| --- | --- | --- |
| Authentication, login, logout | N/A by design | Public narrative experience; production DOM had zero auth links and no protected state |
| Password-manager behavior | N/A by design | Production DOM had zero password fields |
| External application API calls | N/A by design | No external runtime API dependency; executable resources were same-origin |
| Background runners or task jobs | N/A by design | No queue, cron, worker job, or task-completion backend |
| Database migrations and persistence | N/A by design | Evidence notes are browser-local; contact delivery is handled by Netlify Forms |
| Backend logs | Pass for applicable scope | Netlify form metadata and three controlled QA submissions were queried directly; no user/private submission data is reproduced here |

## Release sign-off

- [x] Every required row has current production evidence or an explicit N/A rationale.
- [x] Every visible primary control was exercised in Shanto's real Chrome profile.
- [x] The complete lower-page experience was reviewed; 390px and 320px were also tested in Playwright.
- [x] Form delivery was proved in Netlify's backend, not inferred from a success message.
- [x] GitHub, Netlify, and Sites publish the exact `v1.0.0` commit; final IDs are indexed in the GitHub release.
- [x] No evidence contains private information or secrets.
- [x] The `v1.0.0` tag and release are created only after the final parity deploy and checks succeed.

Final disposition: **PASS — approved for the `v1.0.0` production release.**
