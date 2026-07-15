import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parse } from "parse5";
import ts from "typescript";

const sourcePath = new URL("../lib/dialogue-script.ts", import.meta.url);
const source = await readFile(sourcePath, "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: "dialogue-script.ts",
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const { DIALOGUES, DIALOGUE_SOURCES } = await import(moduleUrl);

const SKIPPED_HTML_NODES = new Set(["script", "style", "template"]);

const extractVisibleText = (html) => {
  const chunks = [];
  const visit = (node) => {
    if (SKIPPED_HTML_NODES.has(node.nodeName)) return;
    if (node.nodeName === "#text") {
      chunks.push(node.value);
      return;
    }
    for (const child of node.childNodes ?? []) visit(child);
  };
  visit(parse(html));
  return chunks.join(" ");
};

const normalizeText = (value) =>
  value
    .normalize("NFKD")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const EXPECTED_CANONICAL_ECHOES = [
  {
    speaker: "Sherlock Holmes",
    text: "You see, but you do not observe. The distinction is clear.",
    story: "A Scandal in Bohemia",
  },
  {
    speaker: "Dr. Watson",
    text: "My dear fellow, I would not miss it for anything.",
    story: "The Adventure of the Speckled Band",
  },
  {
    speaker: "Sherlock Holmes",
    text: "There is nothing more deceptive than an obvious fact.",
    story: "The Boscombe Valley Mystery",
  },
  {
    speaker: "Inspector Gregory",
    text: "The dog did nothing in the night-time.",
    story: "Silver Blaze",
  },
  {
    speaker: "Sherlock Holmes",
    text: "That was the curious incident.",
    story: "Silver Blaze",
  },
  {
    speaker: "Irene Adler",
    text: "I love and am loved by a better man than he.",
    story: "A Scandal in Bohemia",
  },
  {
    speaker: "Inspector Lestrade",
    text: "This case will make a stir, sir.",
    story: "A Study in Scarlet, Part I, Chapter 3",
  },
];

test("canonical dialogue text stays paired with its credited source", () => {
  const creditedLines = Object.values(DIALOGUES)
    .flatMap((scene) => scene.lines)
    .filter((line) => line.source)
    .map(({ speaker, text, source: credit }) => ({
      speaker,
      text,
      story: credit.story,
    }));

  assert.deepEqual(creditedLines, EXPECTED_CANONICAL_ECHOES);
});

test("dialogue provenance uses a small, unique HTTPS primary-source set", () => {
  assert.equal(DIALOGUE_SOURCES.length, 5);
  assert.equal(new Set(DIALOGUE_SOURCES.map((item) => item.url)).size, 5);
  for (const item of DIALOGUE_SOURCES) {
    const url = new URL(item.url);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "en.wikisource.org");
  }
});

test("the authored conversations cover every designed cinematic dialogue cue", () => {
  const cues = new Set(
    Object.values(DIALOGUES)
      .flatMap((scene) => scene.lines)
      .map((line) => line.cue)
      .filter(Boolean),
  );
  assert.deepEqual(
    [...cues].sort(),
    ["glass", "hoofbeat", "paper", "reveal", "telegram"],
  );
});

if (process.env.VERIFY_EXTERNAL_DIALOGUE_SOURCES === "1") {
  test("every canonical source URL resolves successfully", { timeout: 60_000 }, async () => {
    const results = await Promise.all(
      DIALOGUE_SOURCES.map(async (item) => {
        const response = await fetch(item.url, {
          headers: { "user-agent": "sherlock-cold-ember-release-verifier/1.2" },
          redirect: "follow",
        });
        const html = await response.text();
        return { html, item, response };
      }),
    );

    for (const { item, response } of results) {
      assert.equal(response.ok, true, `${item.story} returned ${response.status}`);
      assert.equal(new URL(response.url).hostname, "en.wikisource.org");
    }

    for (const echo of EXPECTED_CANONICAL_ECHOES) {
      const sourceRecord = DIALOGUE_SOURCES.find((item) => item.story === echo.story);
      assert.ok(sourceRecord, `Missing source record for ${echo.story}`);
      const fetched = results.find(({ item }) => item.url === sourceRecord.url);
      assert.ok(fetched, `Missing fetched source for ${echo.story}`);
      assert.equal(
        normalizeText(extractVisibleText(fetched.html)).includes(normalizeText(echo.text)),
        true,
        `Primary text did not contain the credited line: ${echo.text}`,
      );
    }
  });
}
