/**
 * Prototype motion section under the homepage converter (owner review).
 * Facts only from docs/STANDARDS-CHEATSHEET.md (1 TR = 12,000 BTU/hr, the US
 * size list). The airflow and cooling effort are illustrations: the setpoint
 * changes how hard the pictured AC works, never its rated capacity.
 */
import { plural } from "@/lib/pluralize";

export const tonnagePlayground = {
  eyebrow: "Try it",
  heading: "Slide through common AC sizes",
  intro:
    "Pick a size and watch the AC respond. Drag the picture to turn the AC.",
  modeLabel: "What do you want to pick?",
  modes: { tons: "Pick tons", btuh: "Pick BTU/hr" },
  /** Distinct from the calculator's field labels ("Size in tons", …). */
  sliderLabel: { tons: "Pick a size (tons)", btuh: "Pick a rating (BTU/hr)" },
  equals: "equals",
  stopsLabel: "Common capacity examples — not a sizing recommendation.",
  temperature: {
    label: "Temperature setting",
    unit: "°C",
    /** Pending HVAC review: not in the standards cheatsheet yet. */
    note: "A lower setting makes the AC work harder or longer to reach it, but never above its rated capacity. That's why the tons and BTU/hr stay the same.",
  },
  effort: {
    label: "Cooling effort",
    levels: { gentle: "Gentle", steady: "Steady", full: "Full" },
  },
  swing: {
    label: "Air swing",
    on: "On",
    off: "Off",
  },
  airNote: "The air and cooling effort are illustrations, not measurements.",
  /** Text on the AC's display. */
  lcd: {
    mode: "COOL",
    tons: (n: string) => `${n} ${plural(n, "TON", "TONS")}`,
  },
  loading: "Loading the interactive version…",
} as const;
