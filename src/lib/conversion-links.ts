import { getContent } from "@/content";
import { ROUTES, isPublished, routes, type RouteDef } from "@/registry/routes";

import { iconOf, type CalculatorIcon } from "./calculator-menu";
import { routeCopy } from "./metadata";
import type { PageLink } from "./numeric-page";

export type ConversionGroupId =
  "calculators" | "btu" | "ton" | "kw" | "mbh" | "time";

export interface ConversionGroup {
  id: ConversionGroupId;
  heading: string;
  links: PageLink[];
}

const link = (r: RouteDef): PageLink => ({
  href: r.path,
  label: routeCopy(r).h1,
});

/** Unit pages split like the header menu (D115). */
const UNIT_GROUP: Record<CalculatorIcon, ConversionGroupId> = {
  tons: "time",
  time: "time",
  list: "calculators",
  kw: "kw",
  watts: "kw",
  mbh: "mbh",
  hp: "mbh",
};

/**
 * Every published conversion page, grouped for the homepage (D106). Unit pages
 * appear once published; empty groups are dropped.
 */
export function conversionGroups(): ConversionGroup[] {
  const { groups } = getContent().home.conversions;
  const published = ROUTES.filter(isPublished);
  const all: ConversionGroup[] = [
    {
      id: "calculators",
      heading: groups.calculators,
      links: [routes["tons-to-btu"], routes.batch].map(link),
    },
    {
      id: "btu",
      heading: groups.btu,
      links: published.filter((r) => r.numeric?.kind === "btu").map(link),
    },
    {
      id: "ton",
      heading: groups.ton,
      links: published.filter((r) => r.numeric?.kind === "ton").map(link),
    },
    ...(["kw", "mbh", "time"] as const).map((id) => ({
      id,
      heading: groups[id],
      links: published
        .filter((r) => r.unit && UNIT_GROUP[iconOf(r)] === id)
        .map(link),
    })),
  ];
  return all.filter((g) => g.links.length > 0);
}
