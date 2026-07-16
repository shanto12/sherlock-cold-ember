import { expect, test } from "@playwright/test";
import {
  expectBasicAccessibility,
  expectNoHorizontalOverflow,
  expectPrimaryTouchTargets,
  monitorRuntime,
  waitForCasebookHydration,
} from "./helpers";

test("the complete scrolled experience stays healthy at the target viewport", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  const sections = page.locator("main section");
  expect(await sections.count()).toBeGreaterThanOrEqual(5);
  for (const section of await sections.all()) {
    await section.scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
  }

  await expectBasicAccessibility(page);
  await expectPrimaryTouchTargets(page);

  if (testInfo.project.name === "desktop-chromium") {
    const stageState = await page.evaluate(() => {
      const stage = document.querySelector<HTMLElement>(".cinematic-stage");
      const activeImage = document.querySelector<HTMLImageElement>(
        ".cinematic-stage .stage-frame.is-active img",
      );
      const frost = document.querySelector<HTMLElement>(".stage-frost");
      return {
        activeImages: document.querySelectorAll(".cinematic-stage .stage-frame.is-active img")
          .length,
        display: stage ? getComputedStyle(stage).display : "missing",
        pointerEvents: stage ? getComputedStyle(stage).pointerEvents : "missing",
        zIndex: stage ? Number.parseInt(getComputedStyle(stage).zIndex, 10) : -1,
        naturalWidth: activeImage?.naturalWidth ?? 0,
        frostBlend: frost ? getComputedStyle(frost).mixBlendMode : "missing",
      };
    });
    expect(stageState.display).not.toBe("none");
    expect(stageState.zIndex).toBeGreaterThanOrEqual(0);
    expect(stageState.pointerEvents).toBe("none");
    expect(stageState.activeImages).toBe(1);
    expect(stageState.naturalWidth).toBeGreaterThan(1_000);
    expect(stageState.frostBlend, "the frost overlay must not black out the scene art").not.toBe(
      "multiply",
    );

    const translucentCopyState = await page.evaluate(() => {
      const rootStyle = getComputedStyle(document.documentElement);
      const copies = Array.from(
        document.querySelectorAll<HTMLElement>(".story-scene[data-scene-index] > .scene-copy"),
      );
      return {
        strongAlpha: Number.parseFloat(
          rootStyle.getPropertyValue("--story-glass-strong"),
        ),
        midAlpha: Number.parseFloat(rootStyle.getPropertyValue("--story-glass-mid")),
        sectionAlpha: Number.parseFloat(rootStyle.getPropertyValue("--story-section")),
        copies: copies.map((copy) => {
          const style = getComputedStyle(copy);
          return {
            opacity: Number.parseFloat(style.opacity),
            backgroundImage: style.backgroundImage,
            backdropFilter: style.backdropFilter,
            width: copy.getBoundingClientRect().width,
          };
        }),
      };
    });
    expect(translucentCopyState.strongAlpha).toBeGreaterThanOrEqual(0.6);
    expect(translucentCopyState.strongAlpha).toBeLessThan(0.8);
    expect(translucentCopyState.midAlpha).toBeLessThan(translucentCopyState.strongAlpha);
    expect(translucentCopyState.sectionAlpha).toBeLessThan(0.8);
    expect(translucentCopyState.copies).toHaveLength(5);
    for (const copy of translucentCopyState.copies) {
      expect(copy.opacity, "text glyphs must remain fully opaque").toBe(1);
      expect(copy.backgroundImage).toContain("linear-gradient");
      expect(copy.backdropFilter).toContain("blur");
      expect(copy.width).toBeGreaterThan(280);
      expect(copy.width).toBeLessThan(page.viewportSize()!.width);
    }
  } else {
    const mobileImages = page.locator(".mobile-picture img");
    await expect(mobileImages).toHaveCount(5);
    for (const image of await mobileImages.all()) {
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(1_000);
    }

    const mobileComposition = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLElement>(".story-scene[data-scene-index]")).map(
        (section) => {
          const media = section.querySelector<HTMLElement>(".mobile-scene-media");
          const copy = section.querySelector<HTMLElement>(".scene-copy");
          if (!media || !copy) return null;
          const mediaBounds = media.getBoundingClientRect();
          const copyBounds = copy.getBoundingClientRect();
          const style = getComputedStyle(copy);
          return {
            mediaBottom: mediaBounds.bottom,
            copyTop: copyBounds.top,
            opacity: Number.parseFloat(style.opacity),
            backgroundImage: style.backgroundImage,
          };
        },
      ),
    );
    expect(mobileComposition).toHaveLength(5);
    for (const composition of mobileComposition) {
      expect(composition).not.toBeNull();
      expect(composition!.copyTop).toBeGreaterThanOrEqual(composition!.mediaBottom - 1);
      expect(composition!.opacity).toBe(1);
      expect(composition!.backgroundImage).toContain("linear-gradient");
    }
  }

  expect(await page.locator("canvas").count()).toBeLessThanOrEqual(2);
  expect(await page.locator("audio[autoplay], video[autoplay]").count()).toBe(0);
  expect(await page.locator("*").count()).toBeLessThan(1_600);

  await page.keyboard.press("Home");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /Skip to the case/i })).toBeFocused();
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
  expect(focusedTag).not.toBe("body");
  const focusIndicator = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null;
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
      boxShadow: style.boxShadow,
    };
  });
  expect(
    focusIndicator &&
      ((focusIndicator.outlineStyle !== "none" && focusIndicator.outlineWidth > 0) ||
        focusIndicator.boxShadow !== "none"),
    "keyboard focus should have a visible indicator",
  ).toBeTruthy();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);

  await runtime.assertClean(testInfo);
});

