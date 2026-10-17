"use client";

import dynamic from "next/dynamic";
import { useId, useRef, type CSSProperties } from "react";

import { Input } from "@/components/ui/input";
import type { GlossaryTerm } from "@/content";
import { getUiContent } from "@/content/ui";
import {
  UNITS,
  formatAmount,
  formatInputAmount,
  formatInputValue,
  formatNumber,
  type CapacityUnitId,
} from "@/engine";
import { pairSentence } from "@/lib/unit-pair";

import { DigitMorph } from "./digit-morph";
import { FormulaBlock } from "./formula-block";
import { LiveStatus } from "./live-status";
import { PrintHeading } from "./print-heading";
import { QuantityChip } from "./quantity-chip";
import { ResultActions } from "./result-actions";
import { segmentsText } from "./segments";
import { SizeClassBadge, sizeClassSegments } from "./size-class-badge";
import { UnitTooltip } from "./unit-tooltip";
import { useConverterState, type UnitPair } from "./use-converter-state";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

/** BTU/hr, tons and cooling kW: shown as secondary values unless they are the page's own units. */
const SECONDARY = ["btuh", "tr", "kw"] as const;
type SecondaryUnit = (typeof SECONDARY)[number];

const TERM: Record<SecondaryUnit, GlossaryTerm> = {
  btuh: "btuh",
  tr: "ton",
  kw: "coolingKw",
};
const termOf = (unit: CapacityUnitId): GlossaryTerm | undefined =>
  (SECONDARY as readonly CapacityUnitId[]).includes(unit)
    ? TERM[unit as SecondaryUnit]
    : undefined;

/**
 * Converter for a unit-pair page: fixed input and output units, the page's
 * answer as the main result. Same field, errors, precision, copy, share and
 * fragment state as the homepage converter (D100).
 */
export function PairConverter({
  pair,
  example,
}: {
  pair: UnitPair;
  /** Shown as the placeholder. */
  example: number;
}) {
  const { home, errors, unitPair } = getUiContent();
  const copy = home.converter;
  const s = useConverterState({ pair });
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const direction = pair.from === "tr" ? "to-btuh" : "to-tons";
  const { result, precision } = s;
  const from = UNITS[pair.from];
  const to = UNITS[pair.to];
  const inputTerm = termOf(pair.from);
  const outputTerm = termOf(pair.to);
  const label: Record<SecondaryUnit, string> = {
    btuh: copy.secondary.btuh,
    tr: unitPair.secondary.tons,
    kw: copy.secondary.coolingKw,
  };

  const sentence = result ? pairSentence(result, precision) : null;
  const big = result ? formatNumber(result.output.value, { precision }) : "";
  const secondary = result
    ? SECONDARY.filter((u) => u !== pair.from && u !== pair.to).map((unit) => ({
        unit,
        value: { btuh: result.btuh, tr: result.tons, kw: result.coolingKw }[
          unit
        ],
      }))
    : [];
  const copyValue =
    result &&
    home.actions.copyText({
      input: formatInputAmount(result.input.value, result.input.unit),
      outputs: [result.output, ...secondary].map(({ value, unit }) =>
        formatAmount(value, unit, {
          precision,
          style: unit === "btuh" ? "symbol" : "long",
        }),
      ),
      size:
        segmentsText(sizeClassSegments(result.sizeClass, result.tons)) || null,
      equation: result.equation,
    });

  return (
    <div data-print-area className="flex flex-col gap-6">
      <Toaster position="bottom-center" />
      <PrintHeading />
      <LiveStatus
        message={s.errorCode ? errors[s.errorCode] : sentence}
        delay={s.errorCode ? 0 : 900}
      />

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface shadow-card md:grid-cols-12">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            s.submit();
          }}
          className="flex flex-col gap-2 p-4 sm:p-6 md:col-span-7"
        >
          <div className="flex items-center gap-1">
            <label htmlFor={id} className="text-label text-ink">
              {copy.inputLabel[direction]}
            </label>
            {inputTerm && <UnitTooltip term={inputTerm} />}
          </div>
          <p id={hintId} className="text-muted-foreground">
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
              placeholder={unitPair.placeholder(formatInputValue(example))}
              value={s.raw}
              onChange={(e) => s.setRaw(e.target.value)}
              onBlur={s.blur}
              aria-invalid={s.errorCode ? true : undefined}
              aria-describedby={s.errorCode ? `${hintId} ${errorId}` : hintId}
              className="flex-1 text-lg"
            />
            <span className="inline-flex h-12 w-36 shrink-0 items-center rounded-lg border border-border bg-muted px-3 text-base text-muted-foreground sm:w-44">
              {from.label}
            </span>
          </div>
          {s.errorCode && (
            <p id={errorId} className="font-medium text-danger">
              {errors[s.errorCode]}
            </p>
          )}
        </form>

        <div className="bg-accent-soft p-4 sm:p-6 md:col-span-5">
          {result ? (
            <div className="flex flex-col gap-4" data-testid="result">
              <QuantityChip kind="capacity" className="self-start" />
              <p className="text-lg" data-testid="result-sentence">
                {sentence}
              </p>
              <div className="@container flex flex-wrap items-baseline gap-x-2">
                <output
                  htmlFor={id}
                  className="text-result-fit"
                  style={{ "--result-chars": big.length } as CSSProperties}
                  data-testid="result-value"
                >
                  <DigitMorph text={big} />
                </output>
                <span className="inline-flex items-center gap-1 text-xl font-medium">
                  {big === "1" ? to.singular : to.plural}
                  {outputTerm && (
                    <UnitTooltip term={outputTerm} className="text-ink" />
                  )}
                </span>
              </div>
              <SizeClassBadge sizeClass={result.sizeClass} tons={result.tons} />
              {secondary.length > 0 && (
                <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 border-t border-accent/20 pt-3">
                  {secondary.map(({ unit, value }) => (
                    <div key={unit} className="contents">
                      <dt className="inline-flex items-center gap-1 text-label">
                        {label[unit]}{" "}
                        <UnitTooltip term={TERM[unit]} className="text-ink" />
                      </dt>
                      <dd
                        className="min-w-0 text-lg font-medium wrap-anywhere"
                        data-testid={`result-${unit}`}
                      >
                        {formatNumber(value, { precision })}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              <p className="-mt-2 text-label">{copy.resultNote}</p>
              <FormulaBlock
                equation={result.equation}
                precision={precision}
                onPrecisionChange={s.setPrecision}
              />
              <ResultActions
                copyValue={copyValue || null}
                shareText={sentence ?? ""}
                showReset={s.raw !== ""}
                onReset={() => {
                  s.reset();
                  inputRef.current?.focus();
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3" data-testid="result-empty">
              <QuantityChip kind="capacity" className="self-start" />
              <p className="text-xl font-semibold">
                {s.raw.trim() !== ""
                  ? copy.invalidPrompt
                  : unitPair.emptyPrompt(from.label, to.label)}
              </p>
              <ResultActions
                copyValue={null}
                shareText=""
                showReset={s.raw !== ""}
                onReset={() => {
                  s.reset();
                  inputRef.current?.focus();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
