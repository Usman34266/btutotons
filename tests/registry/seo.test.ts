import { describe, expect, it } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { jsonLdText, structuredData } from "@/lib/structured-data";
import { redirects } from "@/registry/redirects";
import { ROUTES, isPublished } from "@/registry/routes";

const graphOf = (id: Parameters<typeof structuredData>[0]) =>
  structuredData(id)["@graph"] as Record<string, unknown>[];
const ofType = (graph: Record<string, unknown>[], type: string) =>
  graph.find((n) => n["@type"] === type);

describe("sitemap", () => {
  it("lists every published route once, absolute with a trailing slash", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toHaveLength(ROUTES.filter(isPublished).length);
    expect(new Set(urls).size).toBe(urls.length);
    for (const u of urls)
      expect(u).toMatch(/^https:\/\/btutotons\.com\/(.+\/)?$/);
  });

  it("leaves out the embed page, and contact until it has an address (D106)", () => {
    const paths = sitemap().map((e) => new URL(e.url).pathname);
    expect(paths).not.toContain("/embed/");
    expect(paths).not.toContain("/contact/");
    expect(paths).toHaveLength(28);
  });

  it("never lists a redirect source", () => {
    const paths = new Set(sitemap().map((e) => new URL(e.url).pathname));
    for (const r of redirects) expect(paths.has(r.from)).toBe(false);
  });

  it("has no lastModified until a release date exists", () => {
    for (const e of sitemap()) expect(e.lastModified).toBeUndefined();
  });
});

describe("robots", () => {
  it("allows all and points to the sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://btutotons.com/sitemap.xml",
    });
  });
});

describe("structured data", () => {
  it("has the organization without a logo while none exists", () => {
    const org = ofType(graphOf("home"), "Organization");
    expect(org).toMatchObject({
      name: "BTU to Tons",
      url: "https://btutotons.com/",
    });
    expect(org).not.toHaveProperty("logo");
  });

  it("describes the page with its own title, description and URL", () => {
    const page = ofType(graphOf("n:24000-btu-to-tons"), "WebPage");
    expect(page).toMatchObject({
      url: "https://btutotons.com/24000-btu-to-tons/",
      name: "24,000 BTU to Tons = 2 [Formula + Chart]",
      inLanguage: "en-US",
    });
  });

  it("adds a breadcrumb list below the homepage only", () => {
    expect(ofType(graphOf("home"), "BreadcrumbList")).toBeUndefined();
    const list = ofType(graphOf("nameplate"), "BreadcrumbList");
    expect(list?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://btutotons.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Nameplate guide",
        item: "https://btutotons.com/ac-tonnage-by-model-number/",
      },
    ]);
  });

  it("never claims ratings or FAQ rich results", () => {
    for (const r of ROUTES) {
      const text = JSON.stringify(structuredData(r.id));
      expect(text).not.toMatch(/aggregateRating|"Review"|FAQPage/);
    }
  });

  it("escapes < so the script element can't be closed early", () => {
    expect(jsonLdText({ a: "</script>" })).toBe('{"a":"\\u003c/script>"}');
  });
});
