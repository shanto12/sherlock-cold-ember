# Visual asset provenance

The Cold Ember's five cinematic tableaux were created specifically for this
project through an AI-assisted art-direction workflow, then selected, cropped,
color-finished, and encoded for the final interface. No third-party photograph,
film still, copied book cover, actor likeness, or screen-franchise asset is
included.

The JPEG files are the maintained scene masters. The AVIF files are optimized
delivery derivatives of the matching compositions. The social card and icons
are original project branding derived from the same cold-cobalt, gas-flame, and
ember visual system.

## Published manifest

| Asset | Role | Dimensions | Bytes | SHA-256 |
| --- | --- | ---: | ---: | --- |
| `public/scenes/telegram.jpg` | Summons scene master | 1935 × 812 | 224,559 | `8660781867651670b84937d6ad89dd82c9638a07c2dd2a65d0aa5237ba53cdf8` |
| `public/scenes/telegram.avif` | Summons delivery derivative | 1934 × 812 | 39,381 | `2dee58dd66d1b96c7c6f118a3f55fd5294e64ad531dc65c496572e089a9605d9` |
| `public/scenes/hansom.jpg` | Passage scene master | 1940 × 811 | 407,433 | `3a7b7ff0bb400458c55c9baad921e5004aa1b5268d1067169ddafa184c48f795` |
| `public/scenes/hansom.avif` | Passage delivery derivative | 1940 × 810 | 98,450 | `4aa41ff5329c15ff10a0ba2225e7928b2478dd8db2e1a432c2f0af8a5652f214` |
| `public/scenes/crime-room.jpg` | Inspection scene master | 1934 × 813 | 276,977 | `67f8403c1cd8b5c710300e6763408a24896e65c44e599e10b43519eb8920b2bb` |
| `public/scenes/crime-room.avif` | Inspection delivery derivative | 1934 × 812 | 55,759 | `139a43ee513d85636aa5658c06a4040df1d663e210dd030c3290516d62f6f97d` |
| `public/scenes/reference-room.jpg` | Archive scene master | 1938 × 811 | 220,443 | `ee8fee122b81741a1737a1f1182d21879ef3614a9009558c7ef510653093ac51` |
| `public/scenes/reference-room.avif` | Archive delivery derivative | 1938 × 810 | 37,582 | `2cf94085a63dec708376a10f52315dee513d70d968026890f5c652aee477e404` |
| `public/scenes/deduction.jpg` | Conclusion scene master | 1935 × 813 | 339,254 | `227e2384ab816946ce1de70c47b3975b3be16ea31630086cb2f5a5e455dabf54` |
| `public/scenes/deduction.avif` | Conclusion delivery derivative | 1934 × 812 | 59,282 | `925a8b658258936204383d2ed5c58fe96d995dd7da36554ae0866900c1310548` |
| `public/og.png` | 1200 × 630 social sharing card | 1200 × 630 | 1,181,756 | `2b76aa18341b9a8c76f83ba03affdaf32e6d682f9c3837d267008fc4f5e9b901` |
| `public/apple-touch-icon.png` | Touch icon | 180 × 180 | 54,838 | `d327f5fd2e6374221cd2a0d11bd0bea739a45b00689eb8a0a61323d7ce330d04` |
| `public/favicon.ico` | Browser icon | 64 × 64 | 13,374 | `a591a527b22c4502601278c8065a18a77372ba9fb7597331676cf0e04cba543a` |

Minor one-pixel differences between some JPEG masters and AVIF derivatives are
encoder/crop-boundary results; they do not introduce new composition content.

## Creative and rights boundaries

- Every composition is project-specific and was selected against the 1895
  historical brief in [`master-plan.md`](./master-plan.md).
- No celebrity, living-person, historical actor, film/television performer, or
  recognizable screen-adaptation likeness was requested or used.
- No modern forensic object, branded tobacco, franchise costume, studio mark,
  production logo, or copied cover appears in the maintained assets.
- The files are non-audio original project materials covered by the repository's
  MIT License. Third-party names and marks remain with their owners.
- The project is independent and unofficial; visual inclusion does not imply
  endorsement by an estate, publisher, platform, performer, or production.

`tests/visual-assets.test.mjs` locks the published filenames, byte counts, and
SHA-256 values to this manifest so an asset change cannot silently invalidate
the public provenance record.
