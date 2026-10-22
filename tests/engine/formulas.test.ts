import { describe, expect, it } from "vitest";

import {
  btuPerMinuteToTons,
  btuPerSecondToTons,
  btuPerSecondToWatts,
  btuhToHp,
  btuhToKw,
  btuhToMbh,
  btuhToTons,
  btuhToWatts,
  capacity,
  convertCapacity,
  hpToBtuh,
  kwToBtuh,
  kwToTons,
  mbhToBtuh,
  tonsToBtuh,
  tonsToKw,
  wattsToBtuh,
} from "@/engine";
import { UNIT_PAGES, type UnitPageSlug } from "@/registry/unit-pages";

const FORMULA: Record<UnitPageSlug, (x: number) => number> = {
  "kw-to-tons": kwToTons,
  "tons-to-kw": tonsToKw,
  "btu-to-kw": btuhToKw,
  "kw-to-btu": kwToBtuh,
  "btu-per-minute-to-tons": btuPerMinuteToTons,
  "btu-per-second-to-tons": btuPerSecondToTons,
  "mbh-to-btu": mbhToBtuh,
  "btu-to-mbh": btuhToMbh,
  "watts-to-btu": wattsToBtuh,
  "btu-to-watts": btuhToWatts,
  "btu-per-second-to-watts": btuPerSecondToWatts,
  "btu-to-hp": btuhToHp,
  "hp-to-btu": hpToBtuh,
};

describe("calculator formulas", () => {
  // [formula, input, expected, decimals]: SEO plan (D112) and cheatsheet §1.
  it.each([
    [btuhToTons, 19_000, 1.583333, 6],
    [tonsToBtuh, 1.5, 18_000, 9],
    [kwToTons, 3.5168528420667, 1, 9],
    [tonsToKw, 3, 10.55056, 5],
    [btuhToKw, 12_000, 3.51685, 5],
    [kwToBtuh, 3.5, 11_942.5, 2],
    [btuPerMinuteToTons, 200, 1, 9],
    [btuPerSecondToTons, 10, 3, 9],
    [mbhToBtuh, 36, 36_000, 9],
    [btuhToMbh, 60_000, 60, 9],
    [wattsToBtuh, 1_000, 3_412.14, 2],
    [btuhToWatts, 12_000, 3_516.85, 2],
    [btuPerSecondToWatts, 1, 1_055.05585262, 8],
    [btuhToHp, 12_000, 4.7162, 4],
    [hpToBtuh, 1, 2_544.434, 3],
  ] as const)("%o(%d) ≈ %d", (fn, input, expected, decimals) => {
    expect(fn(input)).toBeCloseTo(expected, decimals);
  });

  it("36 MBH is 3 tons (SEO plan example)", () => {
    expect(btuhToTons(mbhToBtuh(36))).toBe(3);
  });

  it("each pair is the exact inverse of its reverse", () => {
    for (const x of [0, 0.5, 1, 12_000, 1e12]) {
      expect(kwToBtuh(btuhToKw(x))).toBeCloseTo(x, 6);
      expect(wattsToBtuh(btuhToWatts(x))).toBeCloseTo(x, 6);
      expect(mbhToBtuh(btuhToMbh(x))).toBeCloseTo(x, 6);
      expect(hpToBtuh(btuhToHp(x))).toBeCloseTo(x, 6);
      expect(tonsToKw(kwToTons(x))).toBeCloseTo(x, 6);
    }
  });

  it("every unit page converts exactly as its formula", () => {
    for (const page of UNIT_PAGES) {
      for (const x of [0, 0.001, 1, page.example, 123_456.789]) {
        const { output } = convertCapacity(capacity(x, page.from), {
          to: page.to,
        });
        const expected = FORMULA[page.slug](x);
        expect(output.value).toBeCloseTo(expected, 9);
        expect(Math.abs(output.value - expected)).toBeLessThanOrEqual(
          Math.abs(expected) * 1e-12,
        );
      }
    }
  });
});
