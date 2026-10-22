import { describe, expect, it } from "vitest";

import { buildFragment, parseFragment } from "@/lib/fragment-state";

describe("parseFragment", () => {
  it("reads value, unit and precision", () => {
    expect(parseFragment("#v=24000&u=btuh&p=4")).toEqual({
      value: 24_000,
      unit: "btuh",
      precision: 4,
    });
    expect(parseFragment("v=1.5&u=tr")).toEqual({ value: 1.5, unit: "tr" });
  });

  it("ignores anything invalid instead of guessing", () => {
    expect(parseFragment("")).toEqual({});
    expect(parseFragment("#v=abc&u=btuh")).toEqual({ unit: "btuh" });
    expect(parseFragment("#v=-5&u=btuh")).toEqual({ unit: "btuh" });
    expect(parseFragment("#v=1e5&u=btuh")).toEqual({ unit: "btuh" });
    expect(parseFragment("#v=24000&u=kcalh")).toEqual({});
    expect(parseFragment("#v=24000")).toEqual({});
    expect(parseFragment("#p=3")).toEqual({});
    expect(parseFragment("#p=6")).toEqual({ precision: 6 });
  });
});

describe("buildFragment", () => {
  it("writes plain numbers that round-trip", () => {
    const hash = buildFragment({ value: 19_000, unit: "btuh", precision: 4 });
    expect(hash).toBe("#v=19000&u=btuh&p=4");
    expect(parseFragment(hash)).toEqual({
      value: 19_000,
      unit: "btuh",
      precision: 4,
    });
  });

  it("never uses exponent notation", () => {
    expect(buildFragment({ value: 1e-7, unit: "tr", precision: 6 })).toBe(
      "#v=0.0000001&u=tr&p=6",
    );
    expect(parseFragment("#v=0.0000001&u=tr&p=6").value).toBe(1e-7);
  });
});
