import { getContent } from "@/content";
import type { CapacityUnitId } from "@/engine";
import { ROUTES, isPublished, routes, type RouteDef } from "@/registry/routes";

import { routeCopy } from "./metadata";

/** Picks the nav icon; the component maps it to a glyph (D115). */
export type CalculatorIcon =
  "tons" | "time" | "list" | "kw" | "watts" | "mbh" | "hp";

export interface CalculatorLink {
  href: string;
  label: string;
  icon: CalculatorIcon;
}

export interface CalculatorGroup {
  id: "tons" | "kw" | "other";
  heading: string;
  links: CalculatorLink[];
}

const GROUP: Record<CalculatorIcon, CalculatorGroup["id"]> = {
  tons: "tons",
  time: "tons",
  list: "tons",
  kw: "kw",
  watts: "kw",
  mbh: "other",
  hp: "other",
};

/** The pair's most specific unit wins: hp, MBH, watts, kW, time units, then tons. */
function iconOf(r: RouteDef): CalculatorIcon {
  if (r.id === routes.batch.id) return "list";
  const units: CapacityUnitId[] = r.unit ? [r.unit.from, r.unit.to] : [];
  if (units.includes("hp")) return "hp";
  if (units.includes("kbtuh")) return "mbh";
  if (units.includes("w")) return "watts";
  if (units.includes("kw")) return "kw";
  if (units.includes("btumin") || units.includes("btus")) return "time";
  return "tons";
}

/** "BTU/hr to kW Calculator" → "BTU/hr to kW". */
const label = (r: RouteDef) =>
  routeCopy(r).h1.replace(/\s+(Calculator|Converter)$/, "");

/** Every calculator in the header menu: the core tools, then published unit pages. */
export function calculatorGroups(): CalculatorGroup[] {
  const { menuGroups } = getContent().common.nav;
  const pages = [
    routes.home,
    routes["tons-to-btu"],
    routes.batch,
    ...ROUTES.filter((r) => r.unit && isPublished(r)),
  ];
  const groups: CalculatorGroup[] = (["tons", "kw", "other"] as const).map(
    (id) => ({ id, heading: menuGroups[id], links: [] }),
  );
  for (const r of pages) {
    const icon = iconOf(r);
    groups
      .find((g) => g.id === GROUP[icon])!
      .links.push({ href: r.path, label: label(r), icon });
  }
  return groups.filter((g) => g.links.length > 0);
}
