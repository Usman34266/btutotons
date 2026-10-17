import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { field, resultValue } from "./helpers";

const SITE = "https://btutotons.com";

/** Every curated numeric page: path → title and H1 (spec pp. 20–23). */
const NUMERIC = [
  ...[6, 8, 9, 10, 12, 18, 24, 30, 36, 42, 48, 60].map((k) => {
    const n = (k * 1000).toLocaleString("en-US");
    return { path: `/${k * 1000}-btu-to-tons/`, h1: `${n} BTU to Tons` };
  }),
  ...["1", "1.5", "2", "2.5", "3", "3.5", "4", "5"].map((t) => ({
    path: `/${t.replace(".", "-")}-ton-to-btu/`,
    h1: `${t} Ton to BTU Converter`,
  })),
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

const overflowX = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("numeric pages", () => {
  test("all 20 serve 200 with their own H1, canonical and breadcrumb", async ({
    request,
  }) => {
    for (const { path, h1 } of NUMERIC) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      const html = await res.text();
      expect(html, path).toContain(`<h1>${h1}</h1>`);
      expect(html, path).toContain(
        `<link rel="canonical" href="${SITE}${path}"/>`,
      );
      expect(html, path).toContain('aria-label="Breadcrumb"');
    }
  });

  test("answer, worked example, table and links are static HTML", async ({
    request,
  }) => {
    const html = await (await request.get("/24000-btu-to-tons/")).text();
    expect(html).toContain(
      "<title>24,000 BTU to Tons = 2 [Formula + Chart]</title>",
    );
    expect(html).toContain("24,000 ÷ 12,000 = 2 tons");
    expect(html).toContain("Compare 24,000 with 18,000 and 30,000 BTU/hr");
    expect(html).toContain("Does 2 tons mean it fits my space?");
    for (const href of [
      "/2-ton-to-btu/",
      "/18000-btu-to-tons/",
      "/30000-btu-to-tons/",
    ])
      expect(html).toContain(`href="${href}"`);
  });

  test("leads with the answer and the AC size; rounded values say so", async ({
    page,
  }) => {
    await open(page, "/24000-btu-to-tons/");
    await expect(page.getByTestId("answer")).toHaveText(
      "24,000 BTU per hour equals 2 refrigeration tons. That's a 2 ton AC size.",
    );
    await open(page, "/8000-btu-to-tons/");
    await expect(page.getByTestId("answer")).toHaveText(
      "8,000 BTU per hour equals 0.6667 refrigeration tons (rounded). That's between the 0.5 and 0.75 ton AC sizes.",
    );
    await open(page, "/1-ton-to-btu/");
    await expect(page.getByTestId("answer")).toHaveText(
      "1 refrigeration ton equals 12,000 BTU per hour. Multiply 1 by 12,000.",
    );
  });

  test("the converter is prefilled and editing never navigates", async ({
    page,
  }) => {
    await open(page, "/24000-btu-to-tons/");
    await expect(field(page)).toHaveValue("24,000");
    await expect(resultValue(page)).toHaveText("2");
    await field(page).fill("30000");
    await expect(resultValue(page)).toHaveText("2.5");
    expect(new URL(page.url()).pathname).toBe("/24000-btu-to-tons/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "24,000 BTU to Tons",
    );
  });

  test("a ton page starts in the tons direction", async ({ page }) => {
    await open(page, "/1-5-ton-to-btu/");
    await expect(field(page)).toHaveValue("1.5");
    await expect(resultValue(page)).toHaveText("18,000");
    await expect(
      page.getByRole("radio", { name: "Tons → BTU/hr" }),
    ).toBeChecked();
  });

  test("comparison rows link to the neighbours, not to the page itself", async ({
    page,
  }) => {
    await open(page, "/6000-btu-to-tons/");
    const table = page.getByRole("region", {
      name: "Compare 6,000 with 8,000 and 9,000 BTU/hr",
    });
    await expect(table.getByRole("link")).toHaveCount(2);
    await table.getByRole("link", { name: "8,000 BTU to Tons" }).click();
    await expect(page).toHaveURL(/\/8000-btu-to-tons\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "8,000 BTU to Tons",
    );
  });

  test("breadcrumb leads home", async ({ page }) => {
    await open(page, "/3-5-ton-to-btu/");
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("listitem")).toHaveText([
      "Home",
      "3.5 Ton to BTU Converter",
    ]);
    await crumbs.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("prefetch payloads are served without a redirect", async ({
    request,
  }) => {
    const res = await request.get(
      "/24000-btu-to-tons/__next.$d$slug.__PAGE__.txt",
      { maxRedirects: 0 },
    );
    expect(res.status()).toBe(200);
  });

  test("unknown numeric values are a real 404", async ({ request }) => {
    expect((await request.get("/7000-btu-to-tons/")).status()).toBe(404);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`no axe violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await open(page, "/10000-btu-to-tons/");
      expect(await scan(page)).toEqual([]);
      await open(page, "/2-5-ton-to-btu/");
      expect(await scan(page)).toEqual([]);
    });
  }
});

test.describe("redirects", () => {
  const CASES: [string, string][] = [
    ["/24000-btu-to-ton/", "/24000-btu-to-tons/"],
    ["/24000-btu-to-ton", "/24000-btu-to-tons/"],
    ["/2-tons-to-btu/", "/2-ton-to-btu/"],
    ["/1-5-tons-to-btu/", "/1-5-ton-to-btu/"],
    ["/ton-to-btu/", "/tons-to-btu/"],
    ["/btu-to-tons-calculator/", "/"],
  ];
  test("spelling variants 301 to the canonical page", async ({ request }) => {
    for (const [from, to] of CASES) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(res.headers().location, from).toBe(to);
    }
  });
});

test.describe("tons to BTU page", () => {
  test("serves its metadata, H1 and opening as static HTML", async ({
    request,
  }) => {
    const html = await (await request.get("/tons-to-btu/")).text();
    expect(html).toContain(
      "<title>Tons to BTU Calculator [12,000 BTU/hr per Ton]</title>",
    );
    expect(html).toContain(
      `<link rel="canonical" href="${SITE}/tons-to-btu/"/>`,
    );
    expect(html).toContain("<h1>Tons to BTU Calculator</h1>");
    expect(html).toContain(
      "1 ton = 12,000 BTU/hr. Enter a refrigeration-ton rating to see its equivalent capacity.",
    );
    expect(html).toContain("2 × 12,000 = 24,000 BTU/hr");
  });

  test("converts tons to BTU/hr and lists the ton pages", async ({ page }) => {
    await open(page, "/tons-to-btu/");
    await expect(
      page.getByRole("radio", { name: "Tons → BTU/hr" }),
    ).toBeChecked();
    await field(page).fill("3");
    await expect(resultValue(page)).toHaveText("36,000");
    const table = page.getByRole("region", { name: "Common ton ratings" });
    await expect(table.getByRole("link")).toHaveCount(8);
    await expect(
      table.getByRole("link", { name: "1.5 Ton to BTU Converter" }),
    ).toHaveAttribute("href", "/1-5-ton-to-btu/");
  });

  test("no axe violations", async ({ page }) => {
    await open(page, "/tons-to-btu/");
    expect(await scan(page)).toEqual([]);
  });
});

test.describe("homepage content", () => {
  test("chart, explainer, trust and FAQ are static HTML", async ({
    request,
  }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain('id="chart"');
    expect(html).toContain("BTU to tons conversion chart");
    expect(html).toContain("Common capacity examples");
    expect(html).toContain("What do BTU/hr and refrigeration tons mean?");
    expect(html).toContain("Method:");
    expect(html).toContain("What size AC is 19,000 BTU?");
    // No release date or reviewer yet: neither is faked.
    expect(html).not.toContain("Method updated");
    expect(html).not.toContain("Reviewed by");
  });

  test("the chart has 12 rows, each linked to its numeric page", async ({
    page,
  }) => {
    await open(page, "/");
    const chart = page.getByRole("region", {
      name: "Common capacity examples",
    });
    await expect(chart.getByRole("row")).toHaveCount(13);
    await expect(chart.getByRole("link")).toHaveCount(12);
    await expect(
      chart.getByRole("row", { name: /^10,000 / }).getByRole("cell"),
    ).toHaveText(["0.8333", "2.9307", "Between 0.75 and 1 ton"]);
    await chart.getByRole("link", { name: "36,000 BTU to Tons" }).click();
    await expect(page).toHaveURL(/\/36000-btu-to-tons\/$/);
  });

  test("the header Chart link goes to the chart", async ({ page }) => {
    await open(page, "/batch-btu-to-tons/");
    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "Chart" })
      .click();
    await expect(page).toHaveURL(/\/#chart$/);
    await expect(
      page.getByRole("heading", { name: "BTU to tons conversion chart" }),
    ).toBeInViewport();
  });

  test("quick values fill the calculator; details links open the page", async ({
    page,
  }) => {
    await open(page, "/");
    await page.getByRole("button", { name: "Convert 18,000 BTU/hr" }).click();
    await expect(resultValue(page)).toHaveText("1.5");
    await page
      .getByRole("region", { name: "Common AC ratings" })
      .getByRole("link", { name: "18,000 BTU to Tons" })
      .click();
    await expect(page).toHaveURL(/\/18000-btu-to-tons\/$/);
  });

  test("the footer links only to live pages", async ({ page }) => {
    await open(page, "/");
    const tools = page.getByRole("navigation", { name: "Related tools" });
    await expect(tools.getByRole("link")).toHaveText([
      "BTU to Tons Calculator",
      "Tons to BTU Calculator",
      "Batch BTU to Tons",
      "Nameplate guide",
    ]);
    const site = page.getByRole("navigation", { name: "About this site" });
    await expect(site.getByRole("link")).toHaveText([
      "About",
      "Methodology",
      "Privacy",
      "Terms",
      "Contact",
    ]);
  });

  test("section 08 and the trust block link to the guide and the method", async ({
    page,
  }) => {
    await open(page, "/");
    await page.getByRole("link", { name: "Read the nameplate guide" }).click();
    await expect(page).toHaveURL(/\/ac-tonnage-by-model-number\/$/);
    await open(page, "/");
    await page
      .getByTestId("trust")
      .getByRole("link", { name: "How the numbers are calculated" })
      .click();
    await expect(page).toHaveURL(/\/methodology\/$/);
  });
});

test.describe("360px", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("content pages never scroll sideways", async ({ page }) => {
    for (const path of [
      "/",
      "/8000-btu-to-tons/",
      "/1-5-ton-to-btu/",
      "/tons-to-btu/",
      "/ac-tonnage-by-model-number/",
      "/methodology/",
      "/about/",
      "/privacy/",
      "/terms/",
      "/not-a-page/",
    ]) {
      await open(page, path);
      expect(await overflowX(page), path).toBe(0);
      // Tables fit, so their regions don't scroll either.
      const tableOverflow = await page.evaluate(() =>
        [...document.querySelectorAll("table")].map(
          (t) => t.parentElement!.scrollWidth - t.parentElement!.clientWidth,
        ),
      );
      expect(Math.max(0, ...tableOverflow), path).toBe(0);
    }
  });
});
