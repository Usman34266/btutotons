import type { ConverterInitial } from "@/components/converter/use-converter-state";
import {
  getContent,
  type AnswerSize,
  type RouteCopy,
  type Segment,
} from "@/content";
import {
  capacity,
  convertCapacity,
  formatInputValue,
  formatNumber,
  isDisplayRounded,
  type ConversionResult,
  type SizeClassResult,
} from "@/engine";
import {
  NUMERIC_PAGES,
  neighbours,
  type NumericPage,
} from "@/registry/numeric-pages";
import { routes } from "@/registry/routes";

import { capacityRow, type CapacityRow } from "./capacity-rows";

export interface PageLink {
  href: `/${string}/` | "/";
  label: string;
}

export interface ComparisonRow extends CapacityRow {
  slug: string;
  /** Neighbouring pages link; the page's own row does not. */
  link: PageLink | null;
}

export interface NumericPageModel {
  page: NumericPage;
  meta: RouteCopy;
  h1: string;
  answer: Segment[];
  converterInitial: ConverterInitial;
  method: string;
  /** "24,000 ÷ 12,000 = 2 tons" */
  equation: string;
  coolingKw: string;
  compareHeading: string;
  /** Three rows, ascending. */
  rows: ComparisonRow[];
  fitsHeading: string;
  links: PageLink[];
}

const pagePath = (page: NumericPage) => `/${page.slug}/` as const;

const resultOf = (page: NumericPage): ConversionResult =>
  convertCapacity(capacity(page.value, page.kind === "btu" ? "btuh" : "tr"));

/** "24,000" for a BTU page, "1.5" for a ton page: the number as searched. */
const pageNumber = (page: NumericPage) => formatInputValue(page.value);

export function numericH1(page: NumericPage): string {
  const copy = getContent().numericTemplate;
  return page.kind === "btu"
    ? copy.btu.h1(pageNumber(page))
    : copy.ton.h1(pageNumber(page));
}

function answerSize(sizeClass: SizeClassResult): AnswerSize {
  switch (sizeClass.type) {
    case "class":
      return { type: "class", cls: formatInputValue(sizeClass.sizeClass.tons) };
    case "between":
      return {
        type: "between",
        lower: formatInputValue(sizeClass.lower.tons),
        upper: formatInputValue(sizeClass.upper.tons),
      };
    case "outside":
      return { type: "outside" };
  }
}

/** The same capacity read the other way, or the reverse calculator. */
function reverseLink(page: NumericPage, result: ConversionResult): PageLink {
  const target = NUMERIC_PAGES.find((p) =>
    page.kind === "btu"
      ? p.kind === "ton" && p.value === result.tons
      : p.kind === "btu" && p.value === result.btuh,
  );
  if (target) return { href: pagePath(target), label: numericH1(target) };
  return page.kind === "btu"
    ? {
        href: routes["tons-to-btu"].path,
        label: getContent().numericTemplate.links.reverseHub,
      }
    : {
        href: routes.home.path,
        label: getContent().numericTemplate.links.home,
      };
}

/** Everything a numeric page shows. Numbers come from the engine. */
export function numericPageModel(page: NumericPage): NumericPageModel {
  const copy = getContent().numericTemplate;
  const result = resultOf(page);
  const n = pageNumber(page);
  const tons = formatNumber(result.tons);
  const btuh = formatNumber(result.btuh);
  const isBtu = page.kind === "btu";
  const kind = isBtu ? copy.btu : copy.ton;

  const pair = neighbours(page);
  const [lower, upper] = pair.map(pageNumber) as [string, string];
  const rows = NUMERIC_PAGES.filter((p) => p === page || pair.includes(p)).map(
    (p): ComparisonRow => ({
      ...capacityRow(resultOf(p)),
      slug: p.slug,
      link:
        p.slug === page.slug
          ? null
          : { href: pagePath(p), label: numericH1(p) },
    }),
  );

  const h1 = numericH1(page);
  const meta: RouteCopy = isBtu
    ? {
        title: copy.btu.title(n, tons),
        description: copy.btu.description(n, tons),
        breadcrumb: h1,
        h1,
      }
    : {
        title: copy.ton.title(n, btuh),
        description: copy.ton.description(n, btuh),
        breadcrumb: h1,
        h1,
      };

  const home = { href: routes.home.path, label: copy.links.home } as const;
  const reverse = reverseLink(page, result);

  return {
    page,
    meta,
    h1,
    answer: isBtu
      ? copy.btu.answer(
          n,
          tons,
          isDisplayRounded(result.tons),
          answerSize(result.sizeClass),
        )
      : copy.ton.answer(n, btuh),
    converterInitial: isBtu
      ? { direction: "to-tons", unit: "btuh", value: page.value }
      : { direction: "to-btuh", value: page.value },
    method: kind.method(n),
    equation: `${result.equation} ${isBtu ? copy.btu.resultUnit(tons) : copy.ton.resultUnit()}`,
    coolingKw: copy.coolingKw(formatNumber(result.coolingKw)),
    compareHeading: kind.compareHeading(n, lower, upper),
    rows,
    fitsHeading: copy.fits.heading(tons),
    links: [
      home,
      ...(reverse.href === home.href ? [] : [reverse]),
      ...pair.map((p) => ({ href: pagePath(p), label: numericH1(p) })),
    ],
  };
}

export const numericPageBySlug = (slug: string) =>
  NUMERIC_PAGES.find((p) => p.slug === slug);
