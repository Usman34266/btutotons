"use client";

import { CircleHelp } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getContent, type GlossaryTerm } from "@/content";
import { cn } from "@/lib/cn";

/**
 * "?" next to a unit. A popover, not a hover tooltip: works with keyboard
 * (Enter/Space opens, Escape closes) and touch. 44px hit area.
 */
export function UnitTooltip({
  term,
  className,
}: {
  term: GlossaryTerm;
  className?: string;
}) {
  const { terms, whatIs } = getContent().unitsGlossary;
  const { label, body } = terms[term];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={whatIs(label)}
          className={cn(
            "relative inline-flex size-6 shrink-0 items-center justify-center rounded-full align-middle text-muted-foreground transition-colors duration-150 after:absolute after:-inset-2.5 after:content-[''] hover:text-ink data-[state=open]:text-accent",
            className,
          )}
        >
          <CircleHelp aria-hidden="true" className="size-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-semibold">{label}</p>
        <p className="mt-1">{body}</p>
      </PopoverContent>
    </Popover>
  );
}
