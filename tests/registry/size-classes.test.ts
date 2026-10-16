import { describe, expect, it } from "vitest";

import {
  EU_SIZE_CLASSES,
  SIZE_CLASS_BAND,
  US_SIZE_CLASS_TONS,
} from "@/registry/size-classes";

const ascending = (xs: readonly number[]) =>
  xs.every((x, i) => i === 0 || x > (xs[i - 1] ?? -Infinity));

describe("size-class registry", () => {
  it("matches the build prompt lists", () => {
    expect(SIZE_CLASS_BAND).toBe(0.1);
    expect(US_SIZE_CLASS_TONS).toEqual([
      0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5,
    ]);
    expect(EU_SIZE_CLASSES.map((c) => [c.kw, c.marketedBtu])).toEqual([
      [2.5, 9_000],
      [3.5, 12_000],
      [5, 18_000],
      [7, 24_000],
    ]);
  });

  it("keeps lists in ascending order (the rule relies on it)", () => {
    expect(ascending(US_SIZE_CLASS_TONS)).toBe(true);
    expect(ascending(EU_SIZE_CLASSES.map((c) => c.kw))).toBe(true);
  });
});
