/**
 * The 20 curated numeric shortcut pages (spec pp. 20–23, build prompt §10.3).
 * Data only: one [slug] template and one copy builder render them all.
 * Other values stay converter states; never mass-publish permutations.
 */
import { numberSlug } from "@/lib/slug";

/** BTU/hr → tons pages, ascending. Also the reference chart rows (spec p. 18). */
export const BTU_PAGE_VALUES = [
  6_000, 8_000, 9_000, 10_000, 12_000, 18_000, 24_000, 30_000, 36_000, 42_000,
  48_000, 60_000,
] as const;

/** Tons → BTU/hr pages, ascending. */
export const TON_PAGE_VALUES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 5] as const;

export interface NumericPage {
  kind: "btu" | "ton";
  /** BTU/hr for "btu" pages, refrigeration tons for "ton" pages. */
  value: number;
  slug: string;
}

export const btuPageSlug = (btuh: number) => `${numberSlug(btuh)}-btu-to-tons`;
export const tonPageSlug = (tons: number) => `${numberSlug(tons)}-ton-to-btu`;

export const NUMERIC_PAGES: readonly NumericPage[] = [
  ...BTU_PAGE_VALUES.map((value) => ({
    kind: "btu" as const,
    value,
    slug: btuPageSlug(value),
  })),
  ...TON_PAGE_VALUES.map((value) => ({
    kind: "ton" as const,
    value,
    slug: tonPageSlug(value),
  })),
];

/** Pages of the same kind, in order. */
const siblings = (page: NumericPage) =>
  NUMERIC_PAGES.filter((p) => p.kind === page.kind);

/**
 * The two capacities to compare with: one below and one above. At either
 * end of the list, the two nearest on the one side.
 */
export function neighbours(page: NumericPage): [NumericPage, NumericPage] {
  const list = siblings(page);
  const i = list.findIndex((p) => p.slug === page.slug);
  const start = Math.min(Math.max(i - 1, 0), list.length - 3);
  const pair = list.slice(start, start + 3).filter((p) => p.slug !== page.slug);
  // Each list has at least three pages, so the pair is always complete.
  return [pair[0]!, pair[1]!];
}
