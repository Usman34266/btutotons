"use client";

import Link from "next/link";
import { useId } from "react";

import { useCapacityField } from "@/components/compare/use-capacity-field";
import { LiveStatus } from "@/components/converter/live-status";
import { QuantityChip } from "@/components/converter/quantity-chip";
import {
  SizeClassBadge,
  sizeClassSegments,
} from "@/components/converter/size-class-badge";
import { segmentsText } from "@/components/converter/segments";
import { UnitSelect } from "@/components/converter/unit-select";
import { Input } from "@/components/ui/input";
import { getContent } from "@/content";
import { convertCapacity, formatAmount, type CapacityUnitId } from "@/engine";
import { buildFragment } from "@/lib/fragment-state";
import { routes } from "@/registry/routes";

/** Spec p. 12: the explicit-capacity form takes BTU/hr or cooling kW. */
const UNITS: readonly CapacityUnitId[] = ["btuh", "kw"];

/** Rated capacity → tons, through the normal engine. Never reads a model number. */
export function NameplateCapacityForm({ initialRaw }: { initialRaw: string }) {
  const { nameplate, errors } = getContent();
  const copy = nameplate.form;
  const field = useCapacityField("btuh", initialRaw);
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const result = field.quantity ? convertCapacity(field.quantity) : null;
  const tons = result
    ? formatAmount(result.tons, "tr", { style: "long" })
    : null;
  const announcement =
    result && tons
      ? [
          `${copy.resultLabel}: ${tons}.`,
          segmentsText(sizeClassSegments(result.sizeClass, result.tons)),
        ]
          .join(" ")
          .trim()
      : null;

  return (
    <div className="grid grid-cols-1 gap-6 rounded-xl border border-border bg-surface p-4 sm:p-6 md:grid-cols-2">
      <LiveStatus message={announcement} />
      <form
        noValidate
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-2"
      >
        <label htmlFor={id} className="text-label text-ink">
          {copy.label}
        </label>
        <p id={hintId} className="text-label text-muted-foreground">
          {copy.hint}
        </p>
        <div className="flex gap-2">
          <Input
            id={id}
            name="rated-capacity"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            placeholder={copy.placeholder}
            value={field.raw}
            onChange={(e) => field.setRaw(e.target.value)}
            onBlur={field.reveal}
            onKeyDown={(e) => {
              if (e.key === "Enter") field.reveal();
            }}
            aria-invalid={field.errorCode ? true : undefined}
            aria-describedby={field.errorCode ? `${hintId} ${errorId}` : hintId}
            className="flex-1 text-lg"
          />
          <UnitSelect
            id={`${id}-unit`}
            value={field.unit}
            onChange={field.setUnit}
            units={UNITS}
            label={copy.unitLabel}
          />
        </div>
        {field.errorCode && (
          <p id={errorId} className="font-medium text-danger">
            {errors[field.errorCode]}
          </p>
        )}
      </form>

      <div
        className="flex flex-col gap-3 border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6"
        data-testid="nameplate-result"
      >
        <QuantityChip kind="capacity" className="self-start" />
        {result && field.quantity ? (
          <>
            <p className="text-label text-ink">{copy.resultLabel}</p>
            <p
              className="text-3xl font-semibold wrap-anywhere tabular-nums"
              data-testid="nameplate-tons"
            >
              {tons}
            </p>
            <SizeClassBadge sizeClass={result.sizeClass} tons={result.tons} />
            <p>
              <Link
                href={`${routes.home.path}${buildFragment({
                  value: field.quantity.value,
                  unit: field.unit,
                })}`}
                className="rounded text-ink underline underline-offset-4 hover:text-accent"
              >
                {copy.openInCalculator}
              </Link>
            </p>
          </>
        ) : (
          <p className="text-lg font-semibold">{copy.empty}</p>
        )}
      </div>
    </div>
  );
}
