import { readFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const PATH = "/batch-btu-to-tons/";
const values = (page: Page) =>
  page.getByRole("textbox", { name: "Values", exact: true });
const convertList = (page: Page) =>
  page.getByRole("button", { name: "Convert list" });
const summary = (page: Page) => page.getByTestId("batch-summary");
/** The message under the box (also announced by the live region). */
const listError = (page: Page) => page.locator("[id$='-error']");
const bodyRows = (page: Page) => page.locator("tbody tr");

async function openBatch(page: Page) {
  await page.goto(PATH);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await page.waitForLoadState("networkidle");
}

async function convert(page: Page, text: string) {
  await values(page).fill(text);
  await convertList(page).click();
}

async function downloadCsv(page: Page): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download CSV" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("btu-to-tons.csv");
  return readFile((await download.path())!, "utf8");
}

test.describe("batch page", () => {
  test("serves its metadata, H1 and breadcrumb as static HTML", async ({
    page,
  }) => {
    await page.goto(PATH);
    await expect(page).toHaveTitle(
      "Batch BTU to Tons [Convert up to 200 Values]",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://btutotons.com/batch-btu-to-tons/",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /^Paste up to 200 cooling-capacity values/,
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Batch BTU to Tons Converter",
    );
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(crumbs.locator("[aria-current=page]")).toHaveText(
      "Batch BTU to Tons",
    );
    for (const h2 of ["Paste format", "Export columns", "Fix invalid rows"]) {
      await expect(
        page.getByRole("heading", { level: 2, name: h2 }),
      ).toBeVisible();
    }
  });

  test("the homepage links to it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Convert a list" }).click();
    await expect(page).toHaveURL(PATH);
  });
});

test.describe("batch conversion", () => {
  test.beforeEach(async ({ page }) => openBatch(page));

  test("converts every line in order and keeps invalid lines in place", async ({
    page,
  }) => {
    await convert(page, "12000\n18,000\n\n12abc\n1,5\n24000");
    await expect(summary(page)).toHaveText(
      "5 rows: 2 to fix, the rest converted.",
    );
    await expect(bodyRows(page)).toHaveCount(5);
    // Line numbers match the pasted text (the blank line 3 is skipped).
    await expect(bodyRows(page).locator("th")).toHaveText([
      "1",
      "2",
      "4",
      "5",
      "6",
    ]);
    await expect(bodyRows(page).nth(1)).toContainText("1.5");
    await expect(bodyRows(page).nth(1)).toContainText("1.5 ton");
    await expect(bodyRows(page).nth(2)).toContainText(
      "Use numbers only, like 24000 or 24,000.",
    );
    await expect(bodyRows(page).nth(3)).toContainText(
      "Use a dot for decimals, like 1.5.",
    );
    await expect(bodyRows(page).nth(4)).toContainText("7.0337");
  });

  test("after converting, fixing a line updates its row", async ({ page }) => {
    await convert(page, "12000\n12abc");
    await expect(summary(page)).toHaveText(
      "2 rows: 1 to fix, the rest converted.",
    );
    await values(page).fill("12000\n36000");
    await expect(summary(page)).toHaveText("2 rows converted.");
    await expect(bodyRows(page).nth(1)).toContainText("3 ton");
  });

  test("an empty list asks for a value", async ({ page }) => {
    await convertList(page).click();
    await expect(listError(page)).toHaveText(
      "Paste at least one value, one per line.",
    );
    await expect(values(page)).toHaveAttribute("aria-invalid", "true");
  });

  test("200 lines convert", async ({ page }) => {
    await convert(page, Array.from({ length: 200 }, () => "12000").join("\n"));
    await expect(summary(page)).toHaveText("200 rows converted.");
    await expect(bodyRows(page)).toHaveCount(200);
  });

  test("201 lines give a clear limit message and convert nothing", async ({
    page,
  }) => {
    await convert(page, Array.from({ length: 201 }, () => "12000").join("\n"));
    await expect(listError(page)).toHaveText(
      "This list has 201 values. The limit is 200 at a time, so nothing was converted. Split the list and convert each part.",
    );
    await expect(page.locator("table")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Download CSV" }),
    ).toHaveCount(0);
  });

  test("the CSV has the fixed columns, every row and full precision", async ({
    page,
  }) => {
    await convert(page, "19000\n12abc\n21000");
    const csv = await downloadCsv(page);
    expect(csv.split("\r\n")).toEqual([
      "row,input_value,input_unit,BTU_per_hour,refrigeration_tons,cooling_kW,size_class,status",
      "1,19000,BTU/hr,19000,1.58333333333,5.56835033327,1.5 ton,ok",
      "2,12abc,BTU/hr,,,,,NOT_A_NUMBER",
      "3,21000,BTU/hr,21000,1.75,6.15449247362,between 1.5 ton and 2 ton,ok",
      "",
    ]);
  });

  test("the CSV neutralises formula injection", async ({ page }) => {
    await convert(page, '=1+1\n+SUM(A1)\n-2\n@cmd\n"quoted",x');
    const csv = await downloadCsv(page);
    const rows = csv.split("\r\n");
    expect(rows[1]).toBe("1,'=1+1,BTU/hr,,,,,NOT_A_NUMBER");
    expect(rows[2]).toBe("2,'+SUM(A1),BTU/hr,,,,,NOT_A_NUMBER");
    expect(rows[3]).toBe("3,'-2,BTU/hr,,,,,NEGATIVE");
    expect(rows[4]).toBe("4,'@cmd,BTU/hr,,,,,NOT_A_NUMBER");
    expect(rows[5]).toBe('5,"""quoted"",x",BTU/hr,,,,,NOT_A_NUMBER');
  });

  test("uses the unit chosen for the list", async ({ page }) => {
    await page.getByLabel("Input unit").selectOption("tr");
    await convert(page, "1.5\n2");
    await expect(bodyRows(page).nth(0)).toContainText("18,000");
    const csv = await downloadCsv(page);
    expect(csv.split("\r\n")[2]).toBe("2,2,TR,24000,2,7.03370568413,2 ton,ok");
  });

  test("has no axe violations with results and errors", async ({ page }) => {
    await convert(page, "12000\n12abc");
    await expect(summary(page)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("the page never scrolls sideways; the table scrolls in its region", async ({
    page,
  }) => {
    await convert(page, "12000\n12abc\n1000000000000");
    await expect(summary(page)).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBe(0);
    await expect(
      page.getByRole("region", { name: "Converted values" }),
    ).toBeVisible();
  });
});
