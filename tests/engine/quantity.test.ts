import { describe, expect, it } from "vitest";

import { capacity, convertCapacity, energy, toBtu, toBtuh } from "@/engine";

describe("Quantity value objects", () => {
  it("carries value, unit and kind", () => {
    expect(capacity(1.5, "tr")).toEqual({
      value: 1.5,
      unit: "tr",
      kind: "capacity",
    });
    expect(energy(2, "tonhour")).toEqual({
      value: 2,
      unit: "tonhour",
      kind: "energy",
    });
  });

  it("makes mixing kinds a compile error", () => {
    // Type-level assertions, checked by `pnpm typecheck`; never executed.
    const typeChecks = () => {
      // @ts-expect-error "btu" is energy, not a capacity unit
      capacity(1, "btu");
      // @ts-expect-error "tr" is capacity, not an energy unit
      energy(1, "tr");
      // @ts-expect-error energy cannot be normalized to BTU/hr
      toBtuh(energy(1, "btu"));
      // @ts-expect-error capacity cannot be normalized to BTU
      toBtu(capacity(1, "btuh"));
      // @ts-expect-error energy cannot be converted to tons
      convertCapacity(energy(24_000, "btu"));
    };
    expect(typeof typeChecks).toBe("function");
  });
});
