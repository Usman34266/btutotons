import { expect, type Page } from "@playwright/test";

export const field = (page: Page) => page.locator("input[name=value]");
/** The visible number's text (DigitMorph keeps a plain copy for screen readers). */
export const resultValue = (page: Page) =>
  page.getByTestId("result-value").locator(".sr-only");
export const sentence = (page: Page) => page.getByTestId("result-sentence");
export const sizeClass = (page: Page) => page.getByTestId("size-class");
export const errorMessage = (page: Page) => page.locator("[id$='-error']");

/** Go to the converter and wait until React has hydrated (the field accepts input). */
export async function openConverter(page: Page, hash = "") {
  await page.goto(`/${hash}`);
  await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
  await page.waitForFunction(
    () => document.querySelector("input[name=value]") !== null,
  );
  // Hydration done once React has attached handlers; typing then updates the result.
  await page.waitForLoadState("networkidle");
}

export async function convert(page: Page, value: string) {
  await field(page).fill(value);
}

/** A header link; below 640px Chart and Guides sit inside the "Menu" disclosure (D115). */
export async function headerLink(page: Page, name: string) {
  const nav = page.getByRole("navigation", { name: "Main" });
  const link = nav.getByRole("link", { name, exact: true });
  if (!(await link.first().isVisible())) await nav.locator("summary").click();
  return link.locator("visible=true");
}
