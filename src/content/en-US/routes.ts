import type { StaticRouteId } from "@/registry/routes";

import { batch } from "./batch";
import { home } from "./home";
import { methodology } from "./methodology";
import { nameplate } from "./nameplate";
import { about, privacy, terms } from "./site-pages";
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
  nameplate: { ...nameplate.meta, breadcrumb: "Nameplate guide" },
  methodology: { ...methodology.meta, breadcrumb: methodology.h1 },
  about: { ...about.meta, breadcrumb: "About" },
  privacy: { ...privacy.meta, breadcrumb: privacy.h1 },
  terms: { ...terms.meta, breadcrumb: terms.h1 },
};
