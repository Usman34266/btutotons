/**
 * Every live page. Drives metadata, breadcrumbs and route tests (later also
 * the sitemap and internal links). Adding a page = adding an entry here, its
 * copy in content/<locale>/routes.ts and its app/ folder.
 * A route is listed only once its functionality is live.
 */
export type RouteId = "home" | "batch";

export interface RouteDef {
  id: RouteId;
  path: "/" | `/${string}/`;
  /** Breadcrumb parent. Only the home page has none. */
  parent?: RouteId;
}

export const routes = {
  home: { id: "home", path: "/" },
  batch: { id: "batch", path: "/batch-btu-to-tons/", parent: "home" },
} as const satisfies Record<RouteId, RouteDef>;

export const ROUTE_IDS = Object.keys(routes) as RouteId[];

/** Compare has no URL of its own at launch: it is /#compare (spec p. 10). */
export const COMPARE_ANCHOR = "compare";

/** Home first, the page itself last. */
export function breadcrumbTrail(id: RouteId): RouteDef[] {
  const trail: RouteDef[] = [];
  for (let r: RouteDef | undefined = routes[id]; r;) {
    trail.unshift(r);
    r = r.parent ? routes[r.parent] : undefined;
  }
  return trail;
}
