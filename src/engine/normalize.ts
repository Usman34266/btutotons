import type { Quantity } from "./quantity";
import { UNITS, type UnitStep } from "./units";
import type { CapacityUnitId, EnergyUnitId, UnitId } from "./types";

const apply = (value: number, steps: readonly UnitStep[]): number =>
  steps.reduce(
    (acc, [op, factor]) => (op === "×" ? acc * factor : acc / factor),
    value,
  );

/** The steps that undo a unit's `toBase`: BTU/hr → that unit. */
export const inverse = (steps: readonly UnitStep[]): UnitStep[] =>
  [...steps]
    .reverse()
    .map(([op, factor]) => [op === "×" ? "÷" : "×", factor] as const);

const toBase = (value: number, unit: UnitId): number =>
  apply(value, UNITS[unit].toBase);
const fromBase = (value: number, unit: UnitId): number =>
  apply(value, inverse(UNITS[unit].toBase));

/** Capacity → BTU/hr. */
export const toBtuh = (q: Quantity<"capacity">): number =>
  toBase(q.value, q.unit);

/** BTU/hr → capacity unit. */
export const fromBtuh = (btuh: number, unit: CapacityUnitId): number =>
  fromBase(btuh, unit);

/** Energy → BTU. */
export const toBtu = (q: Quantity<"energy">): number => toBase(q.value, q.unit);

/** BTU → energy unit. */
export const fromBtu = (btu: number, unit: EnergyUnitId): number =>
  fromBase(btu, unit);
