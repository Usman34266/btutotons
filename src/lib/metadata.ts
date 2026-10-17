import type { Metadata } from "next";

import { site } from "@/config/site";
import { getContent, type RouteCopy } from "@/content";
import {
  isPublished,
  route,
  type RouteDef,
  type RouteId,
} from "@/registry/routes";

import { numericPageModel } from "./numeric-page";
import { unitPageModel } from "./unit-page";

/** Title, description and breadcrumb name for any registry route. */
export const routeCopy = (r: RouteDef): RouteCopy =>
  r.numeric
    ? numericPageModel(r.numeric).meta
    : r.unit
      ? unitPageModel(r.unit).meta
      : getContent().routes[r.id];

/** Title, description, self-canonical and Open Graph for a registry route. */
export function pageMetadata(id: RouteId): Metadata {
  const r = route(id);
  const { title, description } = routeCopy(r);
  return {
    title,
    description,
    ...(!isPublished(r) && { robots: { index: false, follow: false } }),
    alternates: { canonical: r.path },
    openGraph: {
      title,
      description,
      url: r.path,
      siteName: site.name,
      locale: site.locale.replace("-", "_"),
      type: "website",
    },
  };
}
