import type { BatchRow } from "./batch";
import { formatCsvNumber } from "./format";
import type { SizeClassResult } from "./size-class";
import type { CapacityUnitId } from "./types";
import { UNITS } from "./units";

export const CSV_COLUMNS = [
  "row",
  "input_value",
  "input_unit",
  "BTU_per_hour",
  "refrigeration_tons",
  "cooling_kW",
  "size_class",
  "status",
] as const;

// Cells a spreadsheet could run as a formula.
const FORMULA_START = /^[=+\-@\t\r]/;
const NEEDS_QUOTES = /[",\r\n]/;

/** Neutralise formula injection, then apply RFC 4180 quoting. */
export function escapeCsvCell(cell: string): string {
  const safe = FORMULA_START.test(cell) ? `'${cell}` : cell;
  return NEEDS_QUOTES.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}

function sizeClassCell(sizeClass: SizeClassResult): string {
  switch (sizeClass.type) {
    case "class":
      return sizeClass.sizeClass.label;
    case "between":
      return `between ${sizeClass.lower.label} and ${sizeClass.upper.label}`;
    case "outside":
      return "";
  }
}

function rowCells(row: BatchRow, unit: CapacityUnitId): string[] {
  const unitCell = UNITS[unit].symbol;
  if (row.status === "error") {
    return [String(row.row), row.raw, unitCell, "", "", "", "", row.error.code];
  }
  const { input, btuh, tons, coolingKw, sizeClass } = row.result;
  return [
    String(row.row),
    formatCsvNumber(input.value),
    unitCell,
    formatCsvNumber(btuh),
    formatCsvNumber(tons),
    formatCsvNumber(coolingKw),
    sizeClassCell(sizeClass),
    "ok",
  ];
}

/** CSV text (CRLF line endings) for a converted batch. */
export function toCsv(rows: readonly BatchRow[], unit: CapacityUnitId): string {
  return [[...CSV_COLUMNS], ...rows.map((row) => rowCells(row, unit))]
    .map((cells) => cells.map(escapeCsvCell).join(","))
    .join("\r\n")
    .concat("\r\n");
}
