"use client";

import { ArrowUpLeft, Check, Copy } from "lucide-react";
import { useState } from "react";

import { QuantityChip } from "@/components/converter/quantity-chip";
import { Button } from "@/components/ui/button";
import { getContent } from "@/content";
import {
  UNITS,
  formatAmount,
  formatInputValue,
  formatNumber,
  formatPercent,
  type CompareResult as Comparison,
  type ConversionResult,
  type Precision,
} from "@/engine";
import { copyText } from "@/lib/clipboard";
import { sendToConverter } from "@/lib/converter-handoff";
import { cn } from "@/lib/cn";

const toast = () => import("sonner").then((m) => m.toast);

/** Summary, difference and percent, in that order (spec p. 10). */
export function compareLines(r: Comparison, precision: Precision): string[] {
  const copy = getContent().compare;
  const magnitude = { precision, signDisplay: "never" } as const;
  if (r.direction === "same") {
    return [copy.summary.same, ...(r.percent.ok ? [] : [copy.baselineZero])];
  }
  return [
    copy.summary[r.direction](formatNumber(r.difference.btuh, magnitude)),
    copy.difference(
      formatAmount(r.difference.tons, "tr", { ...magnitude, style: "long" }),
      formatAmount(r.difference.coolingKw, "kw", {
        ...magnitude,
        style: "long",
      }),
    ),
    r.percent.ok
      ? copy.percent[r.direction](formatPercent(r.percent.value, "never"))
      : copy.baselineZero,
  ];
}

const asTyped = ({ input }: ConversionResult) =>
  `${formatInputValue(input.value)} ${UNITS[input.unit].symbol}`;

export function CompareResult({
  result,
  lines,
  className,
}: {
  result: Comparison | null;
  lines: string[] | null;
  className?: string;
}) {
  const { compare, home } = getContent();
  const [copied, setCopied] = useState(false);

  if (!result || !lines) {
    return (
      <div className={cn("flex flex-col gap-3", className)}>
        <QuantityChip kind="capacity" className="self-start" />
        <p className="text-lg">{compare.prompt}</p>
        <p className="text-label text-muted-foreground">{compare.note}</p>
      </div>
    );
  }

  const [summary, ...rest] = lines;
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <QuantityChip kind="capacity" className="self-start" />
      <p className="text-xl font-semibold" data-testid="compare-summary">
        {summary}
      </p>
      {rest.map((line) => (
        <p key={line} className="text-lg" data-testid="compare-line">
          {line}
        </p>
      ))}
      <p className="text-label text-muted-foreground">{compare.note}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        {(["a", "b"] as const).map((side) => (
          <Button
            key={side}
            variant="outline"
            onClick={() =>
              sendToConverter(result[side].input.value, result[side].input.unit)
            }
          >
            <ArrowUpLeft aria-hidden="true" />
            {compare.actions.use[side]}
            <span className="sr-only">{compare.actions.useSuffix}</span>
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={async () => {
            const text = compare.copyText(
              asTyped(result.a),
              asTyped(result.b),
              [...lines, compare.note],
            );
            if (await copyText(text)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2_000);
              (await toast()).success(home.actions.copied);
            } else {
              (await toast()).error(home.actions.copyFailed);
            }
          }}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? home.actions.copied : compare.actions.copy}
        </Button>
      </div>
    </div>
  );
}
