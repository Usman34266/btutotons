/**
 * Every live page. Drives metadata, breadcrumbs, internal links, redirects
 * and route tests (later also the sitemap). Adding a page = adding an entry
 * here (or a numeric page in numeric-pages.ts), its copy in content/<locale>/
 * and its app/ folder. A route is listed only once its functionality is live.
 */
import { NUMERIC_PAGES, type NumericPage } from "./numeric-pages";

export type StaticRouteId = "home" | "tons-to-btu" | "batch";
export type RouteId = StaticRouteId | `n:${string}`;

interface BaseRoute {
  path: "/" | `/${string}/`;
  /** Breadcrumb parent. Only the home page has none. */
  parent?: RouteId;
}

export type RouteDef =
  | (BaseRoute & { id: StaticRouteId; numeric?: undefined })
  /** A [slug] numeric page. */
  | (BaseRoute & { id: `n:${string}`; numeric: NumericPage });

const STATIC_ROUTES = {
  home: { id: "home", path: "/" },
  "tons-to-btu": { id: "tons-to-btu", path: "/tons-to-btu/", parent: "home" },
  batch: { id: "batch", path: "/batch-btu-to-tons/", parent: "home" },
} as const satisfies Record<StaticRouteId, RouteDef>;

export const numericRouteId = (page: NumericPage) => `n:${page.slug}` as const;

export const ROUTES: readonly RouteDef[] = [
  ...Object.values(STATIC_ROUTES),
  ...NUMERIC_PAGES.map((page): RouteDef => ({
    id: numericRouteId(page),
    path: `/${page.slug}/`,
    parent: "home",
    numeric: page,
  })),
];

const BY_ID = new Map(ROUTES.map((r) => [r.id, r]));

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
