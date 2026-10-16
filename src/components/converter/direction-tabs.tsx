"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getUiContent } from "@/content/ui";

import type { Direction } from "./use-converter-state";

const DIRECTIONS: Direction[] = ["to-tons", "to-btuh"];

/** Segmented control for the conversion direction (a radio group with roving focus). */
export function DirectionTabs({
  value,
  onChange,
}: {
  value: Direction;
  onChange(d: Direction): void;
}) {
  const copy = getUiContent().home.converter;
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v === "to-tons" || v === "to-btuh") onChange(v);
      }}
      aria-label={copy.directionLabel}
      className="w-full sm:w-fit"
    >
      {DIRECTIONS.map((d) => (
        <ToggleGroupItem key={d} value={d} className="flex-1 sm:flex-none">
          {copy.directions[d]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
