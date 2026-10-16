import type { RouteId } from "@/registry/routes";

import { batch } from "./batch";
import { home } from "./home";

export interface RouteCopy {
  title: string;
  description: string;
  /** Short name in breadcrumbs. */
  breadcrumb: string;
}

/** Metadata and breadcrumb names for every route in the registry. */
export const routes: Record<RouteId, RouteCopy> = {
  home: { ...home.meta, breadcrumb: "Home" },
  batch: { ...batch.meta, breadcrumb: "Batch BTU to Tons" },
};
