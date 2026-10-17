import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { ROUTES, isPublished } from "@/registry/routes";

export const dynamic = "force-static";

/** Every published registry route is canonical, live and 200; redirects and the 404 never are. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.filter(isPublished).map((r) => ({
    url: new URL(r.path, site.url).href,
    ...(site.releaseDate && { lastModified: site.releaseDate }),
  }));
}
