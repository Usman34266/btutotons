import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { redirects } from "@/registry/redirects";
import { ROUTES, breadcrumbTrail, route } from "@/registry/routes";

const appDir = resolve(import.meta.dirname, "../../src/app");

/** Numeric and unit routes render from the one [slug] template. */
const pageFile = (r: (typeof ROUTES)[number]) =>
  r.numeric || r.unit
    ? resolve(appDir, "[slug]/page.tsx")
    : resolve(appDir, `.${r.path}page.tsx`);

describe("route registry", () => {
  it("has 8 static routes and 20 numeric pages", () => {
    expect(ROUTES.filter((r) => !r.numeric)).toHaveLength(8);
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
