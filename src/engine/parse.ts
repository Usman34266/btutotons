import { MAX_INPUT_VALUE } from "./constants";
import { capacity, type Quantity } from "./quantity";
import { err, ok, type EngineError, type Result } from "./result";
import { NUMBER_GRAMMARS } from "./strategies/parsers";
import type { CapacityUnitId, NumberParserId, ParseErrorCode } from "./types";

export type ParseError = EngineError<ParseErrorCode>;
export type ParseResult<T> = Result<T, ParseError>;

export interface ParseOptions {
  parser?: NumberParserId;
}

export interface ValidateOptions {
  /** Zero capacity is valid; zero EER, COP or duration is not. */
  allowZero?: boolean;
  max?: number;
}

const LEADING_MINUS = /^[-−]/; // ASCII hyphen-minus or Unicode minus sign
const SCIENTIFIC = /^[\d.,]*\d[\d.,]*e[+-]?\d+$/i;

/** Syntax only: text → signed number. Range checks happen in `validate`. */
export function parseNumber(
  raw: string,
  { parser = "en-US" }: ParseOptions = {},
): ParseResult<number> {
  const text = raw.trim();
  if (text === "") return err("EMPTY");

  const negative = LEADING_MINUS.test(text);
  const body = negative ? text.slice(1) : text;
  if (SCIENTIFIC.test(body)) return err("SCIENTIFIC");

  const grammar = NUMBER_GRAMMARS[parser];
  const value = grammar.read(body);
  if (value === null) return err(grammar.diagnose(body));

  return ok(negative && value !== 0 ? -value : value);
}

/** Range rules: 0 ≤ value ≤ 10¹², optionally > 0. */
export function validate(
  value: number,
  { allowZero = true, max = MAX_INPUT_VALUE }: ValidateOptions = {},
): ParseResult<number> {
  if (value < 0) return err("NEGATIVE");
  if (!Number.isFinite(value) || value > max) return err("TOO_LARGE", { max });
  if (value === 0 && !allowZero) return err("ZERO_NOT_ALLOWED");
  return ok(value);
}

export function parseInput(
  raw: string,
  options: ParseOptions & ValidateOptions = {},
): ParseResult<number> {
  const parsed = parseNumber(raw, options);
  return parsed.ok ? validate(parsed.value, options) : parsed;
}

export function parseCapacity(
  raw: string,
  unit: CapacityUnitId,
  options: ParseOptions = {},
): ParseResult<Quantity<"capacity">> {
  const parsed = parseInput(raw, options);
  return parsed.ok ? ok(capacity(parsed.value, unit)) : parsed;
}
