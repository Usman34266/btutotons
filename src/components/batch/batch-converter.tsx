"use client";

import { useDeferredValue, useId, useState } from "react";

import { LiveStatus } from "@/components/converter/live-status";
import { UnitSelect } from "@/components/converter/unit-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_LOCALE, LOCALES } from "@/config/locale";
import { getUiContent } from "@/content/ui";
import {
  BATCH_MAX_ROWS,
  CAPACITY_UNIT_IDS,
  DEFAULT_PRECISION,
  convertBatch,
  formatInputValue,
  type CapacityUnitId,
} from "@/engine";

import { BatchTable } from "./batch-table";
import { CsvDownload } from "./csv-download";

const REGION = LOCALES[DEFAULT_LOCALE].sizeClassRegion;

/**
 * Paste a list, pick one unit, convert. After the first "Convert list" the
 * table follows edits, so fixing a line updates its row in place.
 */
export function BatchConverter() {
  const copy = getUiContent().batch;
  const id = useId();
  const valuesId = `${id}-values`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const [unit, setUnit] = useState<CapacityUnitId>("btuh");
  const [text, setText] = useState("");
  const [converted, setConverted] = useState(false);
  const deferredText = useDeferredValue(text);

  const outcome = converted
    ? convertBatch(deferredText, unit, { region: REGION })
    : null;
  const rows = outcome?.ok && outcome.value.length > 0 ? outcome.value : null;

  let listError: string | null = null;
  if (outcome && !outcome.ok) {
    listError = copy.errors.tooMany(
      formatInputValue(Number(outcome.error.details?.count)),
      formatInputValue(BATCH_MAX_ROWS),
    );
  } else if (outcome && !rows) {
    listError = copy.errors.empty;
  }

  const summary = rows
    ? copy.summary(
        formatInputValue(rows.length),
        formatInputValue(rows.filter((r) => r.status === "error").length),
      )
    : null;

  return (
    <div className="flex flex-col gap-4">
      <LiveStatus message={listError ?? summary} delay={listError ? 0 : 600} />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setConverted(true);
        }}
        className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 shadow-card sm:p-6"
      >
        <div className="flex flex-col gap-2">
          <UnitSelect
            id={`${id}-unit`}
            value={unit}
            onChange={setUnit}
            units={CAPACITY_UNIT_IDS}
            label={copy.form.unitLabel}
            labelVisible
            className="w-full sm:w-64"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={valuesId} className="text-label text-ink">
            {copy.form.valuesLabel}
          </label>
          <p id={hintId} className="text-muted-foreground">
            {copy.form.valuesHint}
          </p>
          <Textarea
            id={valuesId}
            name="values"
            rows={8}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            placeholder={copy.form.placeholder}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              // Clearing the box starts over: no "paste a value" error while it's empty.
              if (e.target.value.trim() === "") setConverted(false);
            }}
            aria-invalid={listError ? true : undefined}
            aria-describedby={listError ? `${hintId} ${errorId}` : hintId}
            className="font-mono"
          />
          {listError && (
            <p id={errorId} className="font-medium text-danger">
              {listError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit">{copy.form.convert}</Button>
          {rows && <CsvDownload rows={rows} unit={unit} />}
        </div>
      </form>

      {rows && (
        <>
          <p className="text-lg font-medium" data-testid="batch-summary">
            {summary}
          </p>
          <BatchTable rows={rows} precision={DEFAULT_PRECISION} />
        </>
      )}
    </div>
  );
}
