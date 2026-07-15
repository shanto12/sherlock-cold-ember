import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = endMarker ? source.indexOf(endMarker, start + startMarker.length) : source.length;

  assert.ok(start >= 0, `${startMarker.trim()} is missing`);
  assert.ok(end > start, `${endMarker?.trim() ?? "end of file"} must follow ${startMarker.trim()}`);
  return source.slice(start, end);
}

function assertMinorAndPatchOnly(group, label) {
  const updateTypes = sliceBetween(group, "        update-types:", undefined);
  assert.match(updateTypes, /          - "minor"\n          - "patch"(?:\n|$)/, `${label} must allow minor and patch updates`);
  assert.doesNotMatch(updateTypes, /          - "major"(?:\n|$)/, `${label} must keep major updates manual`);
}

test("Dependabot keeps peer-coupled and high-blast-radius updates together", async () => {
  const config = await readFile(resolve(ROOT, ".github/dependabot.yml"), "utf8");
  assert.match(config, /^version: 2\n/, "Dependabot schema version must remain 2");

  const npmBlock = sliceBetween(
    config,
    '  - package-ecosystem: "npm"',
    '  - package-ecosystem: "github-actions"',
  );
  const reactStart = npmBlock.indexOf("      react-stack:");
  const viteStart = npmBlock.indexOf("      vite-rsc-stack:");
  const runtimeStart = npmBlock.indexOf("      runtime-minor-and-patch:");
  const toolingStart = npmBlock.indexOf("      tooling-minor-and-patch:");

  assert.ok(reactStart >= 0, "React stack group is missing");
  assert.ok(
    reactStart < viteStart && viteStart < runtimeStart && runtimeStart < toolingStart,
    "specific peer/toolchain groups must precede broad first-match groups",
  );

  const reactGroup = npmBlock.slice(reactStart, viteStart);
  for (const dependency of [
    "react",
    "react-dom",
    "react-server-dom-webpack",
    "@types/react",
    "@types/react-dom",
  ]) {
    assert.ok(reactGroup.includes(`- "${dependency}"`), `${dependency} must stay in react-stack`);
  }
  assert.ok(
    !reactGroup.includes("dependency-type:"),
    "react-stack must span production and development peer dependencies",
  );
  assertMinorAndPatchOnly(reactGroup, "react-stack");

  const viteGroup = npmBlock.slice(viteStart, runtimeStart);
  for (const dependency of ["vinext", "vite", "@vitejs/*", "@cloudflare/vite-plugin"]) {
    assert.ok(viteGroup.includes(`- "${dependency}"`), `${dependency} must stay in vite-rsc-stack`);
  }
  assert.match(
    viteGroup,
    /        dependency-type: "development"(?:\n|$)/,
    "vite-rsc-stack must remain limited to development dependencies",
  );
  assertMinorAndPatchOnly(viteGroup, "vite-rsc-stack");
});

test("routine version maintenance cools new releases and excludes majors", async () => {
  const config = await readFile(resolve(ROOT, ".github/dependabot.yml"), "utf8");
  const npmBlock = sliceBetween(
    config,
    '  - package-ecosystem: "npm"',
    '  - package-ecosystem: "github-actions"',
  );
  const actionsBlock = sliceBetween(config, '  - package-ecosystem: "github-actions"', undefined);
  const cooldown = sliceBetween(npmBlock, "    cooldown:", "    groups:");

  for (const setting of [
    "default-days: 7",
    "semver-major-days: 30",
    "semver-minor-days: 7",
    "semver-patch-days: 3",
  ]) {
    assert.ok(cooldown.includes(setting), `${setting} npm cooldown is missing`);
  }
  assert.match(cooldown, /      include:\n        - "\*"(?:\n|$)/, "npm cooldown must cover every dependency");

  assert.equal(
    npmBlock.match(/version-update:semver-major/g)?.length,
    1,
    "npm must have one ecosystem-scoped major ignore",
  );
  assert.equal(
    actionsBlock.match(/version-update:semver-major/g)?.length,
    1,
    "GitHub Actions must have one ecosystem-scoped major ignore",
  );

  const actionsGroup = sliceBetween(actionsBlock, "      github-actions:", "    ignore:");
  assert.match(actionsGroup, /        patterns:\n          - "\*"(?:\n|$)/, "GitHub Actions group must cover every action");
  assertMinorAndPatchOnly(actionsGroup, "github-actions");
});
