import { EU_SIZE_CLASSES, US_SIZE_CLASS_TONS } from "@/registry/size-classes";

import { BTUH_PER_TON, W_PER_BTUH } from "../constants";
import { formatInputValue } from "../format";
import type { SizeClassRegion } from "../types";

export interface SizeClass {
  region: SizeClassRegion;
  /** Nominal size in the region's own unit: tons (US) or cooling kW (EU). */
  nominal: number;
  nominalBtuh: number;
  tons: number;
  /** "1.5 ton" (US) or "12,000 BTU" (EU marketing label). */
  label: string;
}

/**
 * Each region compares in its own nominal unit so that band edges stay
 * exact (e.g. 2.75 kW is exactly +10% of 2.5 kW).
 */
export interface SizeClassStrategy {
  region: SizeClassRegion;
  classes: readonly SizeClass[];
  measure(btuh: number): number;
}

const us: SizeClassStrategy = {
  region: "us",
  classes: US_SIZE_CLASS_TONS.map((tons) => ({
    region: "us",
    nominal: tons * BTUH_PER_TON,
    nominalBtuh: tons * BTUH_PER_TON,
    tons,
    label: `${formatInputValue(tons)} ton`,
  })),
  measure: (btuh) => btuh,
};

const eu: SizeClassStrategy = {
  region: "eu",
  classes: EU_SIZE_CLASSES.map(({ kw, marketedBtu }) => {
    const nominalBtuh = (kw * 1_000) / W_PER_BTUH;
    return {
      region: "eu",
      nominal: kw,
      nominalBtuh,
      tons: nominalBtuh / BTUH_PER_TON,
      label: `${formatInputValue(marketedBtu)} BTU`,
    };
  }),
  measure: (btuh) => (btuh * W_PER_BTUH) / 1_000,
};

export const SIZE_CLASS_STRATEGIES: Readonly<
  Record<SizeClassRegion, SizeClassStrategy>
> = { us, eu };
