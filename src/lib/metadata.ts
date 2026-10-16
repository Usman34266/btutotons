import type { Metadata } from "next";

import { site } from "@/config/site";
import { getContent } from "@/content";
import { routes, type RouteId } from "@/registry/routes";

/** Title, description, self-canonical and Open Graph for a registry route. */
export function pageMetadata(id: RouteId): Metadata {
  const { path } = routes[id];
  const { title, description } = getContent().routes[id];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale.replace("-", "_"),
      type: "website",
    },
  };
}
