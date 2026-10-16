import type {
  CapacityUnitId,
  EnergyUnitId,
  QuantityKind,
  UnitIdByKind,
} from "./types";

/** Value object. The unit is constrained by the kind. */
export interface Quantity<K extends QuantityKind = QuantityKind> {
  readonly value: number;
  readonly unit: UnitIdByKind[K];
  readonly kind: K;
}

export const capacity = (
  value: number,
  unit: CapacityUnitId,
): Quantity<"capacity"> => ({
  value,
  unit,
  kind: "capacity",
});

export const energy = (
  value: number,
  unit: EnergyUnitId,
): Quantity<"energy"> => ({
  value,
  unit,
  kind: "energy",
});
