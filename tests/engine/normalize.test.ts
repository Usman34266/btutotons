import { describe, expect, it } from "vitest";

import { capacity, energy, fromBtu, fromBtuh, toBtu, toBtuh } from "@/engine";

describe("normalize capacity to BTU/hr", () => {
  it.each([
    ["btuh", 19_000, 19_000],
    ["tr", 1.5, 18_000],
    ["kbtuh", 24, 24_000],
    ["mmbtuh", 0.024, 24_000],
    ["btumin", 200, 12_000],
    ["btus", 1, 3_600],
  ] as const)("%s %d → %d BTU/hr", (unit, value, btuh) => {
    expect(toBtuh(capacity(value, unit))).toBeCloseTo(btuh, 9);
    expect(fromBtuh(btuh, unit)).toBeCloseTo(value, 12);
  });

  it("converts cooling kW and W through W_PER_BTUH", () => {
    expect(toBtuh(capacity(3.5168528420667, "kw"))).toBeCloseTo(12_000, 6);
    expect(toBtuh(capacity(3_516.8528420667, "w"))).toBeCloseTo(12_000, 6);
    expect(fromBtuh(12_000, "kw")).toBeCloseTo(3.5168528420667, 12);
  });
});

describe("normalize energy to BTU", () => {
  it("handles BTU and ton-hours", () => {
    expect(toBtu(energy(24_000, "btu"))).toBe(24_000);
    expect(toBtu(energy(2, "tonhour"))).toBe(24_000);
    expect(fromBtu(24_000, "tonhour")).toBe(2);
    expect(fromBtu(5, "btu")).toBe(5);
  });
});
