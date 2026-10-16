import { expect, test } from "@playwright/test";

import { convert, openConverter, resultValue } from "./helpers";

const overflowX = (page: import("@playwright/test").Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("mobile 360px", () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test("the answer is in the first screen, without scrolling", async ({
    page,
  }) => {
    await openConverter(page);
    await convert(page, "19000");
    await expect(resultValue(page)).toHaveText("1.5833");
    const box = await page.getByTestId("result-value").boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(740);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("no horizontal scroll in any state", async ({ page }) => {
    await openConverter(page);
    expect(await overflowX(page)).toBe(0);
    await page.getByLabel("Unit").selectOption("mmbtuh");
    await convert(page, "1000000000000");
    await expect(page.getByTestId("result")).toBeVisible();
    expect(await overflowX(page)).toBe(0);
    // The longest values shrink or wrap; none is clipped by the card (16px gutter).
    for (const id of ["result-value", "result-btuh", "result-kw"]) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box!.x + box!.width, id).toBeLessThanOrEqual(360 - 16);
    }
    await page.getByRole("button", { name: "Show the math" }).click();
    expect(await overflowX(page)).toBe(0);
    await convert(page, "12abc");
    await page.locator("input[name=value]").press("Enter");
    expect(await overflowX(page)).toBe(0);
  });

  test("touch targets are at least 44px", async ({ page }) => {
    await openConverter(page);
    await convert(page, "19000");
    await page.getByRole("button", { name: "Show the math" }).click();
    const small = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "main button, main input, main select, main [role=radio], header a, header button",
        ),
      ]
        .filter((el) => el.offsetParent !== null)
        .map((el) => {
          const r = el.getBoundingClientRect();
          const after = getComputedStyle(el, "::after");
          // Icon buttons extend their hit area with an inset pseudo-element.
          const extra =
            after.content !== "none" ? -2 * parseFloat(after.left || "0") : 0;
          return {
            name: el.getAttribute("aria-label") ?? el.textContent?.trim(),
            w: r.width + extra,
            h: r.height + extra,
          };
        })
        .filter((t) => t.w < 44 || t.h < 44),
    );
    expect(small).toEqual([]);
  });
});

test.describe("200% zoom (640 CSS px wide)", () => {
  test.use({ viewport: { width: 640, height: 450 } });

  test("no horizontal scroll or clipping", async ({ page }) => {
    await openConverter(page);
    await convert(page, "19000");
    expect(await overflowX(page)).toBe(0);
  });
});
