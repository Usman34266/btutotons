import { BTUH_PER_TON, W_PER_BTUH } from "./constants";
import { DEFAULT_PRECISION, formatInputValue, formatNumber } from "./format";
import { fromBtuh, inverse, toBtuh } from "./normalize";
import { capacity, type Quantity } from "./quantity";
import { classifySize, type SizeClassResult } from "./size-class";
import type { CapacityUnitId, Precision, SizeClassRegion } from "./types";
import { UNITS, type UnitStep } from "./units";

export interface ConversionResult {
  input: Quantity<"capacity">;
  /** The input in the requested output unit (ConvertOptions.to). Full precision. */
  output: Quantity<"capacity">;
  /** Full precision. Round only for display. */
  btuh: number;
  tons: number;
  coolingKw: number;
  sizeClass: SizeClassResult;
  /** Input to output unit: "19,000 ÷ 12,000 = 1.5833" */
  equation: string;
}

export interface ConvertOptions {
  /** Decimals used in the equation text. */
  precision?: Precision;
  region?: SizeClassRegion;
  /** Output unit. Default: tons, or BTU/hr when the input is tons. */
  to?: CapacityUnitId;
}

export function convertCapacity(
  input: Quantity<"capacity">,
  {
    precision = DEFAULT_PRECISION,
    region = "us",
    to = input.unit === "tr" ? "btuh" : "tr",
  }: ConvertOptions = {},
): ConversionResult {
  const btuh = toBtuh(input);
  const output = capacity(fromBtuh(btuh, to), to);
  return {
    input,
    output,
    btuh,
    tons: btuh / BTUH_PER_TON,
    coolingKw: (btuh * W_PER_BTUH) / 1_000,
    sizeClass: classifySize(btuh, region),
    equation: buildEquation(input, btuh, output, precision),
  };
}

/**
 * Input → BTU/hr → output, with each unit's own steps:
 * BTU/hr → tons: "19,000 ÷ 12,000 = 1.5833"
 * Tons → BTU/hr: "1.5 × 12,000 = 18,000"
 * Otherwise:     "24 × 1,000 = 24,000 BTU/hr; 24,000 ÷ 12,000 = 2"
 */
function buildEquation(
  input: Quantity<"capacity">,
  btuh: number,
  output: Quantity<"capacity">,
  precision: Precision,
): string {
  const show = (n: number) => formatNumber(n, { precision });
  const steps = (s: readonly UnitStep[]) =>
    s.map(([op, factor]) => `${op} ${formatInputValue(factor)}`).join(" ");
  const value = formatInputValue(input.value);
  const into = UNITS[input.unit].toBase;
  const outOf = inverse(UNITS[output.unit].toBase);

  if (into.length === 0)
    return `${value} ${steps(outOf)} = ${show(output.value)}`;
  if (outOf.length === 0) return `${value} ${steps(into)} = ${show(btuh)}`;
  return `${value} ${steps(into)} = ${show(btuh)} BTU/hr; ${show(btuh)} ${steps(outOf)} = ${show(output.value)}`;
}
