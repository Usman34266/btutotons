import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { getContent } from "@/content";
import { redirects } from "@/registry/redirects";
import { ROUTE_IDS, breadcrumbTrail, routes } from "@/registry/routes";

const { routes: copy } = getContent();
const appDir = resolve(import.meta.dirname, "../../src/app");

describe("route registry", () => {
  it("keys every route by its own id", () => {
    for (const id of ROUTE_IDS) expect(routes[id].id).toBe(id);
  });

  it("has unique paths with trailing slashes", () => {
    const paths = ROUTE_IDS.map((id) => routes[id].path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const p of paths) expect(p).toMatch(/^\/([a-z0-9-]+\/)*$/);
  });

  it("has a page file for every route", () => {
    for (const id of ROUTE_IDS) {
      expect(existsSync(resolve(appDir, `.${routes[id].path}page.tsx`))).toBe(
        true,
      );
    }
  });

  it("never lists a path that redirects", () => {
    const sources = new Set<string>(redirects.map((r) => r.from));
    for (const id of ROUTE_IDS)
      expect(sources.has(routes[id].path)).toBe(false);
  });

  it("builds breadcrumbs from home to the page", () => {
    expect(breadcrumbTrail("home").map((r) => r.id)).toEqual(["home"]);
    for (const id of ROUTE_IDS) {
      const trail = breadcrumbTrail(id);
      expect(trail[0]?.id).toBe("home");
      expect(trail.at(-1)?.id).toBe(id);
    }
  });
});

describe("route metadata copy", () => {
  it("has a unique, non-empty title and description per route", () => {
    const titles = ROUTE_IDS.map((id) => copy[id].title);
    const descriptions = ROUTE_IDS.map((id) => copy[id].description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const id of ROUTE_IDS) {
      expect(copy[id].title.length).toBeGreaterThan(0);
      expect(copy[id].description.length).toBeGreaterThan(0);
      expect(copy[id].breadcrumb.length).toBeGreaterThan(0);
    }
  });

  it("uses the spec titles", () => {
    expect(copy.home.title).toBe(
      "BTU to Tons Calculator [12,000 BTU/hr = 1 Ton]",
    );
    expect(copy.batch.title).toBe(
      "Batch BTU to Tons [Convert up to 200 Values]",
    );
  });
});
