import { describe, expect, it } from "vitest";

import { parseCapacity, parseInput, parseNumber, validate } from "@/engine";

const code = (r: { ok: boolean; error?: { code: string } }) =>
  r.ok ? "OK" : r.error?.code;

describe("parseNumber (en-US)", () => {
  it.each([
    ["19000", 19_000],
    ["19,000", 19_000],
    ["1,200,000.5", 1_200_000.5],
    ["1.5", 1.5],
    ["0", 0],
    ["  18000  ", 18_000],
    ["0012", 12],
    ["-0", 0],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseNumber(raw)).toEqual({ ok: true, value: expected });
  });

  it("returns the sign for validate to judge", () => {
    expect(parseNumber("-1")).toEqual({ ok: true, value: -1 });
    expect(parseNumber("−5")).toEqual({ ok: true, value: -5 }); // Unicode minus
  });

  it.each([
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    ["12abc", "NOT_A_NUMBER"],
    ["12,00", "NOT_A_NUMBER"],
    ["1,2345", "NOT_A_NUMBER"],
    [",500", "NOT_A_NUMBER"],
    ["1.", "NOT_A_NUMBER"],
    [".5", "NOT_A_NUMBER"],
    ["+5", "NOT_A_NUMBER"],
    ["-", "NOT_A_NUMBER"],
    ["--5", "NOT_A_NUMBER"],
    ["Infinity", "NOT_A_NUMBER"],
    ["NaN", "NOT_A_NUMBER"],
    ["19 000", "NOT_A_NUMBER"],
    ["1,5", "DECIMAL_COMMA"],
    ["0,5", "DECIMAL_COMMA"],
    ["1.000,5", "DECIMAL_COMMA"],
    ["1e5", "SCIENTIFIC"],
    ["1.2E+6", "SCIENTIFIC"],
    ["-1e5", "SCIENTIFIC"],
  ])("rejects %j with %s", (raw, expected) => {
    expect(code(parseNumber(raw))).toBe(expected);
  });
});

describe("parseNumber (eu-comma, not routed)", () => {
  const eu = { parser: "eu-comma" } as const;

  it.each([
    ["3,5", 3.5],
    ["12.000", 12_000],
    ["1.200.000,25", 1_200_000.25],
    ["18000", 18_000],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseNumber(raw, eu)).toEqual({ ok: true, value: expected });
  });

  it.each([
    ["1.5", "NOT_A_NUMBER"],
    ["3,5abc", "NOT_A_NUMBER"],
    ["1e5", "SCIENTIFIC"],
    ["", "EMPTY"],
  ])("rejects %j with %s", (raw, expected) => {
    expect(code(parseNumber(raw, eu))).toBe(expected);
  });
});

describe("validate", () => {
  it("accepts 0 to 10^12 inclusive", () => {
    expect(validate(0)).toEqual({ ok: true, value: 0 });
    expect(validate(1e12)).toEqual({ ok: true, value: 1e12 });
  });

  it("rejects negatives, values over the max and non-finite values", () => {
    expect(code(validate(-1))).toBe("NEGATIVE");
    expect(validate(1e12 + 1)).toEqual({
      ok: false,
      error: { code: "TOO_LARGE", details: { max: 1e12 } },
    });
    expect(code(validate(Number.POSITIVE_INFINITY))).toBe("TOO_LARGE");
    expect(code(validate(Number.NaN))).toBe("TOO_LARGE");
  });

  it("rejects zero only when zero is not allowed (EER, COP, duration)", () => {
    expect(code(validate(0, { allowZero: false }))).toBe("ZERO_NOT_ALLOWED");
    expect(code(validate(0.1, { allowZero: false }))).toBe("OK");
  });

  it("honours a custom max", () => {
    expect(code(validate(25, { max: 24 }))).toBe("TOO_LARGE");
  });
});

describe("parseInput", () => {
  it("parses then validates", () => {
    expect(code(parseInput("-1"))).toBe("NEGATIVE");
    expect(code(parseInput("1,000,000,000,001"))).toBe("TOO_LARGE");
    expect(code(parseInput("9".repeat(400)))).toBe("TOO_LARGE");
    expect(code(parseInput("0", { allowZero: false }))).toBe(
      "ZERO_NOT_ALLOWED",
    );
    expect(code(parseInput("x"))).toBe("NOT_A_NUMBER");
  });
});

describe("parseCapacity", () => {
  it("wraps a valid value in a capacity quantity", () => {
    expect(parseCapacity("1.5", "tr")).toEqual({
      ok: true,
      value: { value: 1.5, unit: "tr", kind: "capacity" },
    });
  });

  it("passes errors through", () => {
    expect(code(parseCapacity("", "btuh"))).toBe("EMPTY");
  });
});
