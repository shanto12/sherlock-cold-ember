import { expect, test } from "@playwright/test";
import {
  expectBasicAccessibility,
  expectNoHorizontalOverflow,
  expectPrimaryTouchTargets,
  monitorRuntime,
  waitForCasebookHydration,
} from "./helpers";

test("completes the moving casebook and records every clue", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  await expect(page).toHaveTitle(/The Cold Ember/i);
  await expect(page.getByRole("heading", { level: 1, name: /The Cold Ember/i })).toBeVisible();

  await page.getByRole("button", { name: /Inspect the evidence/i }).click();
  await expect(page.getByRole("heading", { name: /Nothing here is silent/i })).toBeInViewport();
  await page.getByRole("button", { name: /The Cold Ember, return to the beginning/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /The Cold Ember/i })).toBeInViewport();

  const begin = page.getByRole("button", { name: /Begin the inquiry/i });
  await expect(begin).toBeVisible();
  await begin.click();

  const indexButton = page.getByRole("button", { name: /^Index$/i });
  await indexButton.click();
  const indexDialog = page.getByRole("dialog", { name: /Chapter index/i });
  await expect(indexDialog).toBeVisible();
  await indexDialog.getByRole("button", { name: /Close chapter index/i }).click();
  await expect(indexDialog).toBeHidden();

  const chapterIds = ["summons", "passage", "room", "archive", "conclusion"];
  for (const [index, chapterId] of chapterIds.entries()) {
    await indexButton.click();
    const chapterButtons = indexDialog.getByRole("listitem").getByRole("button");
    await expect(chapterButtons).toHaveCount(5);
    await chapterButtons.nth(index).click();
    await expect(indexDialog).toBeHidden();
    await expect(page.locator(`#${chapterId}-title`)).toBeFocused();
  }

  await page.getByRole("button", { name: /The Cold Ember, return to the beginning/i }).click();
  await expect(page.locator("#summons-title")).toBeFocused();
  const sceneNavigation = page.getByRole("navigation", { name: /Scene navigation/i });
  const previousScene = page.getByRole("button", { name: /Previous scene/i });
  const nextScene = page.getByRole("button", { name: /Next scene/i });
  await expect(previousScene).toBeVisible();
  await expect(nextScene).toBeVisible();
  await expect(previousScene).toBeDisabled();
  await expect(nextScene).toBeEnabled();
  for (let index = 1; index < chapterIds.length; index += 1) {
    await nextScene.click();
    await expect(page.locator(`#${chapterIds[index]}-title`)).toBeFocused();
    await expect(sceneNavigation).toContainText(`0${index + 1} / 0${chapterIds.length}`);
  }
  await expect(nextScene).toBeDisabled();
  await expect(previousScene).toBeEnabled();
  for (let index = chapterIds.length - 2; index >= 0; index -= 1) {
    await previousScene.click();
    await expect(page.locator(`#${chapterIds[index]}-title`)).toBeFocused();
    await expect(sceneNavigation).toContainText(`0${index + 1} / 0${chapterIds.length}`);
  }
  await expect(previousScene).toBeDisabled();
  await expect(nextScene).toBeEnabled();

  const inspectionLight = page.getByRole("button", { name: /Inspection light/i });
  await expect(inspectionLight).toBeVisible();
  await expect(inspectionLight).toHaveAttribute("aria-pressed", "false");
  await inspectionLight.click();
  await expect(inspectionLight).toHaveAttribute("aria-pressed", "true");
  await inspectionLight.click();
  await expect(inspectionLight).toHaveAttribute("aria-pressed", "false");

  const telegramScene = page.locator("section").filter({
    has: page.getByText("At Baker Street, the night arrives by wire.", { exact: true }),
  });
  await telegramScene.scrollIntoViewIfNeeded();
  const readTelegram = telegramScene.getByRole("button", { name: /Read the telegram/i });
  await readTelegram.click();
  await expect(telegramScene.getByRole("button", { name: /Fold the telegram/i })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(telegramScene.locator("#telegram-message")).toBeVisible();
  await telegramScene.getByRole("button", { name: /Fold the telegram/i }).click();
  await expect(telegramScene.getByRole("button", { name: /Read the telegram/i })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(telegramScene.locator("#telegram-message")).toBeHidden();

  const hansomScene = page.locator("section").filter({
    has: page.getByRole("heading", { name: /One wheel keeps time/i }),
  });
  await hansomScene.scrollIntoViewIfNeeded();
  const hansomControls = hansomScene.getByRole("button");
  expect(await hansomControls.count()).toBeGreaterThanOrEqual(1);
  for (const control of await hansomControls.all()) await control.click();

  const crimeHeading = page.getByRole("heading", { name: /Nothing here is silent/i });
  const crimeScene = page.locator("section").filter({ has: crimeHeading });
  await crimeScene.scrollIntoViewIfNeeded();
  const clues = crimeScene.getByLabel("Crime scene evidence").getByRole("button");
  await expect(clues).toHaveCount(4);
  for (const clue of await clues.all()) {
    await expect(clue).not.toHaveAccessibleName("");
    await clue.click();
  }

  const referenceHeading = page.getByRole("heading", {
    name: /Five books\. Four facts/i,
  });
  const referenceScene = page.locator("section").filter({ has: referenceHeading });
  await referenceScene.scrollIntoViewIfNeeded();
  const bookControls = referenceScene.getByRole("tab");
  await expect(bookControls).toHaveCount(4);
  await bookControls.first().focus();
  await page.keyboard.press("End");
  await expect(bookControls.last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(bookControls.first()).toHaveAttribute("aria-selected", "true");
  for (const book of await bookControls.all()) {
    await book.click();
    await expect(book).toHaveAttribute("aria-selected", "true");
  }

  const notesButton = page.getByRole("button", { name: /Case notes/i });
  await notesButton.click();
  const notesDialog = page.getByRole("dialog", { name: /Case notes/i });
  await expect(notesDialog).toBeVisible();
  expect(await notesDialog.getByRole("listitem").count()).toBeGreaterThanOrEqual(4);
  await notesDialog.getByRole("button", { name: /Clear (case )?notes/i }).click();
  await expect(notesDialog.getByRole("listitem")).toHaveCount(0);
  await notesDialog.getByRole("button", { name: /Close case notes|Close/i }).click();
  await expect(notesDialog).toBeHidden();

  const conclusionHeading = page.getByRole("heading", {
    name: /Dawn does not solve the case/i,
  });
  const conclusionScene = page.locator("section").filter({ has: conclusionHeading });
  await conclusionScene.scrollIntoViewIfNeeded();
  const conclusionChoices = conclusionScene.getByRole("radio");
  await expect(conclusionChoices).toHaveCount(3);
  const revealConclusion = conclusionScene.getByRole("button", {
    name: /Reveal Holmes’s conclusion/i,
  });
  await expect(revealConclusion).toBeDisabled();
  for (const [index, choice] of (await conclusionChoices.all()).entries()) {
    await choice.check();
    await expect(choice).toBeChecked();
    await revealConclusion.click();
    await expect(conclusionScene.getByRole("status")).toContainText(
      index === 1 ? /Your chain holds/i : /The clay contradicts it/i,
    );
  }

  const commissionActions = page.getByRole("button", {
    name: /Commission an immersive mystery/i,
  });
  await expect(commissionActions).toHaveCount(2);
  const inquiryDialog = page.getByRole("dialog", { name: /Commission an immersive mystery/i });
  for (const commissionAction of await commissionActions.all()) {
    await commissionAction.scrollIntoViewIfNeeded();
    await commissionAction.click();
    await expect(inquiryDialog).toBeVisible();
    await inquiryDialog.getByRole("button", { name: /Close inquiry/i }).click();
    await expect(inquiryDialog).toBeHidden();
  }

  const replay = conclusionScene.getByRole("button", { name: /Replay the case/i });
  await expect(replay).toBeVisible();
  await replay.click();
  await expect(page.getByRole("heading", { level: 1, name: /The Cold Ember/i })).toBeInViewport();

  const fieldNotes = page.locator("section").filter({
    has: page.getByRole("heading", { name: /The city was evidence/i }),
  });
  await fieldNotes.scrollIntoViewIfNeeded();
  const disclosures = fieldNotes.locator("details");
  await expect(disclosures).toHaveCount(3);
  for (const disclosure of await disclosures.all()) {
    await disclosure.locator("summary").click();
    await expect(disclosure).toHaveAttribute("open", "");
  }

  await page.getByRole("link", { name: /Return to the beginning/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: /The Cold Ember/i })).toBeInViewport();

  await expectNoHorizontalOverflow(page);
  await expectBasicAccessibility(page);
  await expectPrimaryTouchTargets(page);
  await runtime.assertClean(testInfo);
});

