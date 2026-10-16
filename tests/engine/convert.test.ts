import { describe, expect, it } from "vitest";

import { capacity, convertCapacity, type CapacityUnitId } from "@/engine";

describe("convertCapacity", () => {
  it("returns full-precision BTU/hr, tons and cooling kW", () => {
    const r = convertCapacity(capacity(19_000, "btuh"));
    expect(r.btuh).toBe(19_000);
    expect(r.tons).toBe(19_000 / 12_000);
    expect(r.coolingKw).toBeCloseTo(5.5683503, 7);
    expect(r.input).toEqual(capacity(19_000, "btuh"));
    expect(r.sizeClass.type).toBe("class");
  });

  it("builds the BTU/hr equation", () => {
    expect(convertCapacity(capacity(19_000, "btuh")).equation).toBe(
      "19,000 ÷ 12,000 = 1.5833",
    );
    expect(
      convertCapacity(capacity(19_000, "btuh"), { precision: 2 }).equation,
    ).toBe("19,000 ÷ 12,000 = 1.58");
    expect(convertCapacity(capacity(0.5, "btuh")).equation).toBe(
      "0.5 ÷ 12,000 = less than 0.0001",
    );
  });

  it("builds the tons equation", () => {
    expect(convertCapacity(capacity(1.5, "tr")).equation).toBe(
      "1.5 × 12,000 = 18,000",
    );
  });

  it("builds two-step equations for other units", () => {
    expect(convertCapacity(capacity(24, "kbtuh")).equation).toBe(
      "24 × 1,000 = 24,000 BTU/hr; 24,000 ÷ 12,000 = 2",
    );
    expect(convertCapacity(capacity(5, "kw")).equation).toBe(
      "5 × 1,000 ÷ 0.2930710702 = 17,060.7082 BTU/hr; 17,060.7082 ÷ 12,000 = 1.4217",
    );
  });

  it("defaults the output to tons, or BTU/hr for a tons input", () => {
    expect(convertCapacity(capacity(24_000, "btuh")).output).toEqual(
      capacity(2, "tr"),
    );
    expect(convertCapacity(capacity(1.5, "tr")).output).toEqual(
      capacity(18_000, "btuh"),
    );
  });

  it("converts into any capacity unit (unit-pair pages)", () => {
    const out = (value: number, from: CapacityUnitId, to: CapacityUnitId) =>
      convertCapacity(capacity(value, from), { to }).output;
    expect(out(1, "tr", "kw").value).toBeCloseTo(3.5168528420667, 12);
    expect(out(3.5168528420667, "kw", "tr").value).toBeCloseTo(1, 8);
    expect(out(24_000, "btuh", "kw").value).toBeCloseTo(7.0337056841, 10);
    expect(out(1, "kw", "btuh").value).toBeCloseTo(3_412.1416331279, 9);
    expect(out(200, "btumin", "tr").value).toBeCloseTo(1, 8);
    expect(out(3.3333333333333, "btus", "tr").value).toBeCloseTo(1, 8);
    expect(out(10, "btus", "tr")).toEqual(capacity(3, "tr"));
  });

  it("builds the equation into the requested unit", () => {
    const eq = (value: number, from: CapacityUnitId, to: CapacityUnitId) =>
      convertCapacity(capacity(value, from), { to }).equation;
    expect(eq(24_000, "btuh", "kw")).toBe(
      "24,000 × 0.2930710702 ÷ 1,000 = 7.0337",
    );
    expect(eq(3.5, "kw", "btuh")).toBe(
      "3.5 × 1,000 ÷ 0.2930710702 = 11,942.4957",
    );
    expect(eq(2, "tr", "kw")).toBe(
      "2 × 12,000 = 24,000 BTU/hr; 24,000 × 0.2930710702 ÷ 1,000 = 7.0337",
    );
    expect(eq(200, "btumin", "tr")).toBe(
      "200 × 60 = 12,000 BTU/hr; 12,000 ÷ 12,000 = 1",
    );
  });

  it("uses the EU size classes when asked", () => {
    const r = convertCapacity(capacity(3.5, "kw"), { region: "eu" });
    expect(r.sizeClass).toMatchObject({
      type: "class",
      sizeClass: { label: "12,000 BTU" },
    });
  });
});
