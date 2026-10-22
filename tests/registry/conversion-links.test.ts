import { afterEach, describe, expect, it, vi } from "vitest";

import { conversionGroups } from "@/lib/conversion-links";
import { embedCode } from "@/lib/embed";
import { ROUTES, isPublished } from "@/registry/routes";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("homepage conversion links (D106)", () => {
  it("links every published numeric page once, in both directions", () => {
    const groups = conversionGroups();
    expect(groups.map((g) => g.id)).toEqual([
      "calculators",
      "btu",
      "ton",
      "kw",
      "mbh",
      "time",
    ]);
    const hrefs = groups.flatMap((g) => g.links.map((l) => l.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const r of ROUTES.filter((r) => r.numeric && isPublished(r)))
      expect(hrefs).toContain(r.path);
    expect(groups[1]?.links).toHaveLength(12);
    expect(groups[2]?.links).toHaveLength(8);
    expect(groups[2]?.links[0]).toEqual({
      href: "/1-ton-to-btu/",
      label: "1 Ton to BTU Converter",
    });
  });

  it("names the two calculators", () => {
    expect(conversionGroups()[0]?.links.map((l) => l.href)).toEqual([
      "/tons-to-btu/",
      "/batch-btu-to-tons/",
    ]);
  });

  it("lists every published unit page once, in the menu's groups (D108, D115)", () => {
    const unit = conversionGroups()
      .slice(3)
      .flatMap((g) => g.links.map((l) => l.href));
    expect([...unit].sort()).toEqual(
      ROUTES.filter((r) => r.unit && isPublished(r))
        .map((r) => r.path)
        .sort(),
    );
    expect(conversionGroups()[4]?.links.map((l) => l.href)).toEqual([
      "/mbh-to-btu/",
      "/btu-to-mbh/",
      "/btu-to-hp/",
      "/hp-to-btu/",
    ]);
  });

  it("leaves unpublished unit pages out, even in a preview build", async () => {
    vi.doMock("@/registry/unit-pages", async (original) => {
      const mod = await original<typeof import("@/registry/unit-pages")>();
      return {
        ...mod,
        UNIT_PAGES: mod.UNIT_PAGES.map((p) => ({ ...p, published: false })),
      };
    });
    vi.stubEnv("NEXT_PUBLIC_BTUTOTONS_PREVIEW", "1");
    vi.resetModules();
    const { conversionGroups: preview } =
      await import("@/lib/conversion-links");
    expect(preview().map((g) => g.id)).toEqual(["calculators", "btu", "ton"]);
    vi.doUnmock("@/registry/unit-pages");
  });
});

describe("embed code", () => {
  it("frames /embed/ on the canonical site and credits it", () => {
    const code = embedCode();
    expect(code).toContain('src="https://btutotons.com/embed/"');
    expect(code).toContain('title="BTU to Tons Calculator"');
    expect(code).toContain(
      '<a href="https://btutotons.com/" target="_blank" rel="noopener">BTU to Tons</a>',
    );
  });

  it("carries no colors, so it suits any host page", () => {
    expect(embedCode()).not.toMatch(/#[0-9a-f]{3,8}\b|rgb|hsl/i);
  });
});
