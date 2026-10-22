import { describe, expect, it } from "vitest";

import { redirects } from "@/registry/redirects";
import { ROUTES } from "@/registry/routes";

describe("redirect registry", () => {
  it("sends the old calculator URL to the canonical home page", () => {
    expect(redirects).toContainEqual({
      from: "/btu-to-tons-calculator/",
      to: "/",
      status: 301,
    });
  });

  it("sends singular/plural spelling variants to the one canonical page", () => {
    expect(redirects).toContainEqual({
      from: "/24000-btu-to-ton/",
      to: "/24000-btu-to-tons/",
      status: 301,
    });
    expect(redirects).toContainEqual({
      from: "/2-tons-to-btu/",
      to: "/2-ton-to-btu/",
      status: 301,
    });
    expect(redirects).toContainEqual({
      from: "/1-5-tons-to-btu/",
      to: "/1-5-ton-to-btu/",
      status: 301,
    });
    expect(redirects).toContainEqual({
      from: "/ton-to-btu/",
      to: "/tons-to-btu/",
      status: 301,
    });
    // 1 static + 12 BTU aliases + 8 ton aliases + the reverse hub alias + 4 unit-page aliases.
    expect(redirects).toHaveLength(32);
  });

  it("only redirects to live routes", () => {
    const live = new Set<string>(ROUTES.map((r) => r.path));
    for (const r of redirects) expect(live.has(r.to)).toBe(true);
  });

  it("has unique sources that never redirect to themselves", () => {
    const sources = redirects.map((r) => r.from);
    expect(new Set(sources).size).toBe(sources.length);
    for (const r of redirects) expect(r.to).not.toBe(r.from);
  });

  it("uses trailing slashes and 301s only", () => {
    for (const r of redirects) {
      expect(r.from.endsWith("/")).toBe(true);
      expect(r.status).toBe(301);
    }
  });
});
