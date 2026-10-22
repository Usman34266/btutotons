import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { convert, field, openConverter, resultValue } from "./helpers";

test.describe("homepage conversion links", () => {
  test("link every published BTU→tons and tons→BTU page", async ({ page }) => {
    await page.goto("/");
    const section = page.getByTestId("conversion-links");
    await expect(
      section.getByRole("heading", { name: "All BTU and ton conversions" }),
    ).toBeVisible();
    const hrefs = await section
      .getByRole("link")
      .evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    // 2 calculators + 12 + 8 numeric pages + 14 unit pages (D115, D116).
    expect(hrefs).toHaveLength(36);
    expect(hrefs).toContain("/24000-btu-to-tons/");
    expect(hrefs).toContain("/1-5-ton-to-btu/");
    expect(hrefs).toContain("/batch-btu-to-tons/");
    expect(hrefs).toContain("/kw-to-tons/");
    for (const href of hrefs) {
      const res = await page.request.get(href!, { maxRedirects: 0 });
      expect(res.status(), href!).toBe(200);
    }
  });
});

test.describe("print", () => {
  test("appears with a result and prints only the calculator", async ({
    page,
  }) => {
    await openConverter(page);
    await expect(page.getByRole("button", { name: "Print" })).toHaveCount(0);
    await convert(page, "24000");
    await expect(resultValue(page)).toHaveText("2");

    await page.evaluate(() => {
      (window as unknown as { printed: number }).printed = 0;
      window.print = () => {
        (window as unknown as { printed: number }).printed += 1;
      };
    });
    await page.getByRole("button", { name: "Print" }).click();
    expect(
      await page.evaluate(
        () => (window as unknown as { printed: number }).printed,
      ),
    ).toBe(1);

    await page.emulateMedia({ media: "print" });
    await expect(page.locator("header").first()).toBeHidden();
    await expect(page.locator("footer")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeHidden();
    await expect(page.getByTestId("conversion-links")).toBeHidden();
    await expect(field(page)).toBeVisible();
    await expect(resultValue(page)).toHaveText("2");
    await expect(page.getByTestId("result-sentence")).toBeVisible();
    await expect(page.getByText("The math", { exact: true })).toBeVisible();
    await expect(
      page.getByText("24,000 ÷ 12,000 = 2", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Your numbers")).toBeVisible();
    await expect(page.getByText("Tons = BTU/hr ÷ 12,000")).toBeVisible();
    await expect(page.getByText("Decimal places")).toBeHidden();
    await expect(page.getByText("Common AC ratings")).toBeHidden();
    await expect(page.getByTestId("size-class")).toBeHidden();
    await expect(page.locator("[data-print-area] figure")).toBeHidden();
    await expect(page.getByText("Find it on")).toBeHidden();
    const visibleButtons = await page
      .getByRole("button")
      .evaluateAll((els) => els.filter((el) => el.checkVisibility()).length);
    expect(visibleButtons).toBe(0);
  });

  test("prints the math on a numeric page too", async ({ page }) => {
    await page.goto("/2-ton-to-btu/");
    await page.waitForLoadState("networkidle");
    await page.emulateMedia({ media: "print" });
    await expect(page.getByTestId("worked-example")).toBeHidden();
    await expect(
      page.getByTestId("result").getByText("2 × 12,000 = 24,000", {
        exact: true,
      }),
    ).toBeVisible();
  });
});

test.describe("embed", () => {
  test("opens a dialog with the iframe code, and closes back to the button", async ({
    page,
  }) => {
    await openConverter(page);
    const embed = page.getByRole("button", { name: "Embed" });
    await embed.click();
    const dialog = page.getByRole("dialog", { name: "Embed this calculator" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId("embed-code")).toContainText(
      '<iframe src="https://btutotons.com/embed/"',
    );
    const { violations } = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(embed).toBeFocused();
  });

  test("copies the code", async ({ page, context, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "clipboard permission is Chromium-only",
    );
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openConverter(page);
    await page.getByRole("button", { name: "Embed" }).click();
    await page.getByRole("button", { name: "Copy code" }).click();
    await expect(
      page.getByRole("button", { name: "Code copied" }),
    ).toBeVisible();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain('src="https://btutotons.com/embed/"');
  });

  test("the embed page is the converter alone, noindex and frameable", async ({
    page,
  }) => {
    const res = await page.goto("/embed/");
    const headers = res!.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors *");
    expect(headers["x-frame-options"]).toBeUndefined();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(page.locator("header")).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Embed" })).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    await field(page).fill("36000");
    await expect(resultValue(page)).toHaveText("3");
    await expect(page.getByRole("button", { name: "Print" })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "BTU to Tons" }),
    ).toHaveAttribute("target", "_blank");
  });

  test("every other page still refuses to be framed", async ({ request }) => {
    for (const path of ["/", "/contact/", "/24000-btu-to-tons/"]) {
      const headers = (await request.get(path)).headers();
      expect(headers["x-frame-options"], path).toBe("DENY");
      expect(headers["content-security-policy"], path).toContain(
        "frame-ancestors 'none'",
      );
    }
  });
});

test.describe("contact", () => {
  test("shows the address and is listed in the footer and sitemap", async ({
    page,
  }) => {
    await page.goto("/contact/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact");
    await expect(
      page.getByTestId("contact-email").getByRole("link"),
    ).toHaveAttribute("href", "mailto:contact@btutotons.com");
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(
      page.locator("footer").getByRole("link", { name: "Contact" }),
    ).toHaveAttribute("href", "/contact/");
    const xml = await (await page.request.get("/sitemap.xml")).text();
    expect(xml).toContain("/contact/");
  });
});
