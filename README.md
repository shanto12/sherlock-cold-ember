# The Cold Ember

![The Cold Ember — A Sherlock Holmes Moving Casebook](./public/og.png)

**The Cold Ember** is an original, interactive Sherlock Holmes case set in London during the winter of 1895. It treats the browser like a moving casebook: visitors follow a telegram from Baker Street, ride through gaslit streets in a period-correct hansom, inspect a bindery crime scene, cross-reference evidence, and test a conclusion.

[View the production experience](https://sherlock-cold-ember.netlify.app) · [Read the master plan](./docs/master-plan.md) · [Review release evidence](./docs/release-evidence.md)

## What makes it distinctive

- Five cinematic, full-page observations with original artwork and a cold-cobalt/gas-flame visual system
- Bounded CSS and Canvas motion for rain, smoke, gaslight, cab rhythm, drifting pages, and deduction lines
- Keyboard, touch, and pointer parity, plus a persistent motion pause and a composed reduced-motion edition
- An evidence notebook, chapter index, conclusion workflow, and Netlify-powered consultation inquiry
- Crawlable story content, field notes, metadata routes, social artwork, and hardened production headers
- Parallel Next.js/Netlify and Vinext/Sites release paths from the same public source

## Technology

- Next.js 16, React 19, and TypeScript
- Vinext and Cloudflare Workers for the private Sites parity build
- Netlify Next Runtime and Netlify Forms for public production
- Native CSS and Canvas animation with no animation framework dependency
- GitHub Actions for linting, type checks, rendered tests, both production builds, and a production dependency audit

## Local development

Requirements: Node.js 22.13 or later and npm.

```bash
npm ci
npm run dev
```

The Sites-compatible preview is available at `http://localhost:3000`. To run the direct Next.js development server used for Netlify parity:

```bash
npm run dev:next
```

## Verification

Run the full local release gate:

```bash
npm run verify
```

The release gate covers linting, strict TypeScript checks, rendered behavior tests, the Vinext/Sites build, the Next.js/Netlify build, and the production-only npm audit. Current production proof—including real Chrome, responsive, form-delivery, console, network, route, CSP, and header checks—is recorded in [`docs/release-evidence.md`](./docs/release-evidence.md).

## Release architecture

| Surface | Purpose | Configuration |
| --- | --- | --- |
| Netlify production | Public, canonical experience and form handling | [`netlify.toml`](./netlify.toml) |
| Sites parity | Exact-source private deployment | [`.openai/hosting.json`](./.openai/hosting.json) and [`worker/index.ts`](./worker/index.ts) |
| Shared hardening | CSP and browser security headers | [`lib/security-headers.ts`](./lib/security-headers.ts) |
| CI | Locked install and release-quality gates | [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) |

No credentials or deployment tokens belong in this repository. Local `.env*`, Netlify state, Wrangler state, build output, and work files are ignored.

## Historical and rights note

The site uses original scene compositions and original case writing. It is an independent, unofficial adaptation inspired by public-domain literary works and is not affiliated with any film, television production, museum, publisher, or estate. No actor likeness or modern screen-franchise design is used.

Smoking appears only as non-promotional historical context. Tobacco use is harmful; the experience does not endorse it.

## License

Source code and original project materials are available under the [MIT License](./LICENSE).
