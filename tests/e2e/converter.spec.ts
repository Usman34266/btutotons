import { expect, test } from "@playwright/test";

import {
  convert,
  errorMessage,
  field,
  openConverter,
  resultValue,
  sentence,
  sizeClass,
} from "./helpers";

test.describe("converter: acceptance values", () => {
  test.beforeEach(async ({ page }) => openConverter(page));

  test("24,000 BTU/hr → 2 tons, 7.0337 cooling kW, sold as 2 ton", async ({
    page,
  }) => {
    await convert(page, "24000");
    await expect(resultValue(page)).toHaveText("2");
    await expect(page.getByTestId("result-kw")).toHaveText("7.0337");
    await expect(sizeClass(page)).toContainText("Sold as a 2 ton AC.");
    await expect(sentence(page)).toHaveText(
      "Your 24,000 BTU AC is a 2 ton AC.",
    );
  });

  test("19,000 BTU/hr → 1.5833 tons, sold as 1.5 ton", async ({ page }) => {
    await convert(page, "19,000");
    await expect(resultValue(page)).toHaveText("1.5833");
    await expect(sentence(page)).toHaveText(
      "Your 19,000 BTU AC is a 1.5 ton AC.",
    );
    await expect(sizeClass(page)).toHaveText(
      "Sold as a 1.5 ton AC. Exact: 1.58 tons.",
    );
    await expect(page.getByTestId("result-kw")).toHaveText("5.5684");
  });

  test("21,000 BTU/hr → between the 1.5 and 2 ton sizes", async ({ page }) => {
    await convert(page, "21000");
    await expect(resultValue(page)).toHaveText("1.75");
    await expect(sentence(page)).toHaveText(
      "Your 21,000 BTU AC is between the 1.5 and 2 ton sizes.",
    );
    await expect(sizeClass(page)).toHaveText(
      "Between the 1.5 and 2 ton sizes. Exact: 1.75 tons.",
    );
  });

  test("12,500 BTU/hr → sold as 1 ton", async ({ page }) => {
    await convert(page, "12500");
    await expect(sizeClass(page)).toContainText("Sold as a 1 ton AC.");
  });

  test("0 BTU/hr is valid; outside every class shows exact tons only", async ({
    page,
  }) => {
    await convert(page, "0");
    await expect(resultValue(page)).toHaveText("0");
    await expect(sizeClass(page)).toHaveCount(0);
    await convert(page, "100000");
    await expect(sentence(page)).toHaveText(
      "Your 100,000 BTU AC is 8.33 tons.",
    );
    await expect(sizeClass(page)).toHaveCount(0);
  });

  test("0.5 BTU/hr at 4 decimals → less than 0.0001", async ({ page }) => {
    await convert(page, "0.5");
    await expect(resultValue(page)).toHaveText("less than 0.0001");
  });

  for (const [unit, value, tons] of [
    ["kw", "3.5168528420667", "1"],
    ["btumin", "200", "1"],
    ["btus", "3.3333333333333", "1"],
    ["kbtuh", "24", "2"],
    ["mmbtuh", "0.024", "2"],
  ] as const) {
    test(`${value} ${unit} → ${tons} tons`, async ({ page }) => {
      await page.getByLabel("Unit").selectOption(unit);
      await convert(page, value);
      await expect(resultValue(page)).toHaveText(tons);
    });
  }

  test("tons → BTU/hr: 1.5 tons = 18,000 BTU/hr, 5.2753 cooling kW", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Tons → BTU/hr" }).click();
    // The flip swaps the field after the view transition starts; type into the new one.
    await expect(page.getByLabel("Size in tons")).toBeVisible();
    await convert(page, "1.5");
    await expect(resultValue(page)).toHaveText("18,000");
    await expect(sentence(page)).toHaveText(
      "1.5 refrigeration tons equal 18,000 BTU per hour.",
    );
    await expect(page.getByTestId("result-kw")).toHaveText("5.2753");
    await convert(page, "1");
    await expect(sentence(page)).toHaveText(
      "1 refrigeration ton equals 12,000 BTU per hour.",
    );
  });
});

test.describe("converter: errors", () => {
  test.beforeEach(async ({ page }) => openConverter(page));

  for (const [raw, message] of [
    ["-1", "Capacity can't be negative."],
    ["12abc", "Use numbers only, like 24000 or 24,000."],
    ["1,5", "Use a dot for decimals, like 1.5."],
    ["1e5", "Type the full number, like 1200000."],
    ["12,00", "Use numbers only, like 24000 or 24,000."],
    [
      "1000000000001",
      "That's bigger than this tool supports (up to 1,000,000,000,000).",
    ],
  ] as const) {
    test(`${raw} → "${message}"`, async ({ page }) => {
      await convert(page, "18000");
      await expect(page.getByTestId("result")).toBeVisible();
      await convert(page, raw);
      await field(page).press("Enter");
      await expect(errorMessage(page)).toHaveText(message);
      await expect(field(page)).toHaveAttribute("aria-invalid", "true");
      const describedBy = await field(page).getAttribute("aria-describedby");
      expect(describedBy?.split(" ")).toContain(
        await errorMessage(page).getAttribute("id"),
      );
      // The old result hides until the input is valid again.
      await expect(page.getByTestId("result")).toHaveCount(0);
      await convert(page, "18000");
      await expect(errorMessage(page)).toHaveCount(0);
      await expect(resultValue(page)).toHaveText("1.5");
    });
  }

  test("Enter on an empty field asks for a rating", async ({ page }) => {
    await field(page).press("Enter");
    await expect(errorMessage(page)).toHaveText(
      "Enter your AC's rating, like 18000.",
    );
  });

  test("no error flashes while typing; it appears after a pause or on blur", async ({
    page,
  }) => {
    await field(page).pressSequentially("19,", { delay: 20 });
    await expect(errorMessage(page)).toHaveCount(0);
    await field(page).pressSequentially("000", { delay: 20 });
    await expect(resultValue(page)).toHaveText("1.5833");
    await convert(page, "12abc");
    await expect(errorMessage(page)).toHaveCount(0);
    await expect(errorMessage(page)).toBeVisible({ timeout: 3_000 });
    await convert(page, "7x");
    await field(page).blur();
    await expect(errorMessage(page)).toBeVisible();
  });
});

