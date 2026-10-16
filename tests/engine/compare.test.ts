import { describe, expect, it } from "vitest";

import { capacity, compareCapacities } from "@/engine";

describe("compareCapacities", () => {
  it("returns B − A in every unit and the percentage", () => {
    const r = compareCapacities(
      capacity(18_000, "btuh"),
      capacity(24_000, "btuh"),
    );
    expect(r.difference.btuh).toBe(6_000);
    expect(r.difference.tons).toBeCloseTo(0.5, 12);
    expect(r.difference.coolingKw).toBeCloseTo(1.7584264, 6);
    expect(r.percent.ok && r.percent.value).toBeCloseTo(33.3333333, 6);
    expect(r.direction).toBe("more");
  });

  it("handles B smaller than A and equal values", () => {
    expect(
      compareCapacities(capacity(2, "tr"), capacity(18_000, "btuh")).direction,
    ).toBe("less");
    expect(
      compareCapacities(capacity(1, "tr"), capacity(12_000, "btuh")).direction,
    ).toBe("same");
  });

  it("marks the percentage unavailable when A is zero", () => {
    const r = compareCapacities(capacity(0, "btuh"), capacity(12_000, "btuh"));
    expect(r.percent).toEqual({ ok: false, error: { code: "BASELINE_ZERO" } });
    expect(r.difference.btuh).toBe(12_000);
  });

  it("compares across units", () => {
    const r = compareCapacities(capacity(1.5, "tr"), capacity(24, "kbtuh"));
    expect(r.difference.btuh).toBeCloseTo(6_000, 9);
  });
});
