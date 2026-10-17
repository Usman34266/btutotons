"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getUiContent } from "@/content/ui";
import {
  BTUH_PER_TON,
  W_PER_BTUH,
  formatInputValue,
  type Precision,
} from "@/engine";

import { PrecisionToggle } from "./precision-toggle";

/**
 * "Show the math": the general formulas, this conversion's equation, and precision.
 * The content stays mounted so a printout always shows it open (D107).
 */
export function FormulaBlock({
  equation,
  precision,
  onPrecisionChange,
}: {
  equation: string;
  precision: Precision;
  onPrecisionChange(p: Precision): void;
}) {
  const copy = getUiContent().home.math;
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="group -mx-4 text-ink hover:bg-accent/10 aria-expanded:bg-transparent"
        >
          {copy.toggle}
          <ChevronDown
            aria-hidden="true"
            className="transition-transform duration-150 group-data-[state=open]:rotate-180"
          />
        </Button>
      </CollapsibleTrigger>
      <p className="hidden text-label text-ink print:block">
        {copy.printHeading}
      </p>
      <CollapsibleContent
        forceMount
        className="flex flex-col gap-4 pt-2 data-[state=closed]:hidden print:flex!"
      >
        <ul className="flex flex-col gap-1 font-mono text-[0.9375rem]">
          {copy
            .formulas(
              formatInputValue(BTUH_PER_TON),
              formatInputValue(W_PER_BTUH),
            )
            .map((f) => (
              <li key={f}>{f}</li>
            ))}
        </ul>
        <div className="flex flex-col gap-1">
          <span className="text-label text-ink">{copy.yourNumbers}</span>
          <code className="rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[0.9375rem] break-words">
            {equation}
          </code>
        </div>
        <div className="print:hidden">
          <PrecisionToggle value={precision} onChange={onPrecisionChange} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
