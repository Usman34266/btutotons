/**
 * Unit-pair converter pages (build prompt §16 M8; spec pp. 24–25). Each has a
 * fixed input and output unit. P1: `published` stays false until the
 * independent HVAC review is recorded in docs/DECISIONS.md (D100); all six
 * are published (D108).
 */
import type { CapacityUnitId } from "@/engine";

import { US_SIZE_CLASS_TONS } from "./size-classes";

export type UnitPageSlug =
  | "kw-to-tons"
  | "tons-to-kw"
  | "btu-to-kw"
  | "kw-to-btu"
  | "btu-per-minute-to-tons"
  | "btu-per-second-to-tons"
  | "mbh-to-btu"
  | "btu-to-mbh"
  | "watts-to-btu"
  | "btu-to-watts"
  | "btu-per-second-to-watts"
  | "watts-to-btu-per-second"
  | "btu-to-hp"
  | "hp-to-btu";

export interface UnitPage {
  slug: UnitPageSlug;
  from: CapacityUnitId;
  to: CapacityUnitId;
  published: boolean;
  /** The reverse page, linked when it is exported too. */
  inverse?: UnitPageSlug;
  /** Input of the worked example. */
  example: number;
  /** Buttons that fill the calculator (SEO plan presets, D113). */
  presets?: readonly number[];
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
    published: true,
    inverse: "tons-to-kw",
    example: 3.5,
    aliases: ["/kw-to-ton/"],
  },
  {
    slug: "tons-to-kw",
    from: "tr",
    to: "kw",
    published: true,
    inverse: "kw-to-tons",
    example: 2,
    presets: [1, 2, 3, 4, 5],
    table: US_SIZE_CLASS_TONS,
    aliases: ["/ton-to-kw/"],
  },
  {
    slug: "btu-to-kw",
    from: "btuh",
    to: "kw",
    published: true,
    inverse: "kw-to-btu",
    example: 24_000,
    presets: [9_000, 12_000, 18_000, 24_000],
    aliases: [],
  },
  {
    slug: "kw-to-btu",
    from: "kw",
    to: "btuh",
    published: true,
    inverse: "btu-to-kw",
    example: 3.5,
    table: [1, 2.5, 3.5, 5, 7, 10],
    aliases: [],
  },
  {
    slug: "btu-per-minute-to-tons",
    from: "btumin",
    to: "tr",
    published: true,
    example: 200,
    aliases: ["/btu-per-minute-to-ton/"],
  },
  {
    slug: "btu-per-second-to-tons",
    from: "btus",
    to: "tr",
    published: true,
    example: 10,
    aliases: ["/btu-per-second-to-ton/"],
  },
  // SEO plan and btutowatts-inspired pages (D112), published after the HVAC review (D114).
  {
    slug: "mbh-to-btu",
    from: "kbtuh",
    to: "btuh",
    published: true,
    inverse: "btu-to-mbh",
    example: 36,
    presets: [24, 36, 48, 60],
    aliases: [],
  },
  {
    slug: "btu-to-mbh",
    from: "btuh",
    to: "kbtuh",
    published: true,
    inverse: "mbh-to-btu",
    example: 60_000,
    aliases: [],
  },
  {
    slug: "watts-to-btu",
    from: "w",
    to: "btuh",
    published: true,
    inverse: "btu-to-watts",
    example: 1_000,
    presets: [500, 1_000, 2_000, 3_500],
    aliases: ["/watt-to-btu/"],
  },
  {
    slug: "btu-to-watts",
    from: "btuh",
    to: "w",
    published: true,
    inverse: "watts-to-btu",
    example: 12_000,
    presets: [9_000, 12_000, 18_000, 24_000],
    aliases: ["/btu-to-watt/"],
  },
  {
    slug: "btu-per-second-to-watts",
    from: "btus",
    to: "w",
    published: true,
    inverse: "watts-to-btu-per-second",
    example: 1,
    aliases: ["/btu-per-second-to-watt/"],
  },
  {
    slug: "watts-to-btu-per-second",
    from: "w",
    to: "btus",
    published: true,
    inverse: "btu-per-second-to-watts",
    example: 1_000,
    aliases: ["/watt-to-btu-per-second/"],
  },
  {
    slug: "btu-to-hp",
    from: "btuh",
    to: "hp",
    published: true,
    inverse: "hp-to-btu",
    example: 12_000,
    aliases: ["/btu-to-horsepower/"],
  },
  {
    slug: "hp-to-btu",
    from: "hp",
    to: "btuh",
    published: true,
    inverse: "btu-to-hp",
    example: 1,
    aliases: ["/horsepower-to-btu/"],
  },
];
