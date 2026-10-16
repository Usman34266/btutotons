"use client";

import {
  startTransition,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

import { DEFAULT_LOCALE, LOCALES } from "@/config/locale";
import {
  DEFAULT_PRECISION,
  convertCapacity,
  formatInputValue,
  fromBtuh,
  isPrecision,
  parseCapacity,
  type CapacityUnitId,
  type ConversionResult,
  type ParseErrorCode,
  type Precision,
} from "@/engine";
import { analytics } from "@/lib/analytics";
import { buildFragment, parseFragment } from "@/lib/fragment-state";
import { STORAGE_KEYS, safeStorage } from "@/lib/safe-storage";

export type Direction = "to-tons" | "to-btuh";
export type InputUnit = Exclude<CapacityUnitId, "tr">;

export interface ConverterInitial {
  direction?: Direction;
  unit?: InputUnit;
  value?: number;
}

interface State {
  direction: Direction;
  /** Input unit for "to-tons" (remembered while in "to-btuh"). */
  unit: InputUnit;
  /** The field text, exactly as typed. */
  raw: string;
  precision: Precision;
  /** Errors show only for this exact text (after a pause, blur or Enter). */
  revealedRaw: string | null;
  /** The URL fragment this state was last synced with; null before hydration. */
  syncedHash: string | null;
  /** Last flip: the text before it and the text carried across, so flipping back is exact. */
  carry: { from: string; to: string } | null;
}

/** Wait before showing an error while the user is still typing ("19," on the way to "19,000"). */
const ERROR_DELAY_MS = 800;
/** Wait before counting a conversion as settled (analytics). */
const SETTLE_DELAY_MS = 1_000;

const REGION = LOCALES[DEFAULT_LOCALE].sizeClassRegion;

// External stores: the URL fragment and the stored precision. Server snapshots
// are null, so server HTML and hydration never depend on the browser.
const subscribeHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const getHash = () => window.location.hash;
const getNull = () => null;
const subscribeNever = () => () => {};
const getStoredPrecision = () => safeStorage.get(STORAGE_KEYS.precision);

const inputUnitOf = (s: Pick<State, "direction" | "unit">): CapacityUnitId =>
  s.direction === "to-btuh" ? "tr" : s.unit;

function derive(s: State) {
  const inputUnit = inputUnitOf(s);
  const parsed = parseCapacity(s.raw, inputUnit);
  const result = parsed.ok
    ? convertCapacity(parsed.value, {
        precision: s.precision,
        region: REGION,
      })
    : null;
  return { inputUnit, parsed, result };
}

function initialState({
  direction = "to-tons",
  unit = "btuh",
  value,
}: ConverterInitial): State {
  return {
    direction,
    unit,
    raw: value === undefined ? "" : formatInputValue(value),
    precision: DEFAULT_PRECISION,
    revealedRaw: null,
    syncedHash: null,
    carry: null,
  };
}

/** State after reading the fragment (first client render or an external hash change). */
function applyHash(state: State, hash: string, stored: string | null): State {
  const fragment = parseFragment(hash);
  const storedPrecision = Number(stored);
  const next: State = {
    ...state,
    precision:
      fragment.precision ??
      (isPrecision(storedPrecision) ? storedPrecision : state.precision),
    syncedHash: hash,
  };
  if (fragment.value === undefined || !fragment.unit) return next;
  return {
    ...next,
    direction: fragment.unit === "tr" ? "to-btuh" : "to-tons",
    unit: fragment.unit === "tr" ? state.unit : fragment.unit,
    raw: formatInputValue(fragment.value),
    revealedRaw: null,
  };
}

/** Write the fragment for a state (replaceState: no history entries) and return it. */
function writeHash(next: State): string | null {
  const unit = inputUnitOf(next);
  const parsed = parseCapacity(next.raw, unit);
  let hash = next.syncedHash;
  if (parsed.ok)
    hash = buildFragment({
      value: parsed.value.value,
      unit,
      precision: next.precision,
    });
  else if (next.raw.trim() === "") hash = "";
  if (hash !== null && hash !== window.location.hash) {
    const { pathname, search } = window.location;
    window.history.replaceState(
      window.history.state,
      "",
      hash === "" ? pathname + search : hash,
    );
  }
  return hash;
}

export interface ConverterState {
  direction: Direction;
  unit: InputUnit;
  inputUnit: CapacityUnitId;
  raw: string;
  precision: Precision;
  result: ConversionResult | null;
  errorCode: ParseErrorCode | null;
  setRaw(raw: string): void;
  setUnit(unit: InputUnit): void;
  setPrecision(precision: Precision): void;
  setDirection(direction: Direction): void;
  selectPreset(btuh: number): void;
  submit(): void;
  blur(): void;
  reset(): void;
}

export function useConverterState(
  initial: ConverterInitial = {},
): ConverterState {
  const [state, setState] = useState(() => initialState(initial));
  const hash = useSyncExternalStore(subscribeHash, getHash, getNull);
  const stored = useSyncExternalStore(
    subscribeNever,
    getStoredPrecision,
    getNull,
  );

  // Adjust state while rendering when the fragment changed outside our handlers.
  if (hash !== null && hash !== state.syncedHash) {
    setState(applyHash(state, hash, stored));
  }

  const { inputUnit, parsed, result } = derive(state);
  const errorCode =
    !parsed.ok && state.revealedRaw === state.raw ? parsed.error.code : null;

  // Reveal an error once the user pauses on invalid text.
  const pendingError =
    !parsed.ok && state.raw.trim() !== "" && state.revealedRaw !== state.raw;
  useEffect(() => {
    if (!pendingError) return;
    const raw = state.raw;
    const timer = setTimeout(
      () => setState((s) => (s.raw === raw ? { ...s, revealedRaw: raw } : s)),
      ERROR_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [pendingError, state.raw]);

  // Analytics once a conversion settles. Props never carry the value.
  const settled = result
    ? `${state.direction}|${inputUnit}|${result.input.value}|${result.sizeClass.type}`
    : null;
  useEffect(() => {
    if (!settled) return;
    const [mode, unit, , sizeType] = settled.split("|") as [
      Direction,
      CapacityUnitId,
      string,
      string,
    ];
    const timer = setTimeout(() => {
      analytics.track("valid_conversion", { mode, unit });
      if (sizeType !== "outside")
        analytics.track("size_class_shown", { mode, unit });
    }, SETTLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [settled]);

  // Updaters, not snapshots: the flip runs in a transition, and typing while it
  // is pending must apply on top of it rather than overwrite it. writeHash is
  // idempotent for a given state, so React re-running an updater is harmless.
  const commit = (change: (s: State) => State) =>
    setState((s) => {
      const next = change(s);
      return next === s ? s : { ...next, syncedHash: writeHash(next) };
    });

  return {
    direction: state.direction,
    unit: state.unit,
    inputUnit,
    raw: state.raw,
    precision: state.precision,
    result,
    errorCode,

    setRaw: (raw) => commit((s) => ({ ...s, raw })),
    setUnit: (unit) => commit((s) => ({ ...s, unit })),
    setPrecision: (precision) => {
      safeStorage.set(STORAGE_KEYS.precision, String(precision));
      commit((s) => ({ ...s, precision }));
    },
    // Flipping carries the answer across: 19,000 BTU/hr → 1.5833333333 tons → 19,000 BTU/hr.
    setDirection: (direction) => {
      // A transition, so <ViewTransition> can morph the two values into each other's place.
      startTransition(() =>
        commit((s) => {
          if (direction === s.direction) return s;
          const current = derive(s).result;
          let raw = s.raw;
          if (s.carry && s.carry.to === s.raw) {
            // Flipped back without editing: restore the user's own text exactly.
            raw = s.carry.from;
          } else if (current) {
            raw = formatInputValue(
              direction === "to-btuh"
                ? current.tons
                : fromBtuh(current.btuh, s.unit),
            );
          }
          return {
            ...s,
            direction,
            raw,
            carry: { from: s.raw, to: raw },
            revealedRaw: null,
          };
        }),
      );
    },
    selectPreset: (btuh) => {
      analytics.track("preset_selected", { mode: "to-tons", unit: "btuh" });
      commit((s) => ({
        ...s,
        direction: "to-tons",
        unit: "btuh",
        raw: formatInputValue(btuh),
        revealedRaw: null,
      }));
    },
    submit: () => setState((s) => ({ ...s, revealedRaw: s.raw })),
    blur: () =>
      setState((s) =>
        s.raw.trim() !== "" && !derive(s).parsed.ok
          ? { ...s, revealedRaw: s.raw }
          : s,
      ),
    reset: () => commit((s) => ({ ...s, raw: "", revealedRaw: null })),
  };
}