test("contains dialog focus, restores the opener, and closes with Escape", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");
  await waitForCasebookHydration(page);

  const indexButton = page.getByRole("button", { name: /^Index$/i });
  await indexButton.focus();
  await indexButton.click();
  const indexDialog = page.getByRole("dialog", { name: /Chapter index/i });
  await expect(indexDialog).toBeVisible();
  await expect
    .poll(() => indexDialog.evaluate((dialog) => dialog.contains(document.activeElement)))
    .toBe(true);

  const focusableCount = await indexDialog
    .locator('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
    .count();
  expect(focusableCount).toBeGreaterThan(1);
  for (let index = 0; index < focusableCount + 2; index += 1) await page.keyboard.press("Tab");
  expect(await indexDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);

  await page.keyboard.press("Escape");
  await expect(indexDialog).toBeHidden();
  await expect(indexButton).toBeFocused();

  const commissionAction = page
    .getByRole("button", { name: /Commission an immersive mystery/i })
    .last();
  await commissionAction.scrollIntoViewIfNeeded();
  await commissionAction.focus();
  await commissionAction.click();
  const inquiryDialog = page.getByRole("dialog", { name: /Commission an immersive mystery/i });
  await expect(inquiryDialog).toBeVisible();
  await expect
    .poll(() => inquiryDialog.evaluate((dialog) => dialog.contains(document.activeElement)))
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(inquiryDialog).toBeHidden();
  await expect(commissionAction).toBeFocused();

  await runtime.assertClean(testInfo);
});

