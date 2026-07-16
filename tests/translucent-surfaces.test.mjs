import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const stylesheet = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("scrolling copy uses translucent surfaces while text stays fully opaque", () => {
  for (const customProperty of [
    "--story-glass-strong: 0.68",
    "--story-glass-mid: 0.46",
    "--story-glass-edge: 0.07",
    "--story-panel-soft: 0.54",
    "--story-panel: 0.72",
    "--story-panel-strong: 0.8",
    "--story-panel-active: 0.84",
    "--story-section: 0.72",
    "--story-section-strong: 0.88",
    "--story-commission-strong: 0.86",
    "--story-commission-edge: 0.8",
  ]) {
    assert.match(stylesheet, new RegExp(customProperty.replaceAll(".", "\\.")));
  }

  const sceneCopy = stylesheet.match(/\.scene-copy \{(?<rules>[\s\S]*?)\n\}/)?.groups?.rules;
  assert.ok(sceneCopy, "scene-copy rules must exist");
  assert.match(sceneCopy, /rgb\(4 10 12 \/ var\(--story-glass-strong\)\)/);
  assert.match(sceneCopy, /rgb\(4 10 12 \/ var\(--story-glass-mid\)\)/);
  assert.match(sceneCopy, /backdrop-filter: blur\(2\.5px\) saturate\(1\.06\)/);
  assert.doesNotMatch(sceneCopy, /(?:^|\s)opacity\s*:/, "the copy and its text must not be faded");

  assert.match(
    stylesheet,
    /\.inspection-control \{[\s\S]*?var\(--story-panel-soft\)/,
  );
  assert.match(
    stylesheet,
    /\.scene-marginalia \{[\s\S]*?var\(--story-panel-soft\)/,
  );
  assert.match(
    stylesheet,
    /\.clue-button \{[\s\S]*?var\(--story-panel-strong\)/,
  );
  assert.match(
    stylesheet,
    /\.clue-button:hover,[\s\S]*?var\(--story-panel-active\)/,
  );
  for (const selector of [
    "telegram-panel",
    "book-index",
    "conclusion-console",
    "scene-rail",
  ]) {
    assert.match(
      stylesheet,
      new RegExp(`\\.${selector} \\{[\\s\\S]*?var\\(--story-panel\\)`),
    );
  }
  for (const selector of ["observation-readout", "book-panel"]) {
    assert.match(
      stylesheet,
      new RegExp(`\\.${selector} \\{[\\s\\S]*?var\\(--story-panel-strong\\)`),
    );
  }
  assert.match(
    stylesheet,
    /\.field-notes,[\s\S]*?\.case-footer \{[\s\S]*?var\(--story-section-strong\)[\s\S]*?var\(--story-section\)/,
  );
  assert.match(
    stylesheet,
    /\.commission-section \{[\s\S]*?var\(--story-commission-strong\)[\s\S]*?var\(--story-section\)[\s\S]*?var\(--story-commission-edge\)/,
  );
});

test("mobile and increased-contrast visitors keep a solid readable fallback", () => {
  const mobile = stylesheet.match(
    /@media \(max-width: 860px\) \{(?<rules>[\s\S]*?)\n\}\n\n@media \(max-width: 860px\) and/,
  )?.groups?.rules;
  assert.ok(mobile, "mobile rules must exist");
  assert.match(mobile, /--story-glass-strong: 0\.9/);
  assert.match(mobile, /--story-glass-mid: 0\.84/);
  assert.match(mobile, /--story-panel-soft: 0\.84/);
  assert.match(mobile, /--story-panel: 0\.9/);
  assert.match(mobile, /--story-section: 1/);
  assert.match(
    mobile,
    /rgb\(9 38 48 \/ var\(--story-glass-strong\)\)[\s\S]*?rgb\(6 9 10 \/ var\(--story-glass-mid\)\)/,
  );

  const increasedContrast = stylesheet.match(
    /@media \(prefers-contrast: more\) \{(?<rules>[\s\S]*?)\n\}/,
  )?.groups?.rules;
  assert.ok(increasedContrast, "increased-contrast rules must exist");
  assert.match(increasedContrast, /--story-glass-strong: 0\.96/);
  assert.match(increasedContrast, /--story-panel-soft: 0\.94/);
  assert.match(increasedContrast, /--story-panel-strong: 0\.98/);
  assert.match(increasedContrast, /--story-section-strong: 0\.98/);
  assert.match(increasedContrast, /--story-commission-edge: 0\.98/);
  assert.match(increasedContrast, /--story-section: 0\.98/);
  assert.match(increasedContrast, /backdrop-filter: none/);

  const reducedMotion = stylesheet.match(
    /@media \(prefers-reduced-motion: reduce\) \{(?<rules>[\s\S]*?)\n\}\n\n@media \(prefers-contrast: more\)/,
  )?.groups?.rules;
  assert.ok(reducedMotion, "reduced-motion rules must exist");
  assert.match(reducedMotion, /--story-glass-strong: 0\.82/);
  assert.match(reducedMotion, /--story-panel-soft: 0\.78/);
  assert.match(reducedMotion, /--story-panel: 0\.86/);
  assert.match(reducedMotion, /backdrop-filter: none/);

  const mobileReducedMotion = stylesheet.match(
    /@media \(max-width: 860px\) and \(prefers-reduced-motion: reduce\) \{(?<rules>[\s\S]*?)\n\}\n\n@media \(prefers-contrast: more\)/,
  )?.groups?.rules;
  assert.ok(mobileReducedMotion, "mobile reduced-motion rules must exist");
  assert.match(mobileReducedMotion, /--story-glass-strong: 0\.9/);
  assert.match(mobileReducedMotion, /--story-panel: 0\.9/);
  assert.match(mobileReducedMotion, /--story-panel-strong: 0\.94/);
  assert.match(mobileReducedMotion, /--story-section: 1/);
});
