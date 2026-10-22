/**
 * Shared engine types. Kinds never mix: a capacity can't be passed where
 * energy is expected, and vice versa (compile-time).
 */
export type QuantityKind = "capacity" | "energy" | "electrical";

export type CapacityUnitId =
  "btuh" | "tr" | "kw" | "w" | "kbtuh" | "mmbtuh" | "btumin" | "btus" | "hp";
export type EnergyUnitId = "btu" | "tonhour";
/** Electrical units arrive with the power tool (M10). */
export type ElectricalUnitId = never;

export interface UnitIdByKind {
  capacity: CapacityUnitId;
  energy: EnergyUnitId;
  electrical: ElectricalUnitId;
}

export type UnitId = UnitIdByKind[QuantityKind];

/** Display precision in decimal places. */
export type Precision = 2 | 4 | 6;

export type NumberParserId = "en-US" | "eu-comma";
export type SizeClassRegion = "us" | "eu";

export type ParseErrorCode =
  | "EMPTY"
  | "NEGATIVE"
  | "NOT_A_NUMBER"
  | "DECIMAL_COMMA"
  | "SCIENTIFIC"
  | "TOO_LARGE"
  | "ZERO_NOT_ALLOWED";
