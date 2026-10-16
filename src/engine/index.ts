/**
 * Engine facade: the only engine import allowed outside src/engine.
 * Pipeline: parse → validate → normalize (BTU/hr) → convert → format.
 */
export {
  BTUH_PER_TON,
  BTU_WH_PER_W_W,
  ENGINE_VERSION,
  FT2_PER_M2,
  J_PER_BTU,
  MAX_INPUT_VALUE,
  W_PER_BTUH,
} from "./constants";

export type {
  CapacityUnitId,
  EnergyUnitId,
  NumberParserId,
  ParseErrorCode,
  Precision,
  QuantityKind,
  SizeClassRegion,
  UnitId,
} from "./types";

export { err, ok, type EngineError, type Result } from "./result";
export { capacity, energy, type Quantity } from "./quantity";
export {
  CAPACITY_UNIT_IDS,
  ENERGY_UNIT_IDS,
  UNITS,
  isCapacityUnit,
  type UnitDef,
} from "./units";
export {
  parseCapacity,
  parseInput,
  parseNumber,
  validate,
  type ParseError,
  type ParseOptions,
  type ParseResult,
  type ValidateOptions,
} from "./parse";
export { fromBtu, fromBtuh, toBtu, toBtuh } from "./normalize";
export {
  DEFAULT_PRECISION,
  PRECISIONS,
  formatAmount,
  formatCompact,
  formatConstant,
  formatCsvNumber,
  formatInputValue,
  formatNumber,
  formatPercent,
  formatRatioPercent,
  isDisplayRounded,
  isPrecision,
  type AmountOptions,
  type FormatOptions,
} from "./format";
export {
  classifySize,
  type SizeClass,
  type SizeClassResult,
} from "./size-class";
export {
  convertCapacity,
  type ConversionResult,
  type ConvertOptions,
} from "./convert";
export { compareCapacities, type CompareResult } from "./compare";
export {
  BATCH_MAX_ROWS,
  convertBatch,
  type BatchError,
  type BatchRow,
} from "./batch";
export { CSV_COLUMNS, escapeCsvCell, toCsv } from "./csv";
export { ICE_BLOCKS_MAX, iceBlocks, type IceBlocksModel } from "./ice-blocks";
