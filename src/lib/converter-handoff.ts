import type { CapacityUnitId } from "@/engine";

import { buildFragment } from "./fragment-state";

/** Root id of the homepage converter. */
export const CONVERTER_ID = "converter";

/**
 * Load a capacity into the homepage converter and move focus to its field.
 * The converter follows the URL fragment, so this only writes `#v=…&u=…`.
 */
export function sendToConverter(value: number, unit: CapacityUnitId): void {
  window.location.hash = buildFragment({ value, unit });
  // The field remounts when the direction changes; focus it after React has rendered.
  requestAnimationFrame(() =>
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLInputElement>(`#${CONVERTER_ID} input[name=value]`)
        ?.focus(),
    ),
  );
}
