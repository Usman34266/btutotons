import type { UnitPair } from "@/components/converter/use-converter-state";
import { getContent, type RouteCopy, type UnitFacts } from "@/content";
import {
  DEFAULT_PRECISION,
  J_PER_BTU,
  UNITS,
  W_PER_BTUH,
  W_PER_HP,
  capacity,
  convertCapacity,
  formatConstant,
  formatInputValue,
  formatNumber,
  hpToBtuh,
  tonsToKw,
  wattsToBtuh,
  type CapacityUnitId,
} from "@/engine";
import { NUMERIC_PAGES } from "@/registry/numeric-pages";
import { UNIT_PAGES, type UnitPage } from "@/registry/unit-pages";
import { exportedUnitRoute, routes } from "@/registry/routes";

import { capacityRowOf, type CapacityRow } from "./capacity-rows";
import { numericPageModel, type PageLink } from "./numeric-page";
import { plural } from "./pluralize";
import { pairSentence } from "./unit-pair";

type Column = "btuh" | "tons" | "coolingKw";

export interface UnitPageModel {
  page: UnitPage;
  meta: RouteCopy;
  h1: string;
  opening: string;
  sections: {
    id: string;
    heading: string;
    paragraphs: readonly string[];
    example?: true;
    table?: true;
  }[];
  example: { sentence: string; equation: string };
  table: {
    lead: Column;
    caption: string;
    rows: { key: string; cells: CapacityRow; link: PageLink | null }[];
  } | null;
  links: PageLink[];
  pair: UnitPair;
  field?: { label: string; hint: string };
}

const COLUMN: Partial<Record<CapacityUnitId, Column>> = {
  btuh: "btuh",
  tr: "tons",
  kw: "coolingKw",
};

const facts = (): UnitFacts => ({
  kwPerTon: formatNumber(convertCapacity(capacity(1, "tr")).coolingKw, {
    precision: 6,
  }),
  wPerBtuh: formatConstant(W_PER_BTUH),
  jPerBtu: formatConstant(J_PER_BTU),
  btuhPerKw: formatNumber(convertCapacity(capacity(1, "kw")).btuh, {
    precision: 6,
  }),
  btuhPerW: formatNumber(wattsToBtuh(1), { precision: 6 }),
  wPerHp: formatConstant(W_PER_HP),
  btuhPerHp: formatNumber(hpToBtuh(1), { precision: 2 }),
  kwFor3Tons: formatNumber(tonsToKw(3), { precision: 2 }),
});

const headingId = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/** A ton row links to its numeric page when one exists. */
function rowLink(value: number, unit: CapacityUnitId): PageLink | null {
  const page =
    unit === "tr" &&
    NUMERIC_PAGES.find((p) => p.kind === "ton" && p.value === value);
  return page
    ? { href: `/${page.slug}/`, label: numericPageModel(page).h1 }
    : null;
}

/** The unit after a worked equation: "ton"/"tons" as on the numeric pages, else the unit's name. */
function resultUnit(value: number, unit: CapacityUnitId): string {
  const shown = formatNumber(value, { precision: DEFAULT_PRECISION });
  return unit === "tr"
    ? getContent().numericTemplate.btu.resultUnit(shown)
    : plural(shown, UNITS[unit].singular, UNITS[unit].plural);
}

export const unitPageBySlug = (slug: string) =>
  UNIT_PAGES.find((p) => p.slug === slug);

export function unitPageModel(page: UnitPage): UnitPageModel {
  const { unitPages, routes: routeCopies } = getContent();
  const copy = unitPages[page.slug];
  const f = facts();
  const example = convertCapacity(capacity(page.example, page.from), {
    to: page.to,
  });
  const lead = COLUMN[page.from];
  const tableSection = copy.sections.find((s) => s.table);
  const inverse =
    page.inverse && UNIT_PAGES.find((p) => p.slug === page.inverse);
  const inverseRoute = inverse && exportedUnitRoute(inverse);

  return {
    page,
    meta: { ...copy.meta, breadcrumb: copy.h1, h1: copy.h1 },
    h1: copy.h1,
    opening: copy.opening,
    sections: copy.sections.map((s) => ({
      id: headingId(s.heading),
      heading: s.heading,
      paragraphs: s.body(f),
      ...(s.example && { example: true as const }),
      ...(s.table && { table: true as const }),
    })),
    example: {
      sentence: pairSentence(example, DEFAULT_PRECISION),
      equation: `${example.equation} ${resultUnit(example.output.value, page.to)}`,
    },
    table:
      page.table && lead && tableSection
        ? {
            lead,
            caption: tableSection.heading,
            rows: page.table.map((value) => ({
              key: formatInputValue(value),
              cells: capacityRowOf(capacity(value, page.from)),
              link: rowLink(value, page.from),
            })),
          }
        : null,
    links: [
      { href: routes.home.path, label: routeCopies.home.h1 },
      ...(inverse && inverseRoute
        ? [{ href: inverseRoute.path, label: unitPages[inverse.slug].h1 }]
        : []),
    ],
    pair: { from: page.from, to: page.to },
    ...(copy.field && { field: copy.field }),
  };
}