test.describe("converter: state", () => {
  test("writes the fragment and restores from it", async ({ page }) => {
    await openConverter(page);
    await convert(page, "19,000");
    await expect(page).toHaveURL(/#v=19000&u=btuh&p=4$/);
    await page.goto("/#v=24000&u=btuh&p=2");
    await page.reload();
    await expect(field(page)).toHaveValue("24,000");
    await expect(page.getByTestId("result-kw")).toHaveText("7.03");
  });

  test("restores tons direction from the fragment and ignores bad fragments", async ({
    page,
  }) => {
    await openConverter(page, "#v=1.5&u=tr&p=4");
    await expect(
      page.getByRole("radio", { name: "Tons → BTU/hr" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(resultValue(page)).toHaveText("18,000");
    await openConverter(page, "#v=abc&u=btuh");
    await page.reload();
    await expect(field(page)).toHaveValue("");
    await expect(page.getByTestId("result-empty")).toBeVisible();
  });

  test("precision: 2/4/6 decimals, remembered per device", async ({ page }) => {
    await openConverter(page);
    await convert(page, "19000");
    await page.getByRole("button", { name: "Show the math" }).click();
    await expect(page.locator("code")).toHaveText("19,000 ÷ 12,000 = 1.5833");
    await page.getByRole("radio", { name: "2" }).click();
    await expect(resultValue(page)).toHaveText("1.58");
    await page.getByRole("radio", { name: "6" }).click();
    await expect(resultValue(page)).toHaveText("1.583333");
    await expect(page).toHaveURL(/p=6$/);
    await page.goto("/");
    await convert(page, "19000");
    await expect(resultValue(page)).toHaveText("1.583333");
  });

  test("flipping direction carries the value both ways exactly", async ({
    page,
  }) => {
    await openConverter(page);
    await convert(page, "19000");
    await page.getByRole("radio", { name: "Tons → BTU/hr" }).click();
    await expect(field(page)).toHaveValue("1.5833333333");
    await expect(resultValue(page)).toHaveText("19,000");
    await page.getByRole("radio", { name: "BTU/hr → tons" }).click();
    await expect(field(page)).toHaveValue("19000");
    await expect(resultValue(page)).toHaveText("1.5833");
  });

  test("quick values fill the calculator", async ({ page }) => {
    await openConverter(page);
    await page.getByRole("radio", { name: "Tons → BTU/hr" }).click();
    await page.getByRole("button", { name: "Convert 36,000 BTU/hr" }).click();
    await expect(
      page.getByRole("radio", { name: "BTU/hr → tons" }),
    ).toHaveAttribute("aria-checked", "true");
    await expect(field(page)).toHaveValue("36,000");
    await expect(resultValue(page)).toHaveText("3");
  });

  test("reset clears the field, result and fragment, and focuses the field", async ({
    page,
  }) => {
    await openConverter(page);
    await convert(page, "24000");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(field(page)).toHaveValue("");
    await expect(field(page)).toBeFocused();
    await expect(page.getByTestId("result-empty")).toBeVisible();
    expect(new URL(page.url()).hash).toBe("");
  });

  test("announces the settled result politely", async ({ page }) => {
    await openConverter(page);
    await convert(page, "21000");
    await expect(
      page.getByRole("status").filter({ hasText: "Your 21,000" }),
    ).toHaveText(
      "Your 21,000 BTU AC is between the 1.5 and 2 ton sizes. Between the 1.5 and 2 ton sizes. Exact: 1.75 tons.",
    );
  });
});

test.describe("converter: copy and share", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("copies the result as plain text", async ({ page }) => {
    await openConverter(page);
    await convert(page, "19,000");
    await page.getByRole("button", { name: "Copy result" }).click();
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "19,000 BTU/hr = 1.5833 refrigeration tons = 5.5684 cooling kW. Sold as a 1.5 ton AC. Exact: 1.58 tons.",
    );
  });

  test("share falls back to copying the link with the fragment", async ({
    page,
  }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "share", { value: undefined }),
    );
    await openConverter(page);
    await convert(page, "24000");
    await page.getByRole("button", { name: "Share link" }).click();
    await expect(page.getByText("Link copied")).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
      /\/#v=24000&u=btuh&p=4$/,
    );
  });
});

test("the converter and its labels are in the static HTML", async ({
  request,
}) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("<h1>BTU to Tons Calculator</h1>");
  expect(html).toContain("Your AC&#x27;s cooling capacity");
  expect(html).toContain("12,000 BTU/hr = 1 ton");
});
