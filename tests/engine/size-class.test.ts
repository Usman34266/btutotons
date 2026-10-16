import { describe, expect, it } from "vitest";

import { W_PER_BTUH, classifySize, type SizeClassResult } from "@/engine";

/** Compact description: "1.5 ton", "1.5 ton|2 ton", "outside". */
const label = (r: SizeClassResult) =>
  r.type === "class"
    ? r.sizeClass.label
    : r.type === "between"
      ? `${r.lower.label}|${r.upper.label}`
      : "outside";

const kwToBtuh = (kw: number) => (kw * 1_000) / W_PER_BTUH;

describe("US size classes", () => {
  it.each([
    [24_000, "2 ton"],
    [19_000, "1.5 ton"],
    [12_500, "1 ton"],
    [18_000, "1.5 ton"],
    [9_000, "0.75 ton"],
    [60_000, "5 ton"],
  ])("%d BTU/hr → %s", (btuh, expected) => {
    expect(label(classifySize(btuh))).toBe(expected);
  });

  it("returns 'between' when no class is within 10%", () => {
    expect(label(classifySize(21_000))).toBe("1.5 ton|2 ton");
    expect(label(classifySize(53_000))).toBe("4 ton|5 ton");
    expect(label(classifySize(54_000))).toBe("5 ton"); // 4.5 tons is exactly −10% of 5
  });

  it("treats the ±10% band as inclusive, despite float noise", () => {
    expect(label(classifySize(13_200))).toBe("1 ton"); // exactly +10%
    expect(label(classifySize(1.1 * 12_000))).toBe("1 ton"); // 13,200.000000000002
    expect(label(classifySize(10_800))).toBe("1 ton"); // exactly −10%
    expect(label(classifySize(13_201))).toBe("1 ton|1.25 ton");
  });

  it("picks the closest class when bands overlap", () => {
    // 1.36 tons is inside both the 1.25 and 1.5 bands; 1.25 is closer.
    expect(label(classifySize(1.36 * 12_000))).toBe("1.25 ton");
    expect(label(classifySize(1.37 * 12_000))).toBe("1.5 ton");
  });

  it("returns 'between' on an exact tie, ordered low to high", () => {
    const tie = (2 * 15_000 * 18_000) / (15_000 + 18_000); // ≈ 16,363.64 BTU/hr
    // Float noise makes either class the nominal "best"; both orders must give the same answer.
    expect(label(classifySize(tie))).toBe("1.25 ton|1.5 ton");
    expect(label(classifySize(tie - 1e-7))).toBe("1.25 ton|1.5 ton");
  });

  it("is 'outside' beyond the smallest and largest classes ± 10%", () => {
    expect(classifySize(0)).toEqual({ type: "outside" });
    expect(classifySize(5_399)).toEqual({ type: "outside" });
    expect(label(classifySize(5_400))).toBe("0.5 ton");
    expect(label(classifySize(66_000))).toBe("5 ton");
    expect(classifySize(66_001)).toEqual({ type: "outside" });
  });

  it("exposes nominal values with each class", () => {
    const r = classifySize(18_000);
    expect(r).toMatchObject({
      type: "class",
      sizeClass: { region: "us", tons: 1.5, nominalBtuh: 18_000 },
    });
  });

  it("accepts a custom band", () => {
    expect(label(classifySize(12_500, "us", 0.01))).toBe("1 ton|1.25 ton");
  });
});

describe("EU size classes (not routed)", () => {
  it.each([
    [2.5, "9,000 BTU"],
    [3.5, "12,000 BTU"],
    [5.0, "18,000 BTU"],
    [7.0, "24,000 BTU"],
    [2.75, "9,000 BTU"], // exactly +10% in kW
    [3.2, "12,000 BTU"],
  ])("%d kW → %s", (kw, expected) => {
    expect(label(classifySize(kwToBtuh(kw), "eu"))).toBe(expected);
  });

  it("handles between and outside", () => {
    expect(label(classifySize(kwToBtuh(6), "eu"))).toBe(
      "18,000 BTU|24,000 BTU",
    );
    expect(classifySize(kwToBtuh(1), "eu")).toEqual({ type: "outside" });
    expect(classifySize(kwToBtuh(8), "eu")).toEqual({ type: "outside" });
  });

  it("carries kW as the nominal and the equivalent tons", () => {
    const r = classifySize(kwToBtuh(3.5), "eu");
    expect(r.type === "class" && r.sizeClass.nominal).toBe(3.5);
    expect(r.type === "class" && r.sizeClass.tons).toBeCloseTo(0.99521, 4);
  });
});
