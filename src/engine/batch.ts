import {
  convertCapacity,
  type ConversionResult,
  type ConvertOptions,
} from "./convert";
import { parseCapacity, type ParseError, type ParseOptions } from "./parse";
import { err, ok, type EngineError, type Result } from "./result";
import type { CapacityUnitId } from "./types";

export const BATCH_MAX_ROWS = 200;

interface BatchRowBase {
  /** 1-based position among non-blank lines (the CSV row). */
  row: number;
  /** 1-based line number in the pasted text (for "fix line 12" messages). */
  line: number;
  /** The line as pasted, trimmed. */
  raw: string;
}

export type BatchRow = BatchRowBase &
  (
    | { status: "ok"; result: ConversionResult }
    | { status: "error"; error: ParseError }
  );

export type BatchError = EngineError<"TOO_MANY_ROWS">;

/**
 * One value per line, one unit for the list. Blank lines are skipped; every
 * other line becomes a row, in order. Over the limit, nothing is converted.
 */
export function convertBatch(
  text: string,
  unit: CapacityUnitId,
  options: ParseOptions & ConvertOptions = {},
): Result<BatchRow[], BatchError> {
  const lines = text
    .split(/\r\n|\r|\n/)
    .map((raw, i) => ({ raw: raw.trim(), line: i + 1 }))
    .filter(({ raw }) => raw !== "");

  if (lines.length > BATCH_MAX_ROWS) {
    return err("TOO_MANY_ROWS", { max: BATCH_MAX_ROWS, count: lines.length });
  }

  return ok(
    lines.map(({ raw, line }, i): BatchRow => {
      const parsed = parseCapacity(raw, unit, options);
      const base = { row: i + 1, line, raw };
      return parsed.ok
        ? {
            ...base,
            status: "ok",
            result: convertCapacity(parsed.value, options),
          }
        : { ...base, status: "error", error: parsed.error };
    }),
  );
}
