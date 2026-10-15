import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page renders its H1 from static HTML", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "BTU to Tons Calculator",
  );
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
});

test("home page has no axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("old calculator URL 301-redirects to /", async ({ request }) => {
  const res = await request.get("/btu-to-tons-calculator/", {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(301);
  expect(new URL(res.headers()["location"] ?? "", "http://x").pathname).toBe(
    "/",
  );
});

test("unknown routes return a real 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found",
  );
});

test("security headers are served", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
  expect(res.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
});
