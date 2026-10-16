"use client";

import { ViewTransition, type CSSProperties, type ReactNode } from "react";

import { IceBlocks } from "@/components/visuals/ice-blocks";
import { getContent } from "@/content";
import {
  formatInputValue,
  formatNumber,
  type ConversionResult,
  type Precision,
} from "@/engine";

import { DigitMorph } from "./digit-morph";
import { FormulaBlock } from "./formula-block";
import { QuantityChip } from "./quantity-chip";
import { Segments } from "./segments";
import { SizeClassBadge } from "./size-class-badge";
import { UnitTooltip } from "./unit-tooltip";
import type { Direction, InputUnit } from "./use-converter-state";

export type ResultSentence = ReturnType<typeof resultSentence>;

/** The plain-English answer for a conversion. */
export function resultSentence(
  direction: Direction,
  result: ConversionResult,
  precision: Precision,
) {
  const { sentence } = getContent().home;
  const value = formatInputValue(result.input.value);
  if (direction === "to-btuh")
    return sentence.toBtuh(value, formatNumber(result.btuh, { precision }));
  const unit = result.input.unit as InputUnit;
  const sc = result.sizeClass;
  if (sc.type === "class")
    return sentence.toTons(value, unit, {
      type: "class",
      cls: formatInputValue(sc.sizeClass.tons),
    });
  if (sc.type === "between") {
    return sentence.toTons(value, unit, {
      type: "between",
      lower: formatInputValue(sc.lower.tons),
      upper: formatInputValue(sc.upper.tons),
    });
  }
  return sentence.toTons(value, unit, {
    type: "outside",
    tons: formatNumber(result.tons, { precision: 2 }),
  });
}

/**
 * Answer first: chip, sentence, the exact number, size class, other units,
 * ice blocks, note, then "Show the math". On --accent-soft, secondary text is ink.
 */
export function ResultPanel({
  direction,
  result,
  precision,
  onPrecisionChange,
  outputFor,
  invalid,
  actions,
}: {
  direction: Direction;
  result: ConversionResult | null;
  precision: Precision;
  onPrecisionChange(p: Precision): void;
  outputFor: string;
  /** The field has text but no valid number. */
  invalid: boolean;
  actions: ReactNode;
}) {
  const copy = getContent().home.converter;

  if (!result) {
    const empty = copy.empty[direction];
    return (
      <div className="flex flex-col gap-3" data-testid="result-empty">
        <QuantityChip kind="capacity" className="self-start" />
        <p className="text-2xl font-semibold">{empty.rule}</p>
        <p>{invalid ? copy.invalidPrompt : empty.prompt}</p>
        <IceBlocks tons={1} captionClassName="text-ink" />
        {actions}
      </div>
    );
  }

  const toTons = direction === "to-tons";
  const big = formatNumber(toTons ? result.tons : result.btuh, { precision });
  const kw = formatNumber(result.coolingKw, { precision });

  return (
    <div className="flex flex-col gap-4" data-testid="result">
      <QuantityChip kind="capacity" className="self-start" />
      <p className="text-lg" data-testid="result-sentence">
        <Segments segments={resultSentence(direction, result, precision)} />
      </p>

      <ViewTransition
        key={direction}
        name={toTons ? "value-tons" : "value-btu"}
        share="morph"
        default="none"
      >
        <div className="@container flex flex-wrap items-baseline gap-x-2">
          <output
            htmlFor={outputFor}
            className="text-result-fit"
            style={{ "--result-chars": big.length } as CSSProperties}
            data-testid="result-value"
          >
            <DigitMorph text={big} />
          </output>
          <span className="inline-flex items-center gap-1 text-xl font-medium">
            {copy.bigUnit[direction](big)}
            <UnitTooltip term={toTons ? "ton" : "btuh"} className="text-ink" />
          </span>
        </div>
      </ViewTransition>

      <SizeClassBadge sizeClass={result.sizeClass} tons={result.tons} />

      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 border-t border-accent/20 pt-3">
        {toTons && result.input.unit !== "btuh" && (
          <>
            <dt className="inline-flex items-center gap-1 text-label">
              {copy.secondary.btuh}{" "}
              <UnitTooltip term="btuh" className="text-ink" />
            </dt>
            <dd
              className="min-w-0 text-lg font-medium wrap-anywhere"
              data-testid="result-btuh"
            >
              {formatNumber(result.btuh, { precision })}
            </dd>
          </>
        )}
        <dt className="inline-flex items-center gap-1 text-label">
          {copy.secondary.coolingKw}{" "}
          <UnitTooltip term="coolingKw" className="text-ink" />
        </dt>
        <dd
          className="min-w-0 text-lg font-medium wrap-anywhere"
          data-testid="result-kw"
        >
          {kw}
        </dd>
      </dl>

      <IceBlocks tons={result.tons} captionClassName="text-ink" />
      <p className="text-label">{copy.resultNote}</p>
      <FormulaBlock
        equation={result.equation}
        precision={precision}
        onPrecisionChange={onPrecisionChange}
      />
      {actions}
    </div>
  );
}
