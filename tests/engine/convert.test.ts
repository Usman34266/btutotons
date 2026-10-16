import { describe, expect, it } from "vitest";

import { capacity, convertCapacity } from "@/engine";

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

  it("uses the EU size classes when asked", () => {
    const r = convertCapacity(capacity(3.5, "kw"), { region: "eu" });
    expect(r.sizeClass).toMatchObject({
      type: "class",
      sizeClass: { label: "12,000 BTU" },
    });
  });
});
