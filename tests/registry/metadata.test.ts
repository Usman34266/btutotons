import { describe, expect, it } from "vitest";

import { segmentsText } from "@/components/converter/segments";
import { site } from "@/config/site";
import { pageMetadata, routeCopy } from "@/lib/metadata";
import { numericPageBySlug, numericPageModel } from "@/lib/numeric-page";
import { neighbours } from "@/registry/numeric-pages";
import { ROUTES, numericRouteId } from "@/registry/routes";

/** Spec pp. 20–23 titles, verbatim. */
const SPEC_TITLES: Record<string, string> = {
  "6000-btu-to-tons": "6,000 BTU to Tons = 0.5 [Formula + Chart]",
  "8000-btu-to-tons": "8,000 BTU to Tons = 0.6667 [Formula + Chart]",
  "9000-btu-to-tons": "9,000 BTU to Tons = 0.75 [Formula + Chart]",
  "10000-btu-to-tons": "10,000 BTU to Tons = 0.8333 [Formula + Chart]",
  "12000-btu-to-tons": "12,000 BTU to Tons = 1 [Formula + Chart]",
  "18000-btu-to-tons": "18,000 BTU to Tons = 1.5 [Formula + Chart]",
  "24000-btu-to-tons": "24,000 BTU to Tons = 2 [Formula + Chart]",
  "30000-btu-to-tons": "30,000 BTU to Tons = 2.5 [Formula + Chart]",
  "36000-btu-to-tons": "36,000 BTU to Tons = 3 [Formula + Chart]",
  "42000-btu-to-tons": "42,000 BTU to Tons = 3.5 [Formula + Chart]",
  "48000-btu-to-tons": "48,000 BTU to Tons = 4 [Formula + Chart]",
  "60000-btu-to-tons": "60,000 BTU to Tons = 5 [Formula + Chart]",
  "1-ton-to-btu": "1 Ton to BTU = 12,000 BTU/hr [Quick Chart]",
  "1-5-ton-to-btu": "1.5 Ton to BTU = 18,000 BTU/hr [Quick Chart]",
  "2-ton-to-btu": "2 Ton to BTU = 24,000 BTU/hr [Quick Chart]",
  "2-5-ton-to-btu": "2.5 Ton to BTU = 30,000 BTU/hr [Quick Chart]",
  "3-ton-to-btu": "3 Ton to BTU = 36,000 BTU/hr [Quick Chart]",
  "3-5-ton-to-btu": "3.5 Ton to BTU = 42,000 BTU/hr [Quick Chart]",
  "4-ton-to-btu": "4 Ton to BTU = 48,000 BTU/hr [Quick Chart]",
  "5-ton-to-btu": "5 Ton to BTU = 60,000 BTU/hr [Quick Chart]",
};

const model = (slug: string) => {
  const page = numericPageBySlug(slug);
  if (!page) throw new Error(slug);
  return numericPageModel(page);
};

describe("page metadata", () => {
  it("is unique and non-empty for every route", () => {
    const copies = ROUTES.map(routeCopy);
    const titles = copies.map((c) => c.title);
    const descriptions = copies.map((c) => c.description);
    expect(new Set(titles).size).toBe(ROUTES.length);
    expect(new Set(descriptions).size).toBe(ROUTES.length);
    for (const c of copies) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.breadcrumb.length).toBeGreaterThan(0);
    }
  });

  it("has a self-referencing canonical with a trailing slash", () => {
    for (const r of ROUTES) {
      const meta = pageMetadata(r.id);
      expect(meta.alternates?.canonical).toBe(r.path);
      expect(meta.openGraph?.url).toBe(r.path);
      expect(new URL(r.path, site.url).href).toMatch(
        /^https:\/\/btutotons\.com\/(.+\/)?$/,
      );
    }
  });

  it("uses the spec titles for the static pages", () => {
    expect(pageMetadata("home").title).toBe(
      "BTU to Tons Calculator [12,000 BTU/hr = 1 Ton]",
    );
    expect(pageMetadata("tons-to-btu").title).toBe(
      "Tons to BTU Calculator [12,000 BTU/hr per Ton]",
    );
    expect(pageMetadata("batch").title).toBe(
      "Batch BTU to Tons [Convert up to 200 Values]",
    );
  });

  it("uses the spec title for all 20 numeric pages", () => {
    const numeric = ROUTES.filter((r) => r.numeric);
    expect(numeric).toHaveLength(Object.keys(SPEC_TITLES).length);
    for (const r of numeric)
      expect(routeCopy(r).title).toBe(SPEC_TITLES[r.numeric!.slug]);
  });
});

