import type { StaticRouteId } from "@/registry/routes";

import { batch } from "./batch";
import { home } from "./home";
import { methodology } from "./methodology";
import { nameplate } from "./nameplate";
import { about, contact, embedPage, privacy, terms } from "./site-pages";
import { tonsToBtu } from "./tons-to-btu";

export interface RouteCopy {
  title: string;
  description: string;
  /** Short name in breadcrumbs. */
  breadcrumb: string;
  h1: string;
}

/**
 * Metadata and breadcrumb names for the static routes. Numeric pages build
 * theirs from numericTemplate (lib/numeric-page.ts).
 */
export const routes: Record<StaticRouteId, RouteCopy> = {
  home: { ...home.meta, breadcrumb: "Home", h1: home.h1 },
  "tons-to-btu": {
    ...tonsToBtu.meta,
    breadcrumb: tonsToBtu.h1,
    h1: tonsToBtu.h1,
  },
  batch: { ...batch.meta, breadcrumb: "Batch BTU to Tons", h1: batch.h1 },
  nameplate: {
    ...nameplate.meta,
    breadcrumb: "Nameplate guide",
    h1: nameplate.h1,
  },
  methodology: {
    ...methodology.meta,
    breadcrumb: methodology.h1,
    h1: methodology.h1,
  },
  about: { ...about.meta, breadcrumb: "About", h1: about.h1 },
  privacy: { ...privacy.meta, breadcrumb: privacy.h1, h1: privacy.h1 },
  terms: { ...terms.meta, breadcrumb: terms.h1, h1: terms.h1 },
  contact: { ...contact.meta, breadcrumb: contact.h1, h1: contact.h1 },
  embed: { ...embedPage.meta, breadcrumb: embedPage.h1, h1: embedPage.h1 },
};
