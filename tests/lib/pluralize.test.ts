import { describe, expect, it } from "vitest";

import { isSingularText, plural } from "@/lib/pluralize";

describe("pluralize", () => {
  it("is singular only when the displayed number is exactly 1", () => {
    expect(isSingularText("1")).toBe(true);
    expect(isSingularText("+1")).toBe(true);
    expect(isSingularText("1.5")).toBe(false);
    expect(isSingularText("0")).toBe(false);
    expect(isSingularText("less than 0.0001")).toBe(false);
    expect(plural("1", "ton", "tons")).toBe("ton");
    expect(plural("2", "ton", "tons")).toBe("tons");
  });
});
