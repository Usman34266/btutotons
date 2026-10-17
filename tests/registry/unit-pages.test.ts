import { afterEach, describe, expect, it, vi } from "vitest";

import { unitPageBySlug, unitPageModel } from "@/lib/unit-page";
import { UNIT_PAGES } from "@/registry/unit-pages";

/** Spec pp. 24–25 titles; /kw-to-btu/ copy says "cooling kW" (D100). */
const SPEC_TITLES: Record<string, string> = {
  "kw-to-tons": "kW to Tons Calculator [3.517 kW per Ton]",
  "tons-to-kw": "Tons to kW Calculator [Cooling Power Explained]",
  "btu-to-kw": "BTU to kW Calculator [Capacity + Formula]",
  "kw-to-btu": "kW to BTU Calculator [1 kW = 3,412.14 BTU/hr]",
  "btu-per-minute-to-tons": "BTU/min to Tons Calculator [200 BTU/min = 1 Ton]",
  "btu-per-second-to-tons": "BTU/s to Tons Calculator [Time-Unit Formula]",
};

const model = (slug: string) => {
  const page = unitPageBySlug(slug);
  if (!page) throw new Error(slug);
  return unitPageModel(page);
};

/** Registry modules as the preview build (NEXT_PUBLIC_BTUTOTONS_PREVIEW=1) sees them. */
async function loadPreview() {
  vi.stubEnv("NEXT_PUBLIC_BTUTOTONS_PREVIEW", "1");
  vi.resetModules();
  return {
    routes: await import("@/registry/routes"),
    redirects: (await import("@/registry/redirects")).redirects,
    metadata: await import("@/lib/metadata"),
    sitemap: (await import("@/app/sitemap")).default,
    model: (await import("@/lib/unit-page")).unitPageModel,
  };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("unit page registry", () => {
  it("has the six spec pages, all unpublished until the HVAC review (D100)", () => {
    expect(UNIT_PAGES.map((p) => p.slug)).toEqual(Object.keys(SPEC_TITLES));
    for (const p of UNIT_PAGES) expect(p.published).toBe(false);
  });

  it("only points inverses at other unit pages, both ways", () => {
    for (const p of UNIT_PAGES) {
      if (!p.inverse) continue;
      const inverse = unitPageBySlug(p.inverse);
      expect(inverse?.inverse).toBe(p.slug);
      expect([inverse?.from, inverse?.to]).toEqual([p.to, p.from]);
    }
  });

  it("uses trailing-slash aliases that aren't page slugs", () => {
    const slugs = new Set(UNIT_PAGES.map((p) => `/${p.slug}/`));
    for (const p of UNIT_PAGES)
      for (const a of p.aliases) {
        expect(a).toMatch(/^\/[a-z0-9-]+\/$/);
        expect(slugs.has(a)).toBe(false);
      }
  });
});

describe("production build", () => {
  it("exports no unpublished unit page", async () => {
    const { ROUTES, SLUG_ROUTES, slugRoute } =
      await import("@/registry/routes");
    expect(ROUTES.filter((r) => r.unit)).toEqual([]);
    expect(SLUG_ROUTES).toHaveLength(20);
    for (const p of UNIT_PAGES) expect(slugRoute(p.slug)).toBeUndefined();
  });

  it("redirects no alias to an unpublished page", async () => {
    const { redirects } = await import("@/registry/redirects");
    const targets = new Set(UNIT_PAGES.map((p) => `/${p.slug}/`));
    for (const r of redirects) expect(targets.has(r.to)).toBe(false);
  });

  it("links no inverse that isn't exported", () => {
    for (const p of UNIT_PAGES)
      expect(model(p.slug).links.map((l) => l.href)).toEqual(["/"]);
  });
});

describe("preview build", () => {
  it("exports all six pages through the [slug] template", async () => {
    const { routes } = await loadPreview();
    const unit = routes.ROUTES.filter((r) => r.unit);
    expect(unit.map((r) => r.path)).toEqual(
      UNIT_PAGES.map((p) => `/${p.slug}/`),
    );
    expect(routes.SLUG_ROUTES).toHaveLength(26);
    for (const r of unit) {
      expect(routes.isPublished(r)).toBe(false);
      expect(routes.slugRoute(r.unit!.slug)).toBe(r);
      expect(routes.breadcrumbTrail(r.id).map((t) => t.id)).toEqual([
        "home",
        r.id,
      ]);
    }
  });

  it("marks them noindex, keeps them out of the sitemap and adds no aliases", async () => {
    const { routes, metadata, sitemap, redirects } = await loadPreview();
    const unit = routes.ROUTES.filter((r) => r.unit);
    for (const r of unit)
      expect(metadata.pageMetadata(r.id).robots).toEqual({
        index: false,
        follow: false,
      });
    expect(metadata.pageMetadata("home").robots).toBeUndefined();

    const urls = sitemap().map((e) => new URL(e.url).pathname);
    for (const r of unit) expect(urls).not.toContain(r.path);
    expect(urls).toHaveLength(routes.ROUTES.length - unit.length);

    const targets = new Set<string>(unit.map((r) => r.path));
    for (const r of redirects) expect(targets.has(r.to)).toBe(false);
  });

  it("uses the spec titles and unique descriptions", async () => {
    const { routes, metadata } = await loadPreview();
    const unit = routes.ROUTES.filter((r) => r.unit);
    for (const r of unit)
      expect(metadata.routeCopy(r).title).toBe(SPEC_TITLES[r.unit!.slug]);
    const all = routes.ROUTES.map((r) => metadata.routeCopy(r));
    expect(new Set(all.map((c) => c.title)).size).toBe(all.length);
    expect(new Set(all.map((c) => c.description)).size).toBe(all.length);
  });

  it("links each page to home and its exported inverse", async () => {
    const { model: previewModel } = await loadPreview();
    const links = (slug: string) =>
      previewModel(unitPageBySlug(slug)!).links.map((l) => l.href);
    expect(links("kw-to-tons")).toEqual(["/", "/tons-to-kw/"]);
    expect(links("kw-to-btu")).toEqual(["/", "/btu-to-kw/"]);
    expect(links("btu-per-second-to-tons")).toEqual(["/"]);
  });
});

describe("unit page content", () => {
  it("states the worked example from the engine, with the right verb and unit", () => {
    expect(model("kw-to-tons").example).toEqual({
      sentence: "3.5 cooling kW equals 0.9952 refrigeration tons.",
      equation:
        "3.5 × 1,000 ÷ 0.2930710702 = 11,942.4957 BTU/hr; 11,942.4957 ÷ 12,000 = 0.9952 tons",
    });
    expect(model("tons-to-kw").example).toEqual({
      sentence: "2 refrigeration tons equal 7.0337 cooling kW.",
      equation:
        "2 × 12,000 = 24,000 BTU/hr; 24,000 × 0.2930710702 ÷ 1,000 = 7.0337 cooling kW",
    });
    expect(model("btu-to-kw").example.equation).toBe(
      "24,000 × 0.2930710702 ÷ 1,000 = 7.0337 cooling kW",
    );
    expect(model("kw-to-btu").example.sentence).toBe(
      "3.5 cooling kW equals 11,942.4957 BTU/hr.",
    );
    expect(model("btu-per-minute-to-tons").example).toEqual({
      sentence: "200 BTU/min equals 1 refrigeration ton.",
      equation: "200 × 60 = 12,000 BTU/hr; 12,000 ÷ 12,000 = 1 ton",
    });
    expect(model("btu-per-second-to-tons").example.equation).toBe(
      "10 × 3,600 = 36,000 BTU/hr; 36,000 ÷ 12,000 = 3 tons",
    );
  });

  it("quotes engine-formatted factors in the section bodies", () => {
    const text = (slug: string) =>
      model(slug)
        .sections.flatMap((s) => s.paragraphs)
        .join(" ");
    expect(text("kw-to-tons")).toContain("equals 3.516853 cooling kW");
    expect(text("tons-to-kw")).toContain("0.2930710701722222");
    expect(text("btu-to-kw")).toContain("1 BTU = 1,055.05585262 joules");
    expect(text("kw-to-btu")).toContain("about 3,412.141633");
  });

  it("says cooling kW, never thermal kW", () => {
    for (const p of UNIT_PAGES) {
      const m = model(p.slug);
      const text = [
        m.meta.title,
        m.meta.description,
        m.h1,
        m.opening,
        ...m.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
      ].join(" ");
      expect(text).not.toMatch(/thermal/i);
    }
  });

  it("tabulates every US size class on tons-to-kw, linking the ton pages", () => {
    const table = model("tons-to-kw").table!;
    expect(table.lead).toBe("tons");
    expect(table.rows.map((r) => r.key)).toEqual([
      "0.5",
      "0.75",
      "1",
      "1.25",
      "1.5",
      "2",
      "2.5",
      "3",
      "3.5",
      "4",
      "5",
    ]);
    expect(table.rows.find((r) => r.key === "2")).toMatchObject({
      cells: { btuh: "24,000", coolingKw: "7.0337" },
      link: { href: "/2-ton-to-btu/" },
    });
    expect(table.rows.find((r) => r.key === "1.25")?.link).toBeNull();
  });

  it("tabulates cooling kW values on kw-to-btu, without links", () => {
    const table = model("kw-to-btu").table!;
    expect(table.lead).toBe("coolingKw");
    expect(table.rows.find((r) => r.key === "3.5")?.cells).toMatchObject({
      btuh: "11,942.4957",
      tons: "0.9952",
    });
    for (const r of table.rows) expect(r.link).toBeNull();
  });

  it("fixes the converter to the page's unit pair", () => {
    expect(model("kw-to-btu").pair).toEqual({ from: "kw", to: "btuh" });
    expect(model("btu-per-second-to-tons").pair).toEqual({
      from: "btus",
      to: "tr",
    });
  });
});
