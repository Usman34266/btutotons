import { getContent } from "@/content";
import {
  DEFAULT_PRECISION,
  convertCapacity,
  formatInputValue,
  formatNumber,
  type ConversionResult,
  type Precision,
  type Quantity,
  type SizeClassResult,
} from "@/engine";

/** Size class for a table cell: "1.5 ton", "Between 0.5 and 0.75 ton" or "—". */
export function sizeClassCell(sizeClass: SizeClassResult): string {
  const copy = getContent().common.sizeClassCell;
  switch (sizeClass.type) {
    case "class":
      return copy.cls(formatInputValue(sizeClass.sizeClass.tons));
    case "between":
      return copy.between(
        formatInputValue(sizeClass.lower.tons),
        formatInputValue(sizeClass.upper.tons),
      );
    case "outside":
      return copy.outside;
  }
}

/** One capacity, formatted for a table row. */
export interface CapacityRow {
  btuh: string;
  tons: string;
  coolingKw: string;
  sizeClass: string;
}

export function capacityRow(
  result: ConversionResult,
  precision: Precision = DEFAULT_PRECISION,
): CapacityRow {
  return {
    btuh: formatNumber(result.btuh, { precision }),
    tons: formatNumber(result.tons, { precision }),
    coolingKw: formatNumber(result.coolingKw, { precision }),
    sizeClass: sizeClassCell(result.sizeClass),
  };
}

export const capacityRowOf = (q: Quantity<"capacity">) =>
  capacityRow(convertCapacity(q));
