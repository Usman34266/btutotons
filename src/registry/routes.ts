/**
 * Every live page. Drives metadata, breadcrumbs, internal links, redirects
 * and route tests (later also the sitemap). Adding a page = adding an entry
 * here (or a numeric page in numeric-pages.ts), its copy in content/<locale>/
 * and its app/ folder. A route is listed only once its functionality is live;
 * P1 unit pages also need `published` (D100).
 */
import { PREVIEW_UNPUBLISHED } from "@/config/build";

import { NUMERIC_PAGES, type NumericPage } from "./numeric-pages";
import { UNIT_PAGES, type UnitPage } from "./unit-pages";

export type StaticRouteId =
  | "home"
  | "tons-to-btu"
  | "batch"
  | "nameplate"
  | "methodology"
  | "about"
  | "privacy"
  | "terms";
export type RouteId = StaticRouteId | `n:${string}` | `u:${string}`;

interface BaseRoute {
  path: "/" | `/${string}/`;
  /** Breadcrumb parent. Only the home page has none. */
  parent?: RouteId;
}

export type RouteDef =
  | (BaseRoute & { id: StaticRouteId; numeric?: undefined; unit?: undefined })
  /** A [slug] numeric page. */
  | (BaseRoute & {
      id: `n:${string}`;
      numeric: NumericPage;
      unit?: undefined;
    })
  /** A [slug] unit-pair page (P1). */
  | (BaseRoute & { id: `u:${string}`; unit: UnitPage; numeric?: undefined });

const STATIC_ROUTES = {
  home: { id: "home", path: "/" },
  "tons-to-btu": { id: "tons-to-btu", path: "/tons-to-btu/", parent: "home" },
  batch: { id: "batch", path: "/batch-btu-to-tons/", parent: "home" },
  nameplate: {
    id: "nameplate",
    path: "/ac-tonnage-by-model-number/",
    parent: "home",
  },
  methodology: { id: "methodology", path: "/methodology/", parent: "home" },
  about: { id: "about", path: "/about/", parent: "home" },
  privacy: { id: "privacy", path: "/privacy/", parent: "home" },
  terms: { id: "terms", path: "/terms/", parent: "home" },
} as const satisfies Record<StaticRouteId, RouteDef>;

export const numericRouteId = (page: NumericPage) => `n:${page.slug}` as const;
export const unitRouteId = (page: UnitPage) => `u:${page.slug}` as const;

/** Unpublished P1 pages are exported only by the preview build (D100). */
const EXPORTED_UNIT_PAGES = UNIT_PAGES.filter(
  (p) => p.published || PREVIEW_UNPUBLISHED,
);

/** Every exported route. */
export const ROUTES: readonly RouteDef[] = [
  ...Object.values(STATIC_ROUTES),
  ...NUMERIC_PAGES.map((page): RouteDef => ({
    id: numericRouteId(page),
    path: `/${page.slug}/`,
    parent: "home",
    numeric: page,
  })),
  ...EXPORTED_UNIT_PAGES.map((page): RouteDef => ({
    id: unitRouteId(page),
    path: `/${page.slug}/`,
    parent: "home",
    unit: page,
  })),
];

/** False only for an unpublished P1 page in a preview build: noindex, no sitemap. */
export const isPublished = (r: RouteDef): boolean =>
  !r.unit || r.unit.published;

const BY_ID = new Map(ROUTES.map((r) => [r.id, r]));

/** The exported route for a unit page, if this build has one. */
export const exportedUnitRoute = (page: UnitPage): RouteDef | undefined =>
  BY_ID.get(unitRouteId(page));

/** Routes rendered by the `[slug]` template: numeric pages and exported unit pages. */
export const SLUG_ROUTES = ROUTES.filter((r) => r.numeric || r.unit);

export const slugRoute = (slug: string): RouteDef | undefined =>
  SLUG_ROUTES.find((r) => (r.numeric ?? r.unit)?.slug === slug);

export function route(id: RouteId): RouteDef {
  const r = BY_ID.get(id);
  if (!r) throw new Error(`Unknown route: ${id}`);
  return r;
}

/** Static routes by name, for links in components. */
export const routes = STATIC_ROUTES;

/** Home first, the page itself last. */
export function breadcrumbTrail(id: RouteId): RouteDef[] {
  const trail: RouteDef[] = [];
  for (let r: RouteDef | undefined = route(id); r;) {
    trail.unshift(r);
    r = r.parent ? route(r.parent) : undefined;
  }
  return trail;
}

/** Homepage anchors: compare has no URL of its own at launch (spec p. 10). */
export const COMPARE_ANCHOR = "compare";
export const CHART_ANCHOR = "chart";
