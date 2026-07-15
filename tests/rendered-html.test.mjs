import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
      IMAGES: {
        input: () => ({
          transform: () => ({
            output: async () => ({ response: () => new Response("image") }),
          }),
        }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete moving casebook", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(response.headers.get("content-security-policy") ?? "", /default-src 'self'/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");

  const html = await response.text();
  assert.match(
    html,
    /<title>Sherlock Holmes: The Cold Ember \| Interactive Victorian Mystery<\/title>/i,
  );
  assert.match(html, /The cold/);
  assert.match(html, /ember/);
  assert.match(html, /Begin the inquiry/);
  assert.match(html, /One wheel/);
  assert.match(html, /Nothing here/);
  assert.match(html, /Five books/);
  assert.match(html, /Dawn does not/);
  assert.match(html, /Commission an immersive mystery/);
  assert.doesNotMatch(html, /Hear (?:the )?(?:conversation|summons)|Enter with sound/);
  assert.match(html, /Turn conversation off/);
  assert.match(html, /Cinematic sound mixer/);
  assert.match(html, /Conversation is on and begins with your first interaction/);
  assert.doesNotMatch(html, /<(?:audio|video)[^>]+autoplay/i);
  assert.match(html, /consultation/);
  assert.match(html, /\/scenes\/hansom\.avif/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships the original media, Netlify form detector, and no starter surface", async () => {
  const expectedMedia = [
    "telegram",
    "hansom",
    "crime-room",
    "reference-room",
    "deduction",
  ];

  for (const name of expectedMedia) {
    for (const extension of ["avif", "jpg"]) {
      const file = new URL(`../public/scenes/${name}.${extension}`, import.meta.url);
      const details = await stat(file);
      assert.ok(details.size > 20_000, `${name}.${extension} should be a real optimized scene`);
    }
  }

  const formDetector = await readFile(
    new URL("../public/__forms.html", import.meta.url),
    "utf8",
  );
  assert.match(formDetector, /name="consultation"/);
  for (const field of ["name", "email", "project-type", "brief", "consent", "bot-field"]) {
    assert.match(formDetector, new RegExp(`name="${field}"`));
  }

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await assert.rejects(access(new URL("../db", import.meta.url)));
  await assert.rejects(access(new URL("../examples", import.meta.url)));

  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /drizzle|react-loading-skeleton/);
  assert.match(packageJson, /"name": "sherlock-cold-ember"/);

  const hosting = await readFile(new URL(".openai/hosting.json", projectRoot), "utf8");
  assert.match(hosting, /"d1": null/);
  assert.match(hosting, /"r2": null/);

  const sourceHeaders = await readFile(new URL("../public/_headers", import.meta.url), "utf8");
  const builtHeaders = await readFile(new URL("../dist/client/_headers", import.meta.url), "utf8");
  for (const headers of [sourceHeaders, builtHeaders]) {
    assert.match(headers, /\/assets\/\*/);
    assert.match(headers, /\/audio\/\*/);
    assert.match(headers, /max-age=31536000, immutable/);
    assert.match(headers, /\/scenes\/\*/);
    assert.match(headers, /stale-while-revalidate=604800/);
  }
});
