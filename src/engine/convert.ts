import { BTUH_PER_TON, W_PER_BTUH } from "./constants";
import { DEFAULT_PRECISION, formatInputValue, formatNumber } from "./format";
import { toBtuh } from "./normalize";
import type { Quantity } from "./quantity";
import { classifySize, type SizeClassResult } from "./size-class";
import type { Precision, SizeClassRegion } from "./types";
import { UNITS } from "./units";

export interface ConversionResult {
  input: Quantity<"capacity">;
  /** Full precision. Round only for display. */
  btuh: number;
  tons: number;
  coolingKw: number;
  sizeClass: SizeClassResult;
  /** "19,000 ÷ 12,000 = 1.5833" */
  equation: string;
}

export interface ConvertOptions {
  /** Decimals used in the equation text. */
  precision?: Precision;
  region?: SizeClassRegion;
}

export function convertCapacity(
  input: Quantity<"capacity">,
  { precision = DEFAULT_PRECISION, region = "us" }: ConvertOptions = {},
): ConversionResult {
  const btuh = toBtuh(input);
  const tons = btuh / BTUH_PER_TON;
  return {
    input,
    btuh,
    tons,
    coolingKw: (btuh * W_PER_BTUH) / 1_000,
    sizeClass: classifySize(btuh, region),
    equation: buildEquation(input, btuh, tons, precision),
  };
}

/**
 * BTU/hr: "19,000 ÷ 12,000 = 1.5833"
 * Tons:   "1.5 × 12,000 = 18,000"
 * Others: "24 × 1,000 = 24,000 BTU/hr; 24,000 ÷ 12,000 = 2"
 */
function buildEquation(
  input: Quantity<"capacity">,
  btuh: number,
  tons: number,
  precision: Precision,
): string {
  const show = (n: number) => formatNumber(n, { precision });
  const value = formatInputValue(input.value);
  const perTon = formatInputValue(BTUH_PER_TON);
  const toTons = `${show(btuh)} ÷ ${perTon} = ${show(tons)}`;

  if (input.unit === "btuh") return `${value} ÷ ${perTon} = ${show(tons)}`;
  if (input.unit === "tr") return `${value} × ${perTon} = ${show(btuh)}`;

  const steps = UNITS[input.unit].toBase
    .map(([op, factor]) => `${op} ${formatInputValue(factor)}`)
    .join(" ");
  return `${value} ${steps} = ${show(btuh)} BTU/hr; ${toTons}`;
}
