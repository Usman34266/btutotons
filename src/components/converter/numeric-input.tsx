"use client";

import type { Ref } from "react";

import { Input } from "@/components/ui/input";
import { getUiContent } from "@/content/ui";
import type { ParseErrorCode } from "@/engine";

import { INPUT_UNITS, UnitSelect } from "./unit-select";
import { UnitTooltip } from "./unit-tooltip";
import type { Direction, InputUnit } from "./use-converter-state";

/**
 * GOV.UK pattern: label, hint, field, error under the field (linked with
 * aria-describedby). Accepts "19000" and "19,000"; numeric keyboard on phones.
 */
export function NumericInput({
  id,
  inputRef,
  direction,
  unit,
  raw,
  errorCode,
  onRawChange,
  onUnitChange,
  onBlur,
}: {
  id: string;
  inputRef?: Ref<HTMLInputElement>;
  direction: Direction;
  unit: InputUnit;
  raw: string;
  errorCode: ParseErrorCode | null;
  onRawChange(raw: string): void;
  onUnitChange(unit: InputUnit): void;
  onBlur(): void;
}) {
  const { home, errors } = getUiContent();
  const copy = home.converter;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <label htmlFor={id} className="text-label text-ink">
          {copy.inputLabel[direction]}
        </label>
        <UnitTooltip term={direction === "to-tons" ? "btuh" : "ton"} />
      </div>
      <p id={hintId} className="text-muted-foreground print:hidden">
        {copy.inputHint[direction]}
      </p>
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          id={id}
          name="value"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={copy.placeholder[direction]}
          value={raw}
          onChange={(e) => onRawChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={errorCode ? true : undefined}
          aria-describedby={errorCode ? `${hintId} ${errorId}` : hintId}
          className="flex-1 text-lg"
        />
        {direction === "to-tons" ? (
          <UnitSelect
            id={`${id}-unit`}
            value={unit}
            onChange={onUnitChange}
            units={INPUT_UNITS}
            label={copy.unitLabel}
          />
        ) : (
          <span className="inline-flex h-12 w-36 shrink-0 items-center rounded-lg border border-border bg-muted px-3 text-base text-muted-foreground sm:w-44">
            {copy.tonsUnit}
          </span>
        )}
      </div>
      {errorCode && (
        <p id={errorId} className="font-medium text-danger">
          {errors[errorCode]}
        </p>
      )}
    </div>
  );
}
