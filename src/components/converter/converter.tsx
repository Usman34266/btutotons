"use client";

import dynamic from "next/dynamic";
import { ViewTransition, useId, useRef } from "react";

import { getUiContent } from "@/content/ui";
import { UNITS, formatAmount, formatInputValue } from "@/engine";
import { cn } from "@/lib/cn";
import { CONVERTER_ID } from "@/lib/converter-handoff";

import { DirectionTabs } from "./direction-tabs";
import { LiveStatus } from "./live-status";
import { NumericInput } from "./numeric-input";
import { QuickValues } from "./quick-values";
import { ResultActions } from "./result-actions";
import { ResultPanel, resultSentence } from "./result-panel";
import { segmentsText } from "./segments";
import { sizeClassSegments } from "./size-class-badge";
import {
  useConverterState,
  type ConverterInitial,
} from "./use-converter-state";

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false },
);

/**
 * The BTU/hr ↔ tons converter. Desktop: input 7/12, result 5/12 on
 * --accent-soft. Mobile: tabs → input → result → actions → quick values.
 */
export function Converter({
  initial,
  embedded = false,
}: {
  initial?: ConverterInitial;
  /** Inside another site's iframe (/embed/): no quick values, print or embed. */
  embedded?: boolean;
}) {
  const { home, errors } = getUiContent();
  const s = useConverterState(initial);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { result, precision, direction } = s;

  const sentence = result
    ? segmentsText(resultSentence(direction, result, precision))
    : null;
  const sizeLine = result
    ? segmentsText(sizeClassSegments(result.sizeClass, result.tons))
    : null;
  const copyValue =
    result &&
    home.actions.copyText({
      input:
        direction === "to-btuh"
          ? formatAmount(result.input.value, "tr", { precision, style: "long" })
          : `${formatInputValue(result.input.value)} ${UNITS[result.input.unit].symbol}`,
      outputs: [
        ...(direction === "to-tons"
          ? [formatAmount(result.tons, "tr", { precision, style: "long" })]
          : []),
        ...(result.input.unit !== "btuh"
          ? [formatAmount(result.btuh, "btuh", { precision })]
          : []),
        formatAmount(result.coolingKw, "kw", { precision, style: "long" }),
      ],
      size: sizeLine || null,
      equation: result.equation,
    });

  return (
    <div id={CONVERTER_ID} data-print-area className="flex flex-col gap-6">
      <Toaster position="bottom-center" />
      <LiveStatus
        message={
          s.errorCode
            ? errors[s.errorCode]
            : result &&
              sentence &&
              home.converter.announcement(
                sentence,
                direction === "to-tons"
                  ? formatAmount(result.tons, "tr", {
                      precision,
                      style: "long",
                    })
                  : null,
              )
        }
        delay={s.errorCode ? 0 : 900}
      />

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface shadow-card md:grid-cols-12 md:grid-rows-[auto_1fr]">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            s.submit();
          }}
          className="flex flex-col gap-6 p-4 sm:p-6 md:col-span-7"
        >
          <div className="print:hidden">
            <DirectionTabs value={direction} onChange={s.setDirection} />
          </div>
          {/* Keyed by direction: the old value unmounts and the new one mounts, so the pair can morph. */}
          <ViewTransition
            key={direction}
            name={direction === "to-tons" ? "value-btu" : "value-tons"}
            share="morph"
            default="none"
          >
            <div>
              <NumericInput
                id={inputId}
                inputRef={inputRef}
                direction={direction}
                unit={s.unit}
                raw={s.raw}
                errorCode={s.errorCode}
                onRawChange={s.setRaw}
                onUnitChange={s.setUnit}
                onBlur={s.blur}
              />
            </div>
          </ViewTransition>
        </form>

        <div
          ref={resultRef}
          className={cn(
            "bg-accent-soft p-4 sm:p-6 md:col-span-5 md:row-span-2 print:min-h-0",
            !embedded && "md:min-h-[32rem]",
          )}
        >
          <ResultPanel
            direction={direction}
            result={result}
            precision={precision}
            onPrecisionChange={s.setPrecision}
            outputFor={inputId}
            invalid={s.raw.trim() !== "" && !result}
            actions={
              <ResultActions
                copyValue={copyValue || null}
                shareText={sentence ?? ""}
                showReset={s.raw !== ""}
                tools={!embedded}
                onReset={() => {
                  s.reset();
                  inputRef.current?.focus();
                }}
              />
            }
          />
        </div>

        {!embedded && (
          <div className="border-t border-border p-4 sm:p-6 md:col-span-7 md:row-start-2 print:hidden">
            <QuickValues
              onSelect={(btuh) => {
                s.selectPreset(btuh);
                const panel = resultRef.current;
                if (panel && panel.getBoundingClientRect().top < 0) {
                  const smooth = !window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches;
                  panel.scrollIntoView({
                    block: "start",
                    behavior: smooth ? "smooth" : "auto",
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
