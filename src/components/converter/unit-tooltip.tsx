"use client";

import { CircleHelp } from "lucide-react";

import { getContent, type GlossaryTerm } from "@/content";

import { InfoPopover } from "./info-popover";

/** "?" next to a unit, explaining it in plain words. */
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
    <InfoPopover
      label={whatIs(label)}
      icon={<CircleHelp aria-hidden="true" className="size-5" />}
      className={className}
    >
      <p className="font-semibold">{label}</p>
      <p className="mt-1">{body}</p>
    </InfoPopover>
  );
}
