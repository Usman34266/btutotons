import { site } from "@/config/site";
import { breadcrumbTrail, route, type RouteId } from "@/registry/routes";

import { routeCopy } from "./metadata";

const abs = (path: string) => new URL(path, site.url).href;

/**
 * schema.org graph for a page (build prompt §11): Organization, WebSite,
 * WebPage and, below the homepage, BreadcrumbList. The logo appears only once
 * site.logo is set. No ratings, no FAQPage.
 */
export function structuredData(id: RouteId) {
  const r = route(id);
  const url = abs(r.path);
  const home = abs("/");
  const copy = routeCopy(r);
  const trail = breadcrumbTrail(id);
  const org = `${home}#organization`;
  const website = `${home}#website`;
  const breadcrumb = `${url}#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": org,
        name: site.name,
        url: home,
        ...(site.logo && { logo: abs(site.logo) }),
      },
      {
        "@type": "WebSite",
        "@id": website,
        name: site.name,
        url: home,
        inLanguage: site.locale,
        publisher: { "@id": org },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: copy.title,
        description: copy.description,
        inLanguage: site.locale,
        isPartOf: { "@id": website },
        ...(trail.length > 1 && { breadcrumb: { "@id": breadcrumb } }),
      },
      ...(trail.length > 1
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": breadcrumb,
              itemListElement: trail.map((t, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: routeCopy(t).breadcrumb,
                item: abs(t.path),
              })),
            },
          ]
        : []),
    ],
  };
}

/** JSON for a <script> element: "<" is escaped so the data can't close the tag. */
export const jsonLdText = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