describe("pluralization", () => {
  it("says 'ton' only for exactly 1", () => {
    expect(model("12000-btu-to-tons").meta.description).toBe(
      "Convert 12,000 BTU/hr to 1 refrigeration ton. See the calculation, cooling kW and nearby capacities, or enter a different rating.",
    );
    expect(model("6000-btu-to-tons").meta.description).toBe(
      "Convert 6,000 BTU/hr to 0.5 refrigeration tons. See the calculation, cooling kW and nearby capacities, or enter a different rating.",
    );
    expect(model("1-ton-to-btu").meta.description).toBe(
      "1 refrigeration ton equals 12,000 BTU/hr. Check the formula, compare nearby cooling capacities and edit the value in the free converter.",
    );
    expect(model("1-5-ton-to-btu").meta.description).toBe(
      "1.5 refrigeration tons equal 18,000 BTU/hr. Check the formula, compare nearby cooling capacities and edit the value in the free converter.",
    );
  });

  it("pluralizes answers, worked examples and headings", () => {
    const one = model("12000-btu-to-tons");
    expect(segmentsText(one.answer)).toBe(
      "12,000 BTU per hour equals 1 refrigeration ton. That's a 1 ton AC size.",
    );
    expect(one.equation).toBe("12,000 ÷ 12,000 = 1 ton");
    expect(one.fitsHeading).toBe("Does 1 ton mean it fits my space?");
    expect(model("24000-btu-to-tons").fitsHeading).toBe(
      "Does 2 tons mean it fits my space?",
    );
    expect(segmentsText(model("1-ton-to-btu").answer)).toBe(
      "1 refrigeration ton equals 12,000 BTU per hour. Multiply 1 by 12,000.",
    );
    expect(segmentsText(model("2-5-ton-to-btu").answer)).toBe(
      "2.5 refrigeration tons equal 30,000 BTU per hour. Multiply 2.5 by 12,000.",
    );
  });
});

describe("numeric page content", () => {
  it("leads with the answer and the AC size", () => {
    expect(segmentsText(model("24000-btu-to-tons").answer)).toBe(
      "24,000 BTU per hour equals 2 refrigeration tons. That's a 2 ton AC size.",
    );
    expect(segmentsText(model("8000-btu-to-tons").answer)).toBe(
      "8,000 BTU per hour equals 0.6667 refrigeration tons (rounded). That's between the 0.5 and 0.75 ton AC sizes.",
    );
    expect(segmentsText(model("10000-btu-to-tons").answer)).toBe(
      "10,000 BTU per hour equals 0.8333 refrigeration tons (rounded). That's between the 0.75 and 1 ton AC sizes.",
    );
  });

  it("shows the worked example from the engine", () => {
    const m = model("24000-btu-to-tons");
    expect(m.method).toBe("Divide 24,000 by 12,000 to convert the capacity.");
    expect(m.equation).toBe("24,000 ÷ 12,000 = 2 tons");
    expect(m.coolingKw).toContain("7.0337 cooling kW");
    expect(model("1-5-ton-to-btu").equation).toBe(
      "1.5 × 12,000 = 18,000 BTU/hr",
    );
  });

  it("compares with the two neighbouring capacities, ascending", () => {
    expect(model("24000-btu-to-tons").compareHeading).toBe(
      "Compare 24,000 with 18,000 and 30,000 BTU/hr",
    );
    expect(model("24000-btu-to-tons").rows.map((r) => r.slug)).toEqual([
      "18000-btu-to-tons",
      "24000-btu-to-tons",
      "30000-btu-to-tons",
    ]);
    // At either end of the list: the two nearest on the one side.
    expect(model("6000-btu-to-tons").compareHeading).toBe(
      "Compare 6,000 with 8,000 and 9,000 BTU/hr",
    );
    expect(model("5-ton-to-btu").compareHeading).toBe(
      "Compare 5 with 3.5 and 4 tons",
    );
    const own = model("2-ton-to-btu").rows.find(
      (r) => r.slug === "2-ton-to-btu",
    );
    expect(own?.link).toBeNull();
  });

  it("links to home, the reverse page and both neighbours", () => {
    expect(model("24000-btu-to-tons").links.map((l) => l.href)).toEqual([
      "/",
      "/2-ton-to-btu/",
      "/18000-btu-to-tons/",
      "/30000-btu-to-tons/",
    ]);
    // No ton page for 0.5 tons: the reverse calculator instead.
    expect(model("6000-btu-to-tons").links.map((l) => l.href)).toEqual([
      "/",
      "/tons-to-btu/",
      "/8000-btu-to-tons/",
      "/9000-btu-to-tons/",
    ]);
    expect(model("1-5-ton-to-btu").links[1]).toEqual({
      href: "/18000-btu-to-tons/",
      label: "18,000 BTU to Tons",
    });
  });

  it("prefills the converter with the page's value", () => {
    expect(model("24000-btu-to-tons").converterInitial).toEqual({
      direction: "to-tons",
      unit: "btuh",
      value: 24_000,
    });
    expect(model("1-5-ton-to-btu").converterInitial).toEqual({
      direction: "to-btuh",
      value: 1.5,
    });
  });

  it("names neighbours as a pair", () => {
    const page = numericPageBySlug("3-ton-to-btu")!;
    expect(neighbours(page).map((p) => p.value)).toEqual([2.5, 3.5]);
    expect(pageMetadata(numericRouteId(page)).title).toBe(
      SPEC_TITLES["3-ton-to-btu"],
    );
  });
});
