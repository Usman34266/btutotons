import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { convert, field, openConverter } from "./helpers";

const scan = async (page: Page) =>
  (
    await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
  ).violations;

for (const scheme of ["light", "dark"] as const) {
  test.describe(`axe (${scheme})`, () => {
    test.use({ colorScheme: scheme });

    test("empty state", async ({ page }) => {
      await openConverter(page);
      expect(await scan(page)).toEqual([]);
    });

    test("result with the math open", async ({ page }) => {
      await openConverter(page);
      await convert(page, "21000");
      await page.getByRole("button", { name: "Show the math" }).click();
      expect(await scan(page)).toEqual([]);
    });

    test("tons direction, kW unit and outside-class result", async ({
      page,
    }) => {
      await openConverter(page, "#v=1.5&u=tr&p=4");
      expect(await scan(page)).toEqual([]);
      await openConverter(page, "#v=100&u=kw&p=2");
      expect(await scan(page)).toEqual([]);
    });

    test("error state", async ({ page }) => {
      await openConverter(page);
      await convert(page, "1,5");
      await field(page).press("Enter");
      await expect(page.locator("[id$='-error']")).toBeVisible();
      expect(await scan(page)).toEqual([]);
    });

    test("tooltip open", async ({ page }) => {
      await openConverter(page);
      await page.getByRole("button", { name: "What is BTU/hr?" }).click();
      expect(await scan(page)).toEqual([]);
    });
  });
}
