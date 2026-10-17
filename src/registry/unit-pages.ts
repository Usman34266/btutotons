/**
 * Unit-pair converter pages (build prompt §16 M8; spec pp. 24–25). Each has a
 * fixed input and output unit. P1: `published` stays false until the
 * independent HVAC review is recorded in docs/DECISIONS.md (D100).
 */
import type { CapacityUnitId } from "@/engine";

import { US_SIZE_CLASS_TONS } from "./size-classes";

export type UnitPageSlug =
  | "kw-to-tons"
  | "tons-to-kw"
  | "btu-to-kw"
  | "kw-to-btu"
  | "btu-per-minute-to-tons"
  | "btu-per-second-to-tons";

export interface UnitPage {
  slug: UnitPageSlug;
  from: CapacityUnitId;
  to: CapacityUnitId;
  published: boolean;
  /** The reverse page, linked when it is exported too. */
  inverse?: UnitPageSlug;
  /** Input of the worked example. */
  example: number;
  /** Inputs for the page's table of common values, if it has one. */
  table?: readonly number[];
  /** Singular spellings that 301 here once published (spec p. 19). */
  aliases: readonly `/${string}/`[];
}

export const UNIT_PAGES: readonly UnitPage[] = [
  {
    slug: "kw-to-tons",
    from: "kw",
    to: "tr",
    published: false,
    inverse: "tons-to-kw",
    example: 3.5,
    aliases: ["/kw-to-ton/"],
  },
  {
    slug: "tons-to-kw",
    from: "tr",
    to: "kw",
    published: false,
    inverse: "kw-to-tons",
    example: 2,
    table: US_SIZE_CLASS_TONS,
    aliases: ["/ton-to-kw/"],
  },
  {
    slug: "btu-to-kw",
    from: "btuh",
    to: "kw",
    published: false,
    inverse: "kw-to-btu",
    example: 24_000,
    aliases: [],
  },
  {
    slug: "kw-to-btu",
    from: "kw",
    to: "btuh",
    published: false,
    inverse: "btu-to-kw",
    example: 3.5,
    table: [1, 2.5, 3.5, 5, 7, 10],
    aliases: [],
  },
  {
    slug: "btu-per-minute-to-tons",
    from: "btumin",
    to: "tr",
    published: false,
    example: 200,
    aliases: ["/btu-per-minute-to-ton/"],
  },
  {
    slug: "btu-per-second-to-tons",
    from: "btus",
    to: "tr",
    published: false,
    example: 10,
    aliases: ["/btu-per-second-to-ton/"],
  },
];
