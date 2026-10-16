import { SIZE_CLASS_BAND } from "@/registry/size-classes";

import { SIZE_CLASS_STRATEGIES, type SizeClass } from "./strategies/size-class";
import type { SizeClassRegion } from "./types";

export type { SizeClass } from "./strategies/size-class";

export type SizeClassResult =
  | { type: "class"; sizeClass: SizeClass }
  | { type: "between"; lower: SizeClass; upper: SizeClass }
  | { type: "outside" };

/** Absorbs floating-point noise at band edges and in ties (D032). */
const EPSILON = 1e-9;

/**
 * Names the size an AC is sold as. Labels an existing AC; never a recommendation.
 * 1. d = |value − nominal| ÷ nominal per class.
 * 2. Candidates: d ≤ band (inclusive).
 * 3–4. Closest candidate wins; an exact tie is "between".
 * 5. No candidate, between two classes → "between".
 * 6. Otherwise → "outside".
 */
export function classifySize(
  btuh: number,
  region: SizeClassRegion = "us",
  band: number = SIZE_CLASS_BAND,
): SizeClassResult {
  const { classes, measure } = SIZE_CLASS_STRATEGIES[region];
  const value = measure(btuh);

  const [best, runnerUp] = classes
    .map((sizeClass) => ({
      sizeClass,
      d: Math.abs(value - sizeClass.nominal) / sizeClass.nominal,
    }))
    .filter(({ d }) => d <= band + EPSILON)
    .sort((a, b) => a.d - b.d);

  if (best) {
    if (runnerUp && runnerUp.d - best.d <= EPSILON) {
      const [lower, upper] =
        best.sizeClass.nominal < runnerUp.sizeClass.nominal
          ? [best.sizeClass, runnerUp.sizeClass]
          : [runnerUp.sizeClass, best.sizeClass];
      return { type: "between", lower, upper };
    }
    return { type: "class", sizeClass: best.sizeClass };
  }

  const lower = classes.findLast((c) => c.nominal < value);
  const upper = classes.find((c) => c.nominal > value);
  return lower && upper
    ? { type: "between", lower, upper }
    : { type: "outside" };
}
