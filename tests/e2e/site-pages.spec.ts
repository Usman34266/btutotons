import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { field, resultValue } from "./helpers";

const SITE = "https://btutotons.com";
const GUIDE = "/ac-tonnage-by-model-number/";

const PAGES = [
  {
    path: GUIDE,
    title: "AC Tonnage by Model Number [Nameplate Guide]",
    h1: "Find AC Tonnage by Model Number",
  },
  {
    path: "/methodology/",
    title: "Methodology [Constants, Sources and Rounding]",
    h1: "Methodology",
  },
  { path: "/about/", title: "About BTU to Tons", h1: "About BTU to Tons" },
  {
    path: "/privacy/",
    title: "Privacy Policy | BTU to Tons",
    h1: "Privacy Policy",
  },
  { path: "/terms/", title: "Terms of Use | BTU to Tons", h1: "Terms of Use" },
];

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await page.waitForLoadState("networkidle");
}

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
  ).violations;

const capacityInput = (page: Page) =>
  page.getByRole("textbox", { name: "Rated cooling capacity" });

test.describe("static pages", () => {
  test("serve their title, canonical, H1 and breadcrumb as static HTML", async ({
    request,
  }) => {
    for (const { path, title, h1 } of PAGES) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`<title>${title}</title>`);
      expect(html, path).toContain(
        `<link rel="canonical" href="${SITE}${path}"/>`,
      );
      expect(html, path).toContain(`<h1>${h1}</h1>`);
      expect(html, path).toContain('aria-label="Breadcrumb"');
    }
  });

  test("never show a placeholder that needs a human", async ({ request }) => {
    for (const { path } of PAGES) {
      const html = await (await request.get(path)).text();
      for (const text of ["Last updated", "Method updated", "run by"])
        expect(html, `${path}: ${text}`).not.toContain(text);
      for (const [mailto] of html.matchAll(/mailto:[^"\\]*/g))
        expect(mailto, path).toBe("mailto:contact@btutotons.com");
    }
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const { path } of PAGES) {
        await open(page, path);
        expect(await scan(page), path).toEqual([]);
      }
      await open(page, "/not-a-page/");
      expect(await scan(page)).toEqual([]);
    });
  }
});

test.describe("nameplate guide", () => {
  test("every hotspot explanation is in the static HTML", async ({
    request,
  }) => {
    const html = await (await request.get(GUIDE)).text();
    for (const text of [
      "Example nameplate, not a real product.",
      "This is the number to convert",
      "Electrical, not tonnage",
      "Cooling capacity does not determine breaker size.",
      "Refrigerant weight, not tons",
      "Codes vary by manufacturer",
      "Use the rated cooling capacity first. Model-number codes vary by manufacturer and product family.",
      "No model families are verified here yet",
    ])
      expect(html, text).toContain(text);
  });

  test("hotspots highlight their explanation", async ({ page }) => {
    await open(page, GUIDE);
    const labels = page.getByRole("list", { name: "Nameplate labels" });
    const capacity = labels.getByRole("button", { name: /Cooling capacity/ });
    const electrical = labels.getByRole("button", { name: /MCA \/ MOCP/ });
    await expect(capacity).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#nameplate-capacity")).toHaveAttribute(
      "data-active",
      "true",
    );

    await electrical.click();
    await expect(electrical).toHaveAttribute("aria-pressed", "true");
    await expect(capacity).toHaveAttribute("aria-pressed", "false");
    const key = page.locator("#nameplate-electrical");
    await expect(key).toHaveAttribute("data-active", "true");
    await expect(key).toBeInViewport();

    await labels.getByRole("button", { name: /Model no/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#nameplate-model")).toHaveAttribute(
      "data-active",
      "true",
    );
  });

  test("the form converts 35,000 BTU/hr and cooling kW", async ({ page }) => {
    await open(page, GUIDE);
    const tons = page.getByTestId("nameplate-tons");
    await expect(capacityInput(page)).toHaveValue("35,000");
    await expect(tons).toHaveText("2.9167 refrigeration tons");
    await expect(page.getByTestId("nameplate-result")).toContainText(
      "Converted rated capacity",
    );

    await capacityInput(page).fill("3.5168528420667");
    await page.getByRole("combobox", { name: "Unit" }).selectOption("kw");
    await expect(tons).toHaveText("1 refrigeration ton");
  });

  test("shows the engine's error copy and no stale result", async ({
    page,
  }) => {
    await open(page, GUIDE);
    await capacityInput(page).fill("12abc");
    await capacityInput(page).blur();
    await expect(
      page.getByText("Use numbers only, like 24000 or 24,000."),
    ).toBeVisible();
    await expect(capacityInput(page)).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("nameplate-tons")).toHaveCount(0);
  });

  test("opens the rating in the calculator", async ({ page }) => {
    await open(page, GUIDE);
    await capacityInput(page).fill("24000");
    await page.getByRole("link", { name: "Open in the calculator" }).click();
    await expect(page).toHaveURL(/\/#v=24000&u=btuh$/);
    await expect(field(page)).toHaveValue("24,000");
    await expect(resultValue(page)).toHaveText("2");
  });

  test("the header Guides link opens it", async ({ page }) => {
    await open(page, "/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Guides" })
      .click();
    await expect(page).toHaveURL(new RegExp(`${GUIDE}$`));
  });
});

test.describe("methodology", () => {
  test("lists the constants, source and engine version", async ({
    request,
  }) => {
    const html = await (await request.get("/methodology/")).text();
    for (const text of [
      "12,000 BTU/hr",
      "1,055.05585262 J",
      "0.2930710701722222 W",
      "3.516853 cooling kW",
      "Tons = BTU/hr ÷ 12,000",
      "A value within 10% of a nominal size",
      "Nominal sizes: 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5 tons.",
      "Calculation engine version 1.0.0.",
      'href="https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8"',
    ])
      expect(html, text).toContain(text);
  });
});

test.describe("404", () => {
  test("is a real 404 with links to the converter and the chart", async ({
    page,
  }) => {
    const res = await page.goto("/not-a-page/");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Page not found",
    );
    const main = page.getByRole("main");
    await expect(
      main.getByRole("link", { name: "BTU to Tons Calculator" }),
    ).toHaveAttribute("href", "/");
    await main
      .getByRole("link", { name: "BTU to tons conversion chart" })
      .click();
    await expect(page).toHaveURL(/\/#chart$/);
  });
});