test("persists the visitor's motion choice and honours reduced motion", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await page.addInitScript(() => {
    const runtimeWindow = window as Window & {
      __qaAmbienceDrawCount?: number;
      __qaScrollBehaviors?: string[];
      __qaSetHidden?: (hidden: boolean) => void;
    };
    const originalClearRect = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function clearRect(...args) {
      if (this.canvas.classList.contains("ambience")) {
        runtimeWindow.__qaAmbienceDrawCount =
          (runtimeWindow.__qaAmbienceDrawCount ?? 0) + 1;
      }
      return originalClearRect.apply(this, args);
    };

    let hidden = false;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      get: () => (hidden ? "hidden" : "visible"),
    });
    runtimeWindow.__qaSetHidden = (next) => {
      hidden = next;
      document.dispatchEvent(new Event("visibilitychange"));
    };

    runtimeWindow.__qaScrollBehaviors = [];
    const originalScrollIntoView = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoView(options) {
      const behaviour =
        typeof options === "object" && options?.behavior ? options.behavior : "auto";
      runtimeWindow.__qaScrollBehaviors?.push(behaviour);
      return originalScrollIntoView.call(this, options);
    };
  });
  await page.goto("/");
  await waitForCasebookHydration(page);

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __qaAmbienceDrawCount?: number })
            .__qaAmbienceDrawCount ?? 0,
      ),
    )
    .toBeGreaterThan(2);
  await page.evaluate(() =>
    (window as Window & { __qaSetHidden?: (hidden: boolean) => void }).__qaSetHidden?.(true),
  );
  await page.waitForTimeout(180);
  const drawsAfterVisibilitySettled = await page.evaluate(
    () =>
      (window as Window & { __qaAmbienceDrawCount?: number })
        .__qaAmbienceDrawCount ?? 0,
  );
  await page.waitForTimeout(180);
  const drawsWhileHidden = await page.evaluate(
    () =>
      (window as Window & { __qaAmbienceDrawCount?: number })
        .__qaAmbienceDrawCount ?? 0,
  );
  expect(
    drawsWhileHidden - drawsAfterVisibilitySettled,
    "ambience drawing should stop while the page is hidden",
  ).toBeLessThanOrEqual(1);
  await page.evaluate(() =>
    (window as Window & { __qaSetHidden?: (hidden: boolean) => void }).__qaSetHidden?.(false),
  );

  const pause = page.getByRole("button", { name: /Pause motion/i });
  await pause.click();
  const resume = page.getByRole("button", { name: /Resume motion/i });
  await expect(resume).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("cold-ember-motion")))
    .toMatch(/paused|false/i);
  await page.reload();
  await waitForCasebookHydration(page);
  await expect(page.getByRole("button", { name: /Resume motion/i })).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
      { message: "paused motion should settle without running animations" },
    )
    .toBe(0);
  await page.getByRole("button", { name: /Resume motion/i }).click();
  await expect(page.getByRole("button", { name: /Pause motion/i })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("cold-ember-motion")))
    .toMatch(/playing|true/i);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => localStorage.removeItem("cold-ember-motion"));
  await page.reload();
  await waitForCasebookHydration(page);
  await expect(page.getByRole("button", { name: /Resume motion/i })).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document
              .getAnimations()
              .filter((animation) => animation.playState === "running").length,
        ),
      { message: "reduced-motion mode should settle without running animations" },
    )
    .toBe(0);
  await page.getByRole("button", { name: /Inspect the evidence/i }).click();
  const reducedScrollBehaviors = await page.evaluate(
    () =>
      (window as Window & { __qaScrollBehaviors?: string[] }).__qaScrollBehaviors ?? [],
  );
  expect(reducedScrollBehaviors.at(-1)).not.toBe("smooth");

  await runtime.assertClean(testInfo);
});

