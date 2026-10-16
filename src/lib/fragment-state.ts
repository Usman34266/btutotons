/**
 * Share state lives only in the URL fragment: `#v=24000&u=btuh&p=4`.
 * Never query strings (indexable). Values are validated by the engine.
 */
import {
  formatCsvNumber,
  isCapacityUnit,
  isPrecision,
  parseInput,
  type CapacityUnitId,
  type Precision,
} from "@/engine";

export interface FragmentState {
  value?: number;
  unit?: CapacityUnitId;
  precision?: Precision;
}

export function parseFragment(hash: string): FragmentState {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const state: FragmentState = {};

  const unit = params.get("u");
  if (unit !== null && isCapacityUnit(unit)) state.unit = unit;

  const raw = params.get("v");
  if (raw !== null && state.unit) {
    const parsed = parseInput(raw);
    if (parsed.ok) state.value = parsed.value;
  }

  const precision = Number(params.get("p"));
  if (isPrecision(precision)) state.precision = precision;

  return state;
}

export function buildFragment({
  value,
  unit,
  precision,
}: Required<FragmentState>): string {
  const params = new URLSearchParams({
    v: formatCsvNumber(value),
    u: unit,
    p: String(precision),
  });
  return `#${params.toString()}`;
}
