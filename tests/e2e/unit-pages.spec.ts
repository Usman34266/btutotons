import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { errorMessage, field, resultValue, sentence } from "./helpers";

/** Set when the served build is `pnpm build:preview` (D100). */
const PREVIEW = process.env.NEXT_PUBLIC_BTUTOTONS_PREVIEW === "1";

const PAGES = [
  {
    path: "/kw-to-tons/",
    h1: "kW to Tons Calculator",
    input: "3.5",
    value: "0.9952",
    sentence: "3.5 cooling kW equals 0.9952 refrigeration tons.",
  },
  {
    path: "/tons-to-kw/",
    h1: "Tons to kW Calculator",
    input: "2",
    value: "7.0337",
    sentence: "2 refrigeration tons equal 7.0337 cooling kW.",
  },
  {
    path: "/btu-to-kw/",
    h1: "BTU/hr to kW Calculator",
    input: "24000",
    value: "7.0337",
    sentence: "24,000 BTU/hr equals 7.0337 cooling kW.",
  },
  {
    path: "/kw-to-btu/",
    h1: "kW to BTU/hr Calculator",
    input: "3.5",
    value: "11,942.4957",
    sentence: "3.5 cooling kW equals 11,942.4957 BTU/hr.",
  },
  {
    path: "/btu-per-minute-to-tons/",
    h1: "BTU per Minute to Tons Calculator",
    input: "200",
    value: "1",
    sentence: "200 BTU/min equals 1 refrigeration ton.",
  },
  {
    path: "/btu-per-second-to-tons/",
    h1: "BTU per Second to Tons Calculator",
    input: "10",
    value: "3",
    sentence: "10 BTU/s equals 3 refrigeration tons.",
  },
] as const;

const ALIASES = [
  "/kw-to-ton/",
  "/ton-to-kw/",
  "/btu-per-minute-to-ton/",
  "/btu-per-second-to-ton/",
];

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForFunction(
    () => document.querySelector("input[name=value]") !== null,
  );
  await page.waitForLoadState("networkidle");
}

async function sitemapPaths(page: Page) {
  const xml = await (await page.request.get("/sitemap.xml")).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => new URL(m[1]!).pathname,
  );
}

test.describe("unit pages: production build", () => {
  test.skip(PREVIEW, "preview build exports the unpublished pages");

  test("unpublished pages and their aliases are real 404s", async ({
    request,
  }) => {
    for (const path of [...PAGES.map((p) => p.path), ...ALIASES]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
    }
  });

  test("the sitemap leaves them out", async ({ page }) => {
    const paths = await sitemapPaths(page);
    for (const p of PAGES) expect(paths).not.toContain(p.path);
  });
});

test.describe("unit pages: preview build", () => {
  test.skip(!PREVIEW, "needs `pnpm build:preview`");

  test("are exported noindex, outside the sitemap, with share cards", async ({
    page,
  }) => {
    const paths = await sitemapPaths(page);
    for (const p of PAGES) {
      const res = await page.request.get(p.path);
      expect(res.status(), p.path).toBe(200);
      const html = await res.text();
      expect(html, p.path).toContain(
        '<meta name="robots" content="noindex, nofollow"/>',
      );
      expect(paths).not.toContain(p.path);
      const card = await page.request.get(`${p.path}opengraph-image`);
      expect(card.status(), p.path).toBe(200);
      expect(card.headers()["content-type"]).toBe("image/png");
    }
  });

  for (const p of PAGES) {
    test(`${p.path} converts its example into the page's unit`, async ({
      page,
    }) => {
      await open(page, p.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
      await expect(page.getByTestId("result-empty")).toBeVisible();
      await field(page).fill(p.input);
      await expect(resultValue(page)).toHaveText(p.value);
      await expect(sentence(page)).toHaveText(p.sentence);
      await expect(page.getByTestId("worked-example")).toBeVisible();
    });
  }

  test("shows the other units and the math", async ({ page }) => {
    await open(page, "/kw-to-tons/");
    await field(page).fill("3.5");
    await expect(page.getByTestId("result-btuh")).toHaveText("11,942.4957");
    await expect(page.getByTestId("result-kw")).toHaveCount(0);
    await page.getByRole("button", { name: "Show the math" }).click();
    await expect(
      page
        .getByTestId("result")
        .getByText(
          "3.5 × 1,000 ÷ 0.2930710702 = 11,942.4957 BTU/hr; 11,942.4957 ÷ 12,000 = 0.9952",
        ),
    ).toBeVisible();
  });

  test("writes and reads the share fragment in the page's input unit", async ({
    page,
  }) => {
    await open(page, "/kw-to-btu/");
    await field(page).fill("3.5");
    await expect(page).toHaveURL(/#v=3\.5&u=kw&p=4$/);

    await open(page, "/tons-to-kw/#v=2&u=tr&p=2");
    await expect(field(page)).toHaveValue("2");
    await expect(resultValue(page)).toHaveText("7.03");
  });

  test("ignores a shared value in a different unit", async ({ page }) => {
    await open(page, "/kw-to-btu/#v=24000&u=btuh&p=4");
    await expect(field(page)).toHaveValue("");
    await expect(page.getByTestId("result-empty")).toBeVisible();
  });

  test("shows the homepage's error copy for bad input", async ({ page }) => {
    await open(page, "/btu-to-kw/");
    await field(page).fill("abc");
    await field(page).blur();
    await expect(errorMessage(page)).toBeVisible();
    await expect(field(page)).toHaveAttribute("aria-invalid", "true");
  });

  test("links home and to the reverse page", async ({ page }) => {
    await open(page, "/kw-to-tons/");
    const more = page.getByRole("navigation", { name: "More conversions" });
    await expect(more.getByRole("link")).toHaveText([
      "BTU to Tons Calculator",
      "Tons to kW Calculator",
    ]);
  });

  test("fits 360px without sideways scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const p of PAGES) {
      await open(page, p.path);
      await field(page).fill(p.input);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        ),
        p.path,
      ).toBe(0);
    }
  });

  test("works from the keyboard alone", async ({ page }) => {
    await open(page, "/kw-to-tons/");
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      if (await field(page).evaluate((el) => el === document.activeElement))
        break;
    }
    await expect(field(page)).toBeFocused();
    await page.keyboard.type("3.5");
    await expect(resultValue(page)).toHaveText("0.9952");
    const math = page.getByRole("button", { name: "Show the math" });
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      if (await math.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(math).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(math).toHaveAttribute("aria-expanded", "true");
  });

  test("reflows at 200% zoom", async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 640, height: 450 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await open(page, "/kw-to-btu/");
    await field(page).fill("3.5");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBe(0);
    await context.close();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`passes axe with a result and a table (${scheme})`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, "/tons-to-kw/");
      await field(page).fill("2");
      await page.getByRole("button", { name: "Show the math" }).click();
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(violations).toEqual([]);
    });
  }
});
