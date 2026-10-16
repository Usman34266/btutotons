import { describe, expect, it } from "vitest";

import { err, ok } from "@/engine";

describe("Result helpers", () => {
  it("builds ok and err values", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("EMPTY")).toEqual({ ok: false, error: { code: "EMPTY" } });
    expect(err("TOO_LARGE", { max: 10 })).toEqual({
      ok: false,
      error: { code: "TOO_LARGE", details: { max: 10 } },
    });
  });
});
