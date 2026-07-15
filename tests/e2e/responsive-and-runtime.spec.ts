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
  } else {
    const mobileImages = page.locator(".mobile-picture img");
    await expect(mobileImages).toHaveCount(5);
    for (const image of await mobileImages.all()) {
      await expect
        .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
        .toBeGreaterThan(1_000);
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
