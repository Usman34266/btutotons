import type { StaticRouteId } from "@/registry/routes";

import { batch } from "./batch";
import { home } from "./home";
import { tonsToBtu } from "./tons-to-btu";

export interface RouteCopy {
  title: string;
  description: string;
  /** Short name in breadcrumbs. */
  breadcrumb: string;
}

/**
 * Metadata and breadcrumb names for the static routes. Numeric pages build
 * theirs from numericTemplate (lib/numeric-page.ts).
 */
export const routes: Record<StaticRouteId, RouteCopy> = {
  home: { ...home.meta, breadcrumb: "Home" },
  "tons-to-btu": { ...tonsToBtu.meta, breadcrumb: tonsToBtu.h1 },
  batch: { ...batch.meta, breadcrumb: "Batch BTU to Tons" },
};
