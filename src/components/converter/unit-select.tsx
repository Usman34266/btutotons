import { NativeSelect } from "@/components/ui/native-select";
import { getContent } from "@/content";
import { CAPACITY_UNIT_IDS, UNITS } from "@/engine";

import type { InputUnit } from "./use-converter-state";

const INPUT_UNITS = CAPACITY_UNIT_IDS.filter(
  (id): id is InputUnit => id !== "tr",
);

export function UnitSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: InputUnit;
  onChange(u: InputUnit): void;
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {getContent().home.converter.unitLabel}
      </label>
      <NativeSelect
        id={id}
        value={value}
        onChange={(e) => {
          const next = INPUT_UNITS.find((u) => u === e.target.value);
          if (next) onChange(next);
        }}
        className="w-36 shrink-0 sm:w-44"
      >
        {INPUT_UNITS.map((u) => (
          <option key={u} value={u}>
            {UNITS[u].label}
          </option>
        ))}
      </NativeSelect>
    </>
  );
}
