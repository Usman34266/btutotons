"use client";

import { useId } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getContent } from "@/content";
import { PRECISIONS, isPrecision, type Precision } from "@/engine";

export function PrecisionToggle({
  value,
  onChange,
}: {
  value: Precision;
  onChange(p: Precision): void;
}) {
  const label = getContent().home.math.precisionLabel;
  const labelId = useId();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span id={labelId} className="text-label text-ink">
        {label}
      </span>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(v) => {
          const n = Number(v);
          if (isPrecision(n)) onChange(n);
        }}
        aria-labelledby={labelId}
        className="bg-surface"
      >
        {PRECISIONS.map((p) => (
          <ToggleGroupItem key={p} value={String(p)}>
            {p}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
