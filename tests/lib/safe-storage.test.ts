import { describe, expect, it } from "vitest";

import { safeStorage } from "@/lib/safe-storage";

describe("safeStorage", () => {
  it("never throws without a window (SSR, blocked storage)", () => {
    expect(safeStorage.get("x")).toBeNull();
    expect(() => safeStorage.set("x", "1")).not.toThrow();
  });
});
