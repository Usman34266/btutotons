/**
 * Result type for the pipeline. User input mistakes are values, not exceptions.
 */
export interface EngineError<C extends string = string> {
  code: C;
  details?: Readonly<Record<string, number | string>>;
}

export type Result<T, E extends EngineError = EngineError> =
  { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): { ok: true; value: T } => ({
  ok: true,
  value,
});

export const err = <C extends string>(
  code: C,
  details?: EngineError<C>["details"],
): { ok: false; error: EngineError<C> } => ({
  ok: false,
  error: details ? { code, details } : { code },
});
