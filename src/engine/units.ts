import { BTUH_PER_TON, W_PER_BTUH } from "./constants";
import type {
  CapacityUnitId,
  EnergyUnitId,
  QuantityKind,
  UnitId,
} from "./types";

/** One arithmetic step from this unit to the base unit (BTU/hr or BTU). */
export type UnitStep = readonly ["×" | "÷", number];

export interface UnitDef {
  id: UnitId;
  kind: QuantityKind;
  /** Label for unit pickers. */
  label: string;
  /** Short form next to numbers. */
  symbol: string;
  /** Long forms: "1 refrigeration ton", "2 refrigeration tons". */
  singular: string;
  plural: string;
  /** Steps that turn a value in this unit into the base unit. */
  toBase: readonly UnitStep[];
}

export const UNITS: { readonly [U in UnitId]: UnitDef & { id: U } } = {
  btuh: {
    id: "btuh",
    kind: "capacity",
    label: "BTU/hr",
    symbol: "BTU/hr",
    singular: "BTU/hr",
    plural: "BTU/hr",
    toBase: [],
  },
  tr: {
    id: "tr",
    kind: "capacity",
    label: "refrigeration tons",
    symbol: "TR",
    singular: "refrigeration ton",
    plural: "refrigeration tons",
    toBase: [["×", BTUH_PER_TON]],
  },
  kw: {
    id: "kw",
    kind: "capacity",
    label: "cooling kW",
    symbol: "kW",
    singular: "cooling kW",
    plural: "cooling kW",
    toBase: [
      ["×", 1_000],
      ["÷", W_PER_BTUH],
    ],
  },
  w: {
    id: "w",
    kind: "capacity",
    label: "cooling W",
    symbol: "W",
    singular: "cooling W",
    plural: "cooling W",
    toBase: [["÷", W_PER_BTUH]],
  },
  kbtuh: {
    id: "kbtuh",
    kind: "capacity",
    label: "kBTU/hr (MBH)",
    symbol: "kBTU/hr",
    singular: "kBTU/hr",
    plural: "kBTU/hr",
    toBase: [["×", 1_000]],
  },
  mmbtuh: {
    id: "mmbtuh",
    kind: "capacity",
    label: "MMBTU/hr",
    symbol: "MMBTU/hr",
    singular: "MMBTU/hr",
    plural: "MMBTU/hr",
    toBase: [["×", 1_000_000]],
  },
  btumin: {
    id: "btumin",
    kind: "capacity",
    label: "BTU/min",
    symbol: "BTU/min",
    singular: "BTU/min",
    plural: "BTU/min",
    toBase: [["×", 60]],
  },
  btus: {
    id: "btus",
    kind: "capacity",
    label: "BTU/s",
    symbol: "BTU/s",
    singular: "BTU/s",
    plural: "BTU/s",
    toBase: [["×", 3_600]],
  },
  btu: {
    id: "btu",
    kind: "energy",
    label: "BTU (energy)",
    symbol: "BTU",
    singular: "BTU",
    plural: "BTU",
    toBase: [],
  },
  tonhour: {
    id: "tonhour",
    kind: "energy",
    label: "ton-hours",
    symbol: "ton-hours",
    singular: "ton-hour",
    plural: "ton-hours",
    toBase: [["×", BTUH_PER_TON]],
  },
};

/** Capacity units in picker order. */
export const CAPACITY_UNIT_IDS: readonly CapacityUnitId[] = [
  "btuh",
  "tr",
  "kw",
  "w",
  "kbtuh",
  "mmbtuh",
  "btumin",
  "btus",
];

export const ENERGY_UNIT_IDS: readonly EnergyUnitId[] = ["btu", "tonhour"];

export const isCapacityUnit = (id: string): id is CapacityUnitId =>
  (CAPACITY_UNIT_IDS as readonly string[]).includes(id);
