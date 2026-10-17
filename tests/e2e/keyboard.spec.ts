import { expect, test } from "@playwright/test";

import { errorMessage, field, openConverter, resultValue } from "./helpers";

test.describe("keyboard", () => {
  test.beforeEach(async ({ page }) => openConverter(page));

  test("skip link is first and jumps to main content", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("full flow: direction, field, unit, Enter converts", async ({
    page,
  }) => {
    const to = page.getByRole("radio", { name: "BTU/hr → tons" });
    await to.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("radio", { name: "Tons → BTU/hr" }),
    ).toBeFocused();
    await page.keyboard.press("Space");
    await expect(
      page.getByRole("radio", { name: "Tons → BTU/hr" }),
    ).toHaveAttribute("aria-checked", "true");
    // Radix moves roving focus on a timer, so wait for it before pressing Space.
    await page.keyboard.press("ArrowLeft");
    await expect(to).toBeFocused();
    await page.keyboard.press("Space");
    await expect(to).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("Tab"); // help "?"
    await page.keyboard.press("Tab");
    await expect(field(page)).toBeFocused();
    await page.keyboard.type("1,5");
    await page.keyboard.press("Enter");
    await expect(errorMessage(page)).toHaveText(
      "Use a dot for decimals, like 1.5.",
    );
    await field(page).fill("");
    await page.keyboard.type("24000");
    await page.keyboard.press("Enter");
    await expect(resultValue(page)).toHaveText("2");
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Unit", { exact: true })).toBeFocused();
  });

  test("unit tooltip opens with Enter and closes with Escape, returning focus", async ({
    page,
  }) => {
    const help = page.getByRole("button", { name: "What is BTU/hr?" });
    await help.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toContainText(
      "How much heat an AC removes each hour.",
    );
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(help).toBeFocused();
  });

  test("focus is always visible: 2px accent outline with 2px offset", async ({
    page,
  }) => {
    await field(page).focus();
    await page.keyboard.press("Shift+Tab");
    const style = await page.evaluate(() => {
      const s = getComputedStyle(document.activeElement as Element);
      return {
        style: s.outlineStyle,
        width: s.outlineWidth,
        offset: s.outlineOffset,
      };
    });
    expect(style).toEqual({ style: "solid", width: "2px", offset: "2px" });
  });

  test("typing never moves focus", async ({ page }) => {
    await field(page).focus();
    await page.keyboard.type("21000");
    await page.waitForTimeout(1_200);
    await expect(field(page)).toBeFocused();
  });
});
