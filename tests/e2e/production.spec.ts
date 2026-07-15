import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "";
const isProductionHttps = /^https:\/\//.test(baseURL);

test.beforeEach(({}, testInfo) => {
  test.skip(
    !isProductionHttps || testInfo.project.name !== "desktop-chromium",
    "production checks require PLAYWRIGHT_BASE_URL=https://... and run once on desktop",
  );
});

test("production serves the hardened browser security policy", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);

  const headers = response.headers();
  const csp = headers["content-security-policy"];
  for (const directive of [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "img-src 'self' data: blob:",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "worker-src 'self' blob:",
  ]) {
    expect(csp, `CSP should contain ${directive}`).toContain(directive);
  }
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toMatch(/DENY/i);
  expect(headers["x-permitted-cross-domain-policies"]).toBe("none");
  expect(headers["referrer-policy"]).toMatch(/strict-origin-when-cross-origin/i);
  expect(headers["strict-transport-security"]).toMatch(
    /^max-age=63072000;\s*includeSubDomains;\s*preload$/i,
  );
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
  expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
  for (const permission of [
    "accelerometer=()",
    "autoplay=()",
    "camera=()",
    "display-capture=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "payment=()",
    "usb=()",
  ]) {
    expect(headers["permissions-policy"]).toContain(permission);
  }
  expect(headers["cache-control"] ?? "").not.toContain("immutable");
});

test("production applies the intended HTML and asset cache policies", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  expect(home.headers()["cache-control"] ?? "").not.toContain("immutable");

  const html = await home.text();
  const staticAssetPath = html.match(/(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/)?.[1];
  expect(staticAssetPath, "rendered HTML should reference a Next static asset").toBeTruthy();
  const staticAsset = await request.get(staticAssetPath!);
  expect(staticAsset.status()).toBe(200);
  expect(staticAsset.headers()["cache-control"]).toMatch(/max-age=31536000/i);
  expect(staticAsset.headers()["cache-control"]).toMatch(/immutable/i);

  const sceneAsset = await request.get("/scenes/telegram.avif");
  expect(sceneAsset.status()).toBe(200);
  expect(sceneAsset.headers()["cache-control"]).toMatch(/max-age=86400/i);
  expect(sceneAsset.headers()["cache-control"]).toMatch(/stale-while-revalidate=604800/i);
});

test("production has no mixed or third-party executable resources", async ({ page }) => {
  const executableUrls = new Set<string>();
  page.on("request", (request) => {
    if (["script", "stylesheet", "font", "worker"].includes(request.resourceType())) {
      executableUrls.add(request.url());
    }
  });

  await page.goto("/");
  const origin = new URL(page.url()).origin;
  for (const url of executableUrls) {
    expect(url.startsWith("https://"), `${url} should use HTTPS`).toBe(true);
    expect(new URL(url).origin, `${url} should be same origin`).toBe(origin);
  }
});

test("production records a real Netlify form submission", async ({ page }, testInfo) => {
  test.skip(process.env.PLAYWRIGHT_LIVE_FORM !== "1", "opt in with PLAYWRIGHT_LIVE_FORM=1");

  await page.goto("/");
  await page.getByRole("button", { name: /Commission an immersive mystery/i }).last().click();
  const dialog = page.getByRole("dialog", { name: /Commission an immersive mystery/i });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await dialog.getByLabel(/Name/i).fill("Production Verification");
  await dialog.getByLabel(/Email/i).fill(`qa+${stamp}@example.com`);
  await dialog.getByLabel(/Project type/i).selectOption({ index: 1 });
  await dialog.getByLabel(/feel, discover, or do/i).fill(
    `Netlify production verification from ${testInfo.project.name} at ${stamp}.`,
  );
  const consent = dialog.getByRole("checkbox", { name: /consent|contact/i });
  if (await consent.count()) await consent.check();
  await dialog.getByRole("button", { name: /Send inquiry/i }).click();
  await expect(dialog.getByRole("status")).toContainText(/received|thank|sent/i);
});
