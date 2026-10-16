import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { field, openConverter, resultValue } from "./helpers";

const a = (page: Page) => page.locator("input[name=a]");
const b = (page: Page) => page.locator("input[name=b]");
const summary = (page: Page) => page.getByTestId("compare-summary");
const lines = (page: Page) => page.getByTestId("compare-line");

async function openCompare(page: Page) {
  await openConverter(page);
  await page.getByRole("button", { name: "Compare two ratings" }).click();
  await expect(a(page)).toBeVisible();
}

test.describe("compare two ratings", () => {
  test("is collapsed until opened, then loads the panel", async ({ page }) => {
    await openConverter(page);
    const toggle = page.getByRole("button", { name: "Compare two ratings" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(a(page)).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(a(page)).toBeVisible();
    await expect(page.getByText("Enter both ratings")).toBeVisible();
  });

  test("/#compare opens the panel", async ({ page }) => {
    await openConverter(page, "#compare");
    await expect(a(page)).toBeVisible();
  });

  test("A = 18,000, B = 24,000 BTU/hr → 6,000 more, 0.5 tons, +33.33%", async ({
    page,
  }) => {
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("24,000");
    await expect(summary(page)).toHaveText("B has 6,000 BTU/hr more capacity.");
    await expect(lines(page)).toHaveText([
      "Difference: 0.5 refrigeration tons / 1.7584 cooling kW.",
      "B is 33.33% higher than A.",
    ]);
    await expect(
      page.getByText(
        "Capacity difference only. Efficiency, room suitability and actual performance are separate.",
      ),
    ).toBeVisible();
  });

  test("states a lower B in words, without a minus sign", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("24000");
    await b(page).fill("18000");
    await expect(summary(page)).toHaveText("B has 6,000 BTU/hr less capacity.");
    await expect(lines(page)).toHaveText([
      "Difference: 0.5 refrigeration tons / 1.7584 cooling kW.",
      "B is 25% lower than A.",
    ]);
  });

  test("a zero baseline has no percentage", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("0");
    await b(page).fill("12000");
    await expect(summary(page)).toHaveText(
      "B has 12,000 BTU/hr more capacity.",
    );
    await expect(lines(page).last()).toHaveText(
      "Percentage unavailable: baseline is zero.",
    );
  });

  test("equal ratings, in different units", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("1.5");
    await page.getByLabel("Unit for rating A").selectOption("tr");
    await b(page).fill("18000");
    await expect(summary(page)).toHaveText("A and B have the same capacity.");
    await expect(lines(page)).toHaveCount(0);
  });

  test("invalid text shows the field error after a pause; no result", async ({
    page,
  }) => {
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("12abc");
    await expect(
      page.getByText("Use numbers only, like 24000 or 24,000."),
    ).toBeVisible();
    await expect(b(page)).toHaveAttribute("aria-invalid", "true");
    await expect(summary(page)).toHaveCount(0);
  });

  test("Use B loads B into the calculator and focuses it", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("2");
    await page.getByLabel("Unit for rating B").selectOption("tr");
    await page.getByRole("button", { name: "Use B in the calculator" }).click();
    await expect(page.getByLabel("Size in tons")).toBeFocused();
    await expect(field(page)).toHaveValue("2");
    await expect(resultValue(page)).toHaveText("24,000");
    // The panel stays open with its values.
    await expect(a(page)).toHaveValue("18000");
  });

  test("copies the comparison as plain text", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("24000");
    await page.getByRole("button", { name: "Copy comparison" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "A: 18,000 BTU/hr. B: 24,000 BTU/hr. B has 6,000 BTU/hr more capacity. Difference: 0.5 refrigeration tons / 1.7584 cooling kW. B is 33.33% higher than A. Capacity difference only. Efficiency, room suitability and actual performance are separate.",
    );
  });

  test("announces the comparison politely", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("24000");
    await expect(
      page.getByRole("status").filter({ hasText: "more capacity" }),
    ).toHaveText(
      "B has 6,000 BTU/hr more capacity. Difference: 0.5 refrigeration tons / 1.7584 cooling kW. B is 33.33% higher than A.",
    );
  });

  test("has no axe violations when open with a result", async ({ page }) => {
    await openCompare(page);
    await a(page).fill("18000");
    await b(page).fill("24000");
    await expect(summary(page)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
