import { UNITS } from "./units";
import type { Precision, UnitId } from "./types";

export const PRECISIONS: readonly Precision[] = [2, 4, 6];
export const DEFAULT_PRECISION: Precision = 4;

export const isPrecision = (value: unknown): value is Precision =>
  (PRECISIONS as readonly unknown[]).includes(value);

const LOCALE = "en-US";
const formatters = new Map<string, Intl.NumberFormat>();

function formatter(
  key: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  let f = formatters.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, options);
    formatters.set(key, f);
  }
  return f;
}

export interface FormatOptions {
  precision?: Precision;
  /**
   * "exceptZero" shows "+" on positive values (differences). "never" gives the
   * magnitude, for copy that states the direction in words ("6,000 BTU/hr less").
   */
  signDisplay?: "auto" | "exceptZero" | "never";
}

/**
 * Display rounding only; values stay full precision elsewhere.
 * Trailing zeros are trimmed ("2", "1.75"). A non-zero value smaller than
 * the display step reads "less than 0.0001" (a magnitude, no sign; callers
 * show direction in words). See D029, D033.
 */
export function formatNumber(
  value: number,
  { precision = DEFAULT_PRECISION, signDisplay = "auto" }: FormatOptions = {},
): string {
  const step = 10 ** -precision;
  const plain = formatter(`n${precision}`, {
    maximumFractionDigits: precision,
  });
  if (value !== 0 && Math.abs(value) < step)
    return `less than ${plain.format(step)}`;
  const f =
    signDisplay === "auto"
      ? plain
      : formatter(`n${precision}${signDisplay}`, {
          maximumFractionDigits: precision,
          signDisplay,
        });
  return f.format(value === 0 ? 0 : value); // never "-0"
}

export interface AmountOptions extends FormatOptions {
  /** "symbol": "1.5 TR". "long": "1.5 refrigeration tons". */
  style?: "symbol" | "long";
}

/** Number + unit, pluralized on the displayed value ("1 refrigeration ton"). */
export function formatAmount(
  value: number,
  unit: UnitId,
  options: AmountOptions = {},
): string {
  const text = formatNumber(value, options);
  const def = UNITS[unit];
  if (options.style !== "long") return `${text} ${def.symbol}`;
  const isOne = text.replace(/^[+-]/, "") === "1";
  return `${text} ${isOne ? def.singular : def.plural}`;
}

/** Percent with 2 decimals, by default with an explicit sign: "+33.33%". */
export const formatPercent = (
  value: number,
  signDisplay: FormatOptions["signDisplay"] = "exceptZero",
): string => `${formatNumber(value, { precision: 2, signDisplay })}%`;

/** A ratio as a percent, for documented rules: 0.1 → "10%". */
export const formatRatioPercent = (ratio: number): string =>
  formatter("ratio", { style: "percent", maximumFractionDigits: 2 }).format(
    ratio,
  );

/** A user-entered value or a constant, as typed: grouped, up to 10 decimals. */
export const formatInputValue = (value: number): string =>
  formatter("input", { maximumFractionDigits: 10 }).format(value);

/** A published constant, every digit kept: "0.2930710701722222". */
export const formatConstant = (value: number): string =>
  formatter("constant", { maximumFractionDigits: 16 }).format(value);

/** True when the display at this precision drops digits ("0.6667" for 2/3), so copy can say "(rounded)". */
export const isDisplayRounded = (
  value: number,
  precision: Precision = DEFAULT_PRECISION,
): boolean => formatNumber(value, { precision }) !== formatInputValue(value);

/** Short labels ("+1.5", "+83T"): 2 decimals, compact notation from a million. */
export const formatCompact = (value: number): string =>
  Math.abs(value) >= 1e6
    ? formatter("compact", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value)
    : formatNumber(value, { precision: 2 });

/** CSV: up to 12 significant digits, no grouping, never exponent notation. */
export const formatCsvNumber = (value: number): string =>
  formatter("csv", { maximumSignificantDigits: 12, useGrouping: false }).format(
    value,
  );
