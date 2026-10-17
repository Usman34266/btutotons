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

/** "Show the math": the general formulas, this conversion's equation, and precision. */
export function FormulaBlock({
  equation,
  precision,
  onPrecisionChange,
}: {
  equation: string;
  precision: Precision;
  onPrecisionChange(p: Precision): void;
}) {
  const { math: copy, actions } = getUiContent().home;
  return (
    <>
      <p className="hidden font-mono text-[0.9375rem] break-words print:block">
        {actions.printCalculation(equation)}
      </p>
      <Collapsible className="print:hidden">
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
        <CollapsibleContent className="flex flex-col gap-4 pt-2">
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
          <PrecisionToggle value={precision} onChange={onPrecisionChange} />
        </CollapsibleContent>
      </Collapsible>
    </>
  );
}