test("translucent surfaces compose across mobile and accessibility preferences", async ({
  page,
}) => {
  await page.goto("/");
  await waitForCasebookHydration(page);

  const modes = [
    { name: "default", contrast: "no-preference", reducedMotion: "no-preference" },
    { name: "reduced motion", contrast: "no-preference", reducedMotion: "reduce" },
    { name: "increased contrast", contrast: "more", reducedMotion: "no-preference" },
    { name: "increased contrast and reduced motion", contrast: "more", reducedMotion: "reduce" },
  ] as const;

  for (const mode of modes) {
    await test.step(mode.name, async () => {
      await page.emulateMedia({
        contrast: mode.contrast,
        reducedMotion: mode.reducedMotion,
      });
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const root = getComputedStyle(document.documentElement);
              const pairs = [
                [".scene-copy", "--story-glass-strong"],
                [".inspection-control", "--story-panel-soft"],
                [".telegram-panel", "--story-panel"],
                [".clue-button", "--story-panel-strong"],
                [".field-notes", "--story-section-strong"],
                [".commission-section", "--story-commission-strong"],
              ] as const;
              return pairs.every(([selector, token]) => {
                const element = document.querySelector<HTMLElement>(selector);
                if (!element) return false;
                const expected = Number.parseFloat(root.getPropertyValue(token));
                const style = getComputedStyle(element);
                const serialized = `${style.backgroundColor} ${style.backgroundImage}`;
                const alphas = Array.from(serialized.matchAll(/rgba?\(([^)]+)\)/g), (match) => {
                  const body = match[1];
                  const slashAlpha = body.split("/")[1];
                  if (slashAlpha) return Number.parseFloat(slashAlpha.trim());
                  const commaParts = body.split(",");
                  return commaParts.length === 4
                    ? Number.parseFloat(commaParts[3].trim())
                    : 1;
                });
                return alphas.some((alpha) => Math.abs(alpha - expected) < 0.015);
              });
            }),
          { message: `${mode.name} surfaces should settle on their semantic tokens` },
        )
        .toBe(true);

      const state = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const tokenValue = (name: string) => Number.parseFloat(root.getPropertyValue(name));
        const surfaceTokens: Record<string, string[]> = {
          ".scene-copy": window.innerWidth <= 860
            ? ["--story-glass-strong", "--story-glass-mid"]
            : ["--story-glass-strong", "--story-glass-mid", "--story-glass-edge"],
          ".inspection-control": ["--story-panel-soft"],
          ".telegram-panel": ["--story-panel"],
          ".scene-marginalia": ["--story-panel-soft"],
          ".clue-button": ["--story-panel-strong"],
          ".observation-readout": ["--story-panel-strong"],
          ".book-index": ["--story-panel"],
          ".book-panel": ["--story-panel-strong"],
          ".conclusion-console": ["--story-panel"],
          ".scene-rail": ["--story-panel"],
          ".field-notes": ["--story-section-strong", "--story-section"],
          ".commission-section": [
            "--story-commission-strong",
            "--story-section",
            "--story-commission-edge",
          ],
        };
        const alphasFrom = (serialized: string) =>
          Array.from(serialized.matchAll(/rgba?\(([^)]+)\)/g), (match) => {
            const body = match[1];
            const slashAlpha = body.split("/")[1];
            if (slashAlpha) return Number.parseFloat(slashAlpha.trim());
            const commaParts = body.split(",");
            return commaParts.length === 4
              ? Number.parseFloat(commaParts[3].trim())
              : 1;
          }).filter(Number.isFinite);

        return {
          mobile: window.innerWidth <= 860,
          tokens: Object.fromEntries(
            [
              "--story-glass-strong",
              "--story-glass-mid",
              "--story-panel-soft",
              "--story-panel",
              "--story-panel-strong",
              "--story-section",
              "--story-section-strong",
              "--story-commission-edge",
            ].map((name) => [name, tokenValue(name)]),
          ),
          surfaces: Object.entries(surfaceTokens).map(([selector, tokenNames]) => {
            const element = document.querySelector<HTMLElement>(selector);
            if (!element) return { selector, missing: true, opacity: 0, expected: [], alphas: [] };
            const style = getComputedStyle(element);
            return {
              selector,
              missing: false,
              opacity: Number.parseFloat(style.opacity),
              expected: tokenNames.map(tokenValue),
              alphas: alphasFrom(`${style.backgroundColor} ${style.backgroundImage}`),
            };
          }),
        };
      });

      if (mode.contrast === "more") {
        expect(state.tokens["--story-glass-strong"]).toBeGreaterThanOrEqual(0.96);
        expect(state.tokens["--story-panel-soft"]).toBeGreaterThanOrEqual(0.94);
        expect(state.tokens["--story-panel"]).toBeGreaterThanOrEqual(0.96);
        expect(state.tokens["--story-panel-strong"]).toBeGreaterThanOrEqual(0.98);
        expect(state.tokens["--story-section"]).toBeGreaterThanOrEqual(0.98);
        expect(state.tokens["--story-section-strong"]).toBeGreaterThanOrEqual(0.98);
        expect(state.tokens["--story-commission-edge"]).toBeGreaterThanOrEqual(0.98);
      } else if (state.mobile && mode.reducedMotion === "reduce") {
        expect(state.tokens["--story-glass-strong"]).toBeGreaterThanOrEqual(0.9);
        expect(state.tokens["--story-panel"]).toBeGreaterThanOrEqual(0.9);
        expect(state.tokens["--story-panel-strong"]).toBeGreaterThanOrEqual(0.94);
        expect(state.tokens["--story-section"]).toBe(1);
      }

      for (const surface of state.surfaces) {
        expect(surface.missing, `${surface.selector} must render`).toBe(false);
        expect(surface.opacity, `${surface.selector} content must stay fully opaque`).toBe(1);
        for (const expectedAlpha of surface.expected) {
          expect(
            surface.alphas.some((alpha) => Math.abs(alpha - expectedAlpha) < 0.015),
            `${surface.selector} must use its ${expectedAlpha} semantic surface token`,
          ).toBe(true);
        }
      }
    });
  }
});
