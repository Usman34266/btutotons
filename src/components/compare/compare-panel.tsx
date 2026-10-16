"use client";

import { useEffect, useId, useSyncExternalStore } from "react";

import { LiveStatus } from "@/components/converter/live-status";
import { UnitSelect } from "@/components/converter/unit-select";
import { Input } from "@/components/ui/input";
import { getUiContent } from "@/content/ui";
import {
  CAPACITY_UNIT_IDS,
  DEFAULT_PRECISION,
  compareCapacities,
  isPrecision,
  type Precision,
} from "@/engine";
import { analytics } from "@/lib/analytics";
import { STORAGE_KEYS, safeStorage } from "@/lib/safe-storage";

import { CompareResult, compareLines } from "./compare-result";
import { useCapacityField, type CapacityField } from "./use-capacity-field";

/** Wait before counting a comparison as completed (analytics), like the converter. */
const SETTLE_DELAY_MS = 1_000;

const subscribeNever = () => () => {};
const getStoredPrecision = () => safeStorage.get(STORAGE_KEYS.precision);
const getNull = () => null;

function CompareField({
  side,
  field,
}: {
  side: "a" | "b";
  field: CapacityField;
}) {
  const { compare, errors } = getUiContent();
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {compare.fields[side]}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          name={side}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={compare.placeholder[side]}
          value={field.raw}
          onChange={(e) => field.setRaw(e.target.value)}
          onBlur={field.reveal}
          onKeyDown={(e) => {
            if (e.key === "Enter") field.reveal();
          }}
          aria-invalid={field.errorCode ? true : undefined}
          aria-describedby={field.errorCode ? errorId : undefined}
          className="flex-1 text-lg"
        />
        <UnitSelect
          id={`${id}-unit`}
          value={field.unit}
          onChange={field.setUnit}
          units={CAPACITY_UNIT_IDS}
          label={compare.unitLabel[side]}
        />
      </div>
      {field.errorCode && (
        <p id={errorId} className="font-medium text-danger">
          {errors[field.errorCode]}
        </p>
      )}
    </div>
  );
}

/** Compare two ratings (/#compare). Capacity difference only; lazy-loaded. */
export function ComparePanel() {
  const a = useCapacityField("btuh");
  const b = useCapacityField("btuh");
  const stored = Number(
    useSyncExternalStore(subscribeNever, getStoredPrecision, getNull),
  );
  const precision: Precision = isPrecision(stored) ? stored : DEFAULT_PRECISION;

  const result =
    a.quantity && b.quantity ? compareCapacities(a.quantity, b.quantity) : null;
  const lines = result ? compareLines(result, precision) : null;

  // Analytics once a comparison settles. Props never carry the values.
  const settled = lines?.join(" ") ?? null;
  useEffect(() => {
    if (!settled) return;
    const timer = setTimeout(
      () => analytics.track("compare_completed", { mode: "compare" }),
      SETTLE_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [settled]);

  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-surface p-4 sm:p-6 md:grid-cols-2">
      <LiveStatus message={settled} />
      <form
        noValidate
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-4"
      >
        <CompareField side="a" field={a} />
        <CompareField side="b" field={b} />
      </form>
      <CompareResult
        result={result}
        lines={lines}
        className="border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6"
      />
    </div>
  );
}
