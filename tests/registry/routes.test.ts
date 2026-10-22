import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { site } from "@/config/site";
import { redirects } from "@/registry/redirects";
import { ROUTES, breadcrumbTrail, isPublished, route } from "@/registry/routes";

const appDir = resolve(import.meta.dirname, "../../src/app");

/** Numeric and unit routes render from the one [slug] template. */
const pageFile = (r: (typeof ROUTES)[number]) =>
  r.numeric || r.unit
    ? resolve(appDir, "[slug]/page.tsx")
    : resolve(appDir, `.${r.path}page.tsx`);

describe("route registry", () => {
  it("has 10 static routes, 20 numeric pages and 13 unit pages", () => {
    expect(ROUTES.filter((r) => !r.numeric && !r.unit)).toHaveLength(10);
    expect(ROUTES.filter((r) => r.unit)).toHaveLength(13);
    expect(ROUTES.filter((r) => r.numeric?.kind === "btu")).toHaveLength(12);
    expect(ROUTES.filter((r) => r.numeric?.kind === "ton")).toHaveLength(8);
  });

  it("looks routes up by id", () => {
    for (const r of ROUTES) expect(route(r.id)).toBe(r);
    expect(() => route("n:nope")).toThrow();
  });

  it("has unique ids and paths with trailing slashes", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(ROUTES.map((r) => r.id)).size).toBe(ROUTES.length);
    for (const p of paths) expect(p).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it("has a page file for every route", () => {
    for (const r of ROUTES) expect(existsSync(pageFile(r))).toBe(true);
  });

  it("never lists a path that redirects", () => {
    const sources = new Set<string>(redirects.map((r) => r.from));
    for (const r of ROUTES) expect(sources.has(r.path)).toBe(false);
  });

  it("builds breadcrumbs from home to the page", () => {
    expect(breadcrumbTrail("home").map((r) => r.id)).toEqual(["home"]);
    for (const r of ROUTES) {
      const trail = breadcrumbTrail(r.id);
      expect(trail[0]?.id).toBe("home");
      expect(trail.at(-1)?.id).toBe(r.id);
    }
  });

  it("keeps the embed page unlisted, and contact until it has an address (D106)", () => {
    expect(isPublished(route("embed"))).toBe(false);
    expect(isPublished(route("contact"))).toBe(site.contactEmail !== null);
    expect(isPublished(route("about"))).toBe(true);
  });

  it("uses spec slugs: digits without commas, decimal tons with a hyphen", () => {
    const paths = ROUTES.map((r) => r.path);
    expect(paths).toContain("/24000-btu-to-tons/");
    expect(paths).toContain("/1-5-ton-to-btu/");
    expect(paths).toContain("/tons-to-btu/");
    expect(paths).toContain("/ac-tonnage-by-model-number/");
    for (const p of ["/methodology/", "/about/", "/privacy/", "/terms/"])
      expect(paths).toContain(p);
  });
});
