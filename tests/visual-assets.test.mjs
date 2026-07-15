import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ASSETS = [
  ["public/scenes/telegram.jpg", 224_559, "8660781867651670b84937d6ad89dd82c9638a07c2dd2a65d0aa5237ba53cdf8"],
  ["public/scenes/telegram.avif", 39_381, "2dee58dd66d1b96c7c6f118a3f55fd5294e64ad531dc65c496572e089a9605d9"],
  ["public/scenes/hansom.jpg", 407_433, "3a7b7ff0bb400458c55c9baad921e5004aa1b5268d1067169ddafa184c48f795"],
  ["public/scenes/hansom.avif", 98_450, "4aa41ff5329c15ff10a0ba2225e7928b2478dd8db2e1a432c2f0af8a5652f214"],
  ["public/scenes/crime-room.jpg", 276_977, "67f8403c1cd8b5c710300e6763408a24896e65c44e599e10b43519eb8920b2bb"],
  ["public/scenes/crime-room.avif", 55_759, "139a43ee513d85636aa5658c06a4040df1d663e210dd030c3290516d62f6f97d"],
  ["public/scenes/reference-room.jpg", 220_443, "ee8fee122b81741a1737a1f1182d21879ef3614a9009558c7ef510653093ac51"],
  ["public/scenes/reference-room.avif", 37_582, "2cf94085a63dec708376a10f52315dee513d70d968026890f5c652aee477e404"],
  ["public/scenes/deduction.jpg", 339_254, "227e2384ab816946ce1de70c47b3975b3be16ea31630086cb2f5a5e455dabf54"],
  ["public/scenes/deduction.avif", 59_282, "925a8b658258936204383d2ed5c58fe96d995dd7da36554ae0866900c1310548"],
  ["public/og.png", 1_181_756, "2b76aa18341b9a8c76f83ba03affdaf32e6d682f9c3837d267008fc4f5e9b901"],
  ["public/apple-touch-icon.png", 54_838, "d327f5fd2e6374221cd2a0d11bd0bea739a45b00689eb8a0a61323d7ce330d04"],
  ["public/favicon.ico", 13_374, "a591a527b22c4502601278c8065a18a77372ba9fb7597331676cf0e04cba543a"],
];

test("published visual assets match the public provenance manifest", async () => {
  const manifest = await readFile(resolve(ROOT, "docs/visual-assets.md"), "utf8");
  const expectedSceneFiles = ASSETS.filter(([path]) => path.startsWith("public/scenes/"))
    .map(([path]) => path.replace("public/scenes/", ""))
    .sort();

  assert.deepEqual((await readdir(resolve(ROOT, "public/scenes"))).sort(), expectedSceneFiles);

  for (const [relativePath, expectedBytes, expectedSha] of ASSETS) {
    const absolutePath = resolve(ROOT, relativePath);
    const contents = await readFile(absolutePath);
    const actualSha = createHash("sha256").update(contents).digest("hex");

    assert.equal(contents.byteLength, expectedBytes, `${relativePath} byte count changed`);
    assert.equal(actualSha, expectedSha, `${relativePath} SHA-256 changed`);
    assert.ok(manifest.includes(`\`${relativePath}\``), `${relativePath} is missing from the manifest`);
    assert.ok(manifest.includes(`\`${expectedSha}\``), `${relativePath} hash is missing from the manifest`);
  }
});
