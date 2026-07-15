import { expect, type Page, type TestInfo } from "@playwright/test";

type RuntimeFinding = {
  kind: "console" | "pageerror" | "requestfailed" | "http";
  detail: string;
  url?: string;
};

export function monitorRuntime(page: Page) {
  const findings: RuntimeFinding[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      findings.push({ kind: "console", detail: message.text() });
    }
  });

  page.on("pageerror", (error) => {
    findings.push({ kind: "pageerror", detail: error.stack ?? error.message });
  });

  page.on("requestfailed", (request) => {
    const detail = request.failure()?.errorText ?? "unknown request failure";
    if (!detail.includes("ERR_ABORTED")) {
      findings.push({ kind: "requestfailed", detail, url: request.url() });
    }
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      findings.push({
        kind: "http",
        detail: `${response.status()} ${response.statusText()}`,
        url: response.url(),
      });
    }
  });

  return {
    async assertClean(testInfo: TestInfo) {
      const pageOrigin = new URL(page.url()).origin;
      const relevant = findings.filter((finding) => {
        if (!finding.url) return true;
        try {
          return new URL(finding.url).origin === pageOrigin;
        } catch {
          return true;
        }
      });

      if (relevant.length > 0) {
        await testInfo.attach("runtime-findings", {
          body: Buffer.from(JSON.stringify(relevant, null, 2)),
          contentType: "application/json",
        });
      }

      expect(relevant, "page should have no console, page, HTTP, or request failures").toEqual([]);
    },
  };
}

export async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(
    dimensions.scrollWidth,
    `document width ${dimensions.scrollWidth}px should fit viewport ${dimensions.clientWidth}px`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

export async function waitForCasebookHydration(page: Page) {
  const waitForCanvas = (timeout: number) =>
    expect
      .poll(
        () =>
          page.evaluate(() => {
            const canvas = document.querySelector<HTMLCanvasElement>("canvas.ambience");
            return canvas ? canvas.width : 0;
          }),
        {
          message: "the client casebook should hydrate and initialise its ambience canvas",
          timeout,
        },
      )
      .toBeGreaterThan(300);

  const hostname = new URL(page.url()).hostname;
  const isLocalPreview = hostname === "localhost" || hostname === "127.0.0.1";
  try {
    await waitForCanvas(isLocalPreview ? 25_000 : 30_000);
  } catch (error) {
    if (!isLocalPreview) throw error;
    await page.reload({ waitUntil: "domcontentloaded" });
    await waitForCanvas(30_000);
  }
  await expect(page.getByRole("button", { name: /Pause motion|Resume motion/i })).toBeEnabled();
}

export async function expectBasicAccessibility(page: Page) {
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).not.toHaveText("");

  const findings = await page.evaluate(() => {
    const failures: string[] = [];
    const describe = (element: Element) => {
      const htmlElement = element as HTMLElement;
      return `${element.tagName.toLowerCase()}#${htmlElement.id || "-"}.${htmlElement.className || "-"}`;
    };

    document.querySelectorAll("img").forEach((image) => {
      if (!image.hasAttribute("alt")) failures.push(`${describe(image)} has no alt attribute`);
    });

    document.querySelectorAll("button, a[href]").forEach((control) => {
      const name =
        control.getAttribute("aria-label") ||
        control.getAttribute("aria-labelledby") ||
        control.textContent?.trim();
      if (!name) failures.push(`${describe(control)} has no accessible name`);
    });

    document.querySelectorAll("input:not([type='hidden']), select, textarea").forEach((field) => {
      const id = field.getAttribute("id");
      const labelled =
        field.getAttribute("aria-label") ||
        field.getAttribute("aria-labelledby") ||
        (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
        field.closest("label");
      if (!labelled) failures.push(`${describe(field)} has no programmatic label`);
    });

    const headingLevels = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(
      (heading) => Number(heading.tagName.slice(1)),
    );
    for (let index = 1; index < headingLevels.length; index += 1) {
      if (headingLevels[index] - headingLevels[index - 1] > 1) {
        failures.push(
          `heading order skips from h${headingLevels[index - 1]} to h${headingLevels[index]}`,
        );
      }
    }

    document.querySelectorAll("canvas").forEach((canvas) => {
      if (canvas.getAttribute("aria-hidden") !== "true") {
        failures.push(`${describe(canvas)} is decorative but not aria-hidden`);
      }
    });

    return failures;
  });

  expect(findings, "basic semantic and accessible-name checks").toEqual([]);
}

export async function expectPrimaryTouchTargets(page: Page) {
  const undersized = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLElement>(
        "header button, main button, dialog button, .sound-console button, .cinematic-caption button, input:not([type='checkbox']):not([type='radio']):not([name='bot-field']), select",
      ),
    ]
      .filter((element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0 &&
          (rect.width < 24 || rect.height < 24)
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return `${element.tagName.toLowerCase()}[${element.getAttribute("aria-label") || element.textContent?.trim() || element.id}] ${Math.round(rect.width)}x${Math.round(rect.height)}`;
      }),
  );

  expect(undersized, "primary interactive targets should meet the 24px minimum").toEqual([]);
}
