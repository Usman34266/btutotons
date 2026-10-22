import { describe, expect, it } from "vitest";

import {
  CAPACITY_UNIT_IDS,
  ENERGY_UNIT_IDS,
  UNITS,
  isCapacityUnit,
} from "@/engine";

describe("unit registry", () => {
  it("lists every unit exactly once, under the right kind", () => {
    const all = [...CAPACITY_UNIT_IDS, ...ENERGY_UNIT_IDS];
    expect(new Set(all).size).toBe(all.length);
    expect(Object.keys(UNITS).sort()).toEqual([...all].sort());
    for (const id of CAPACITY_UNIT_IDS) expect(UNITS[id].kind).toBe("capacity");
    for (const id of ENERGY_UNIT_IDS) expect(UNITS[id].kind).toBe("energy");
  });

  it("keys match ids", () => {
    for (const [key, def] of Object.entries(UNITS)) expect(def.id).toBe(key);
  });

  it("labels capacity as BTU/hr and energy as bare BTU", () => {
    expect(UNITS.btuh.label).toBe("BTU/hr");
    expect(UNITS.btu.label).toBe("BTU (energy)");
    expect(UNITS.mmbtuh.label).toBe("MMBTU/hr");
    expect(UNITS.tr.label).toBe("refrigeration tons");
    expect(UNITS.kw.label).toBe("cooling kW");
  });

  it("has no unsupported units", () => {
    const labels = Object.values(UNITS)
      .map((u) => u.label.toLowerCase())
      .join(" ");
    // Mechanical horsepower was added in D112.
    for (const banned of ["kcal", "co2", "japanese", "cooling-tower"]) {
      expect(labels).not.toContain(banned);
    }
  });

  it("recognises capacity unit ids", () => {
    expect(isCapacityUnit("btuh")).toBe(true);
    expect(isCapacityUnit("btu")).toBe(false);
    expect(isCapacityUnit("hp")).toBe(true);
    expect(isCapacityUnit("kcalh")).toBe(false);
  });
});
