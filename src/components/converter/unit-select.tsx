import { NativeSelect } from "@/components/ui/native-select";
import { CAPACITY_UNIT_IDS, UNITS, type CapacityUnitId } from "@/engine";
import { cn } from "@/lib/cn";

import type { InputUnit } from "./use-converter-state";

/** Capacity units for the BTU/hr → tons field (tons have their own direction). */
export const INPUT_UNITS = CAPACITY_UNIT_IDS.filter(
  (id): id is InputUnit => id !== "tr",
);

export function UnitSelect<U extends CapacityUnitId>({
  id,
  value,
  onChange,
  units,
  label,
  labelVisible = false,
  className,
}: {
  id: string;
  value: U;
  onChange(u: U): void;
  units: readonly U[];
  label: string;
  labelVisible?: boolean;
  className?: string;
}) {
  return (
    <>
      <label
        htmlFor={id}
        className={labelVisible ? "text-label text-ink" : "sr-only"}
      >
        {label}
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => {
          const next = units.find((u) => u === e.target.value);
          if (next) onChange(next);
        }}
        className={cn("w-36 shrink-0 sm:w-44", className)}
      >
        {units.map((u) => (
          <option key={u} value={u}>
            {UNITS[u].label}
          </option>
        ))}
      </NativeSelect>
    </>
  );
}
