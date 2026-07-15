import { expect, test } from "@playwright/test";
import { monitorRuntime } from "./helpers";

test.beforeEach(({ browserName }, testInfo) => {
  test.skip(
    browserName !== "chromium" || testInfo.project.name !== "desktop-chromium",
    "routing and metadata need one Chromium proof rather than duplicate viewport runs",
  );
});

test("publishes complete metadata and working deep links", async ({ page }, testInfo) => {
  const runtime = monitorRuntime(page);
  await page.goto("/");

  await expect(page).toHaveTitle("Sherlock Holmes: The Cold Ember | Interactive Victorian Mystery");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /Ride through 1895 London/i,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /^https:\/\/sherlock-cold-ember\.netlify\.app\/?$/,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /The Cold Ember/i);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.png$/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    /^https:\/\/sherlock-cold-ember\.netlify\.app\/?$/,
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "The Cold Ember",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    /moving casebook in five observations/i,
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    /Sherlock Holmes Moving Casebook/i,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
    "content",
    "Sherlock Holmes: The Cold Ember",
  );
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
    "content",
    /cinematic, interactive mystery/i,
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/og\.png$/);
  await expect(page.locator('meta[name="application-name"]')).toHaveAttribute(
    "content",
    "The Cold Ember",
  );
  await expect(page.locator('meta[name="author"]')).toHaveAttribute(
    "content",
    "The Cold Ember Studio",
  );
  await expect(page.locator('meta[name="creator"]')).toHaveAttribute(
    "content",
    "The Cold Ember Studio",
  );
  await expect(page.locator('meta[name="category"]')).toHaveAttribute(
    "content",
    "interactive storytelling",
  );
  await expect(page.locator('html')).toHaveAttribute("lang", "en");

  const structuredData = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(structuredData.length).toBeGreaterThan(0);
  for (const entry of structuredData) {
    expect(() => JSON.parse(entry)).not.toThrow();
    const data = JSON.parse(entry) as Record<string, unknown>;
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("WebSite");
    expect(data.name).toBe("The Cold Ember");
    expect(data.url).toBe("https://sherlock-cold-ember.netlify.app");
    expect(data.inLanguage).toBe("en-US");
  }

  const ids = await page.locator("main section.story-scene[id]").evaluateAll((sections) =>
    sections.map((section) => section.id),
  );
  expect(ids).toHaveLength(5);
  expect(new Set(ids).size).toBe(5);
  for (const id of ids) {
    expect(id).toMatch(/^[a-z][\w-]+$/i);
    await page.goto(`/#${id}`);
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }

  await runtime.assertClean(testInfo);
});

test("serves crawl routes, social art, icons, form markup, and every scene asset", async ({ request }) => {
  const [robots, sitemap, socialCard, favicon, formDetector, missing] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
    request.get("/og.png"),
    request.get("/favicon.ico"),
    request.get("/__forms.html"),
    request.get("/this-case-does-not-exist"),
  ]);

  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/Sitemap:\s*https:\/\/sherlock-cold-ember\.netlify\.app\/sitemap\.xml/i);
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://sherlock-cold-ember.netlify.app</loc>");
  expect(socialCard.status()).toBe(200);
  expect(socialCard.headers()["content-type"]).toMatch(/^image\/png/i);
  const socialCardBody = await socialCard.body();
  expect(socialCardBody.byteLength).toBeGreaterThan(10_000);
  expect(socialCardBody.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  expect(socialCardBody.readUInt32BE(16)).toBe(1200);
  expect(socialCardBody.readUInt32BE(20)).toBe(630);
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()["content-type"]).toMatch(/^image\/x-icon|image\/vnd\.microsoft\.icon/i);
  expect(formDetector.status()).toBe(200);
  expect(await formDetector.text()).toMatch(/name=["']consultation["']/i);
  expect(missing.status()).toBe(404);

  const sceneNames = ["telegram", "hansom", "crime-room", "reference-room", "deduction"];
  for (const sceneName of sceneNames) {
    for (const extension of ["avif", "jpg"] as const) {
      const response = await request.get(`/scenes/${sceneName}.${extension}`);
      expect(response.status(), `${sceneName}.${extension} should return 200`).toBe(200);
      expect(response.headers()["content-type"]).toMatch(
        extension === "avif" ? /^image\/avif/i : /^image\/jpeg/i,
      );
      expect((await response.body()).byteLength).toBeGreaterThan(20_000);
    }
  }
});

test("renders the designed 404 and returns the visitor to the case", async ({ page }) => {
  const response = await page.goto("/this-case-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: /This trail goes cold/i })).toBeVisible();
  await expect(page.getByText("404", { exact: true })).toBeVisible();
  const image = page.locator(".missing-page img");
  await expect(image).toHaveAttribute("alt", "");
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(1_000);
  await page.getByRole("link", { name: /Return to The Cold Ember/i }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /The Cold Ember/i })).toBeVisible();
});
