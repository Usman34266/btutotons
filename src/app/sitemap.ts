import type { MetadataRoute } from "next";

import { site } from "@/config/site";
import { ROUTES } from "@/registry/routes";

export const dynamic = "force-static";

/** Every registry route is canonical, live and 200; redirects and the 404 never are. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((r) => ({
    url: new URL(r.path, site.url).href,
    ...(site.releaseDate && { lastModified: site.releaseDate }),
  }));
}
