# Contributing

Thank you for helping improve The Cold Ember. Changes should preserve its
cinematic composition, historical boundaries, accessibility, original-voice
policy, and exact release evidence.

## Local setup

Use Node.js 22.13 or later:

```bash
npm ci
npm run dev
```

Before opening a pull request, run:

```bash
npm run verify
npm run test:e2e
```

`npm run verify` covers lint, strict TypeScript, rendered behavior tests, both
production builds, and the production dependency audit. Runtime or interaction
changes also require the three-viewport Playwright suite. Never enable the
opt-in live Netlify form test in a routine contribution.

## Change boundaries

- Preserve keyboard, touch, pointer, reduced-motion, captions, and immediate
  conversation-off behavior.
- Do not introduce an actor, celebrity, living-person, audiobook, or screen-
  adaptation voice or likeness.
- Keep provider generation offline. Never commit a credential, voice ID,
  provider response, `.env` file, work ledger, or temporary mix artifact.
- Update the audio or visual manifest, hashes, provenance, and corresponding
  tests whenever a published asset intentionally changes.
- Keep quotations short, source-linked, public-domain, and valid for the 1895
  chronology described in the master plan.
- Do not commit `.next`, `dist`, Playwright output, Wrangler state, Netlify
  state, or other generated work directories.

## Pull requests

Use a focused branch and explain what changed, why it changed, user impact,
verification performed, and whether the browser runtime or deployed assets
changed. Pull requests must pass release quality plus both required CodeQL
analyses before merge.

Report suspected vulnerabilities through [`SECURITY.md`](./SECURITY.md), not a
public issue.