test("validates and submits the consultation inquiry", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  let submittedBody = "";

  await page.route("**/", async (route) => {
    if (route.request().method() === "POST") {
      submittedBody = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><title>Received</title>" });
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await waitForCasebookHydration(page);
  await page.getByRole("button", { name: /Commission an immersive mystery/i }).last().click();
  const dialog = page.getByRole("dialog", { name: /Commission an immersive mystery/i });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /Close inquiry/i }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: /Commission an immersive mystery/i }).last().click();
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: /Send inquiry/i }).click();
  expect(await dialog.locator(":invalid").count()).toBeGreaterThan(0);

  await dialog.getByLabel(/Name/i).fill("Playwright Detective");
  await dialog.getByLabel(/Email/i).fill("qa+playwright@example.com");
  await dialog.getByLabel(/Project type/i).selectOption({ index: 1 });
  await dialog.getByLabel(/feel, discover, or do/i).fill(
    "An automated production-readiness inquiry for the moving casebook.",
  );
  const consent = dialog.getByRole("checkbox", { name: /consent|contact/i });
  if (await consent.count()) await consent.check();
  const encodedBeforeSubmit = await dialog.locator("form").evaluate((form) => {
    const data = new FormData(form as HTMLFormElement);
    const params = new URLSearchParams();
    data.forEach((value, key) => {
      if (typeof value === "string") params.append(key, value);
    });
    return params.toString();
  });
  await dialog.getByRole("button", { name: /Send inquiry/i }).click();

  await expect(dialog.getByRole("status")).toContainText(/received|thank|sent/i);
  const submissionEvidence = submittedBody || encodedBeforeSubmit;
  expect(submissionEvidence).toContain("form-name=consultation");
  expect(submissionEvidence).toContain("Playwright+Detective");
  expect(submissionEvidence).toContain("qa%2Bplaywright%40example.com");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toBeHidden();

  await runtime.assertClean(testInfo);
});
