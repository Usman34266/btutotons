import { getContent } from "@/content";
import { ROUTES, isPublished, routes, type RouteDef } from "@/registry/routes";

import { routeCopy } from "./metadata";
import type { PageLink } from "./numeric-page";

export type ConversionGroupId = "calculators" | "btu" | "ton" | "unit";

export interface ConversionGroup {
  id: ConversionGroupId;
  heading: string;
  links: PageLink[];
}

const link = (r: RouteDef): PageLink => ({
  href: r.path,
  label: routeCopy(r).h1,
});

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
    {
      id: "unit",
      heading: groups.unit,
      links: published.filter((r) => r.unit).map(link),
    },
  ];
  return all.filter((g) => g.links.length > 0);
}
