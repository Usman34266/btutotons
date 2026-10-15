import { describe, expect, it } from "vitest";

import { redirects } from "@/registry/redirects";

describe("redirect registry", () => {
  it("sends the old calculator URL to the canonical home page", () => {
    expect(redirects).toContainEqual({
      from: "/btu-to-tons-calculator/",
      to: "/",
      status: 301,
    });
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
