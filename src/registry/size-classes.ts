/**
 * AC size classes (build prompt §8.6). Data only; the rule lives in
 * src/engine/size-class.ts. Lists must stay in ascending order.
 */

/** Relative band around each nominal size, inclusive (±10%). */
export const SIZE_CLASS_BAND = 0.1; // HVAC reviewer to confirm

/** US nominal sizes in refrigeration tons (nominal BTU/hr = tons × 12,000). */
export const US_SIZE_CLASS_TONS = [
  0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5,
] as const; // HVAC reviewer to confirm

/** EU nominal cooling kW → marketed BTU label. Built and tested, not routed. */
export const EU_SIZE_CLASSES = [
  { kw: 2.5, marketedBtu: 9_000 },
  { kw: 3.5, marketedBtu: 12_000 },
  { kw: 5.0, marketedBtu: 18_000 },
  { kw: 7.0, marketedBtu: 24_000 },
] as const; // HVAC reviewer to confirm
