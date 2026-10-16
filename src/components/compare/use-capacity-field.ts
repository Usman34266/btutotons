"use client";

import { useEffect, useState } from "react";

import {
  parseCapacity,
  type CapacityUnitId,
  type ParseErrorCode,
  type Quantity,
} from "@/engine";

/** Same pause as the main converter (D053): no error while "19," is on its way to "19,000". */
const ERROR_DELAY_MS = 800;

export interface CapacityField {
  raw: string;
  unit: CapacityUnitId;
  /** The parsed value, or null while the text is empty or invalid. */
  quantity: Quantity<"capacity"> | null;
  /** Shown only after a pause, on blur or on Enter; never for an empty field. */
  errorCode: ParseErrorCode | null;
  setRaw(raw: string): void;
  setUnit(unit: CapacityUnitId): void;
  reveal(): void;
}

export function useCapacityField(initialUnit: CapacityUnitId): CapacityField {
  const [raw, setRaw] = useState("");
  const [unit, setUnit] = useState(initialUnit);
  const [revealedRaw, setRevealedRaw] = useState<string | null>(null);

  const parsed = parseCapacity(raw, unit);
  const empty = raw.trim() === "";
  const pending = !parsed.ok && !empty && revealedRaw !== raw;

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setRevealedRaw(raw), ERROR_DELAY_MS);
    return () => clearTimeout(timer);
  }, [pending, raw]);

  return {
    raw,
    unit,
    quantity: parsed.ok ? parsed.value : null,
    errorCode:
      !parsed.ok && !empty && revealedRaw === raw ? parsed.error.code : null,
    setRaw,
    setUnit,
    reveal: () => setRevealedRaw(raw),
  };
}
