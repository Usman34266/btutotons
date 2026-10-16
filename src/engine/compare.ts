import {
  convertCapacity,
  type ConversionResult,
  type ConvertOptions,
} from "./convert";
import type { Quantity } from "./quantity";
import { err, ok, type EngineError, type Result } from "./result";

export interface CompareResult {
  a: ConversionResult;
  b: ConversionResult;
  /** B − A, full precision. */
  difference: { btuh: number; tons: number; coolingKw: number };
  /** 100 × (B − A) ÷ A. Unavailable when A is zero. */
  percent: Result<number, EngineError<"BASELINE_ZERO">>;
  /** B relative to A. Use for wording; display magnitudes may hide the sign. */
  direction: "more" | "less" | "same";
}

/** Capacity difference only; efficiency and suitability are separate questions. */
export function compareCapacities(
  a: Quantity<"capacity">,
  b: Quantity<"capacity">,
  options: ConvertOptions = {},
): CompareResult {
  const ra = convertCapacity(a, options);
  const rb = convertCapacity(b, options);
  const btuh = rb.btuh - ra.btuh;
  return {
    a: ra,
    b: rb,
    difference: {
      btuh,
      tons: rb.tons - ra.tons,
      coolingKw: rb.coolingKw - ra.coolingKw,
    },
    percent: ra.btuh === 0 ? err("BASELINE_ZERO") : ok((100 * btuh) / ra.btuh),
    direction: btuh > 0 ? "more" : btuh < 0 ? "less" : "same",
  };
}
