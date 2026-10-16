/**
 * Acceptance tests: the single dataset from build prompt §8.10.
 * Absolute tolerance ≤ 1e-8 TR unless a row states otherwise.
 * P1 rows are listed as todo until their modules ship (M9–M11).
 */
import { describe, expect, it } from "vitest";

import {
  capacity,
  compareCapacities,
  convertBatch,
  convertCapacity,
  formatAmount,
  formatNumber,
  formatPercent,
  parseInput,
  toCsv,
  type CapacityUnitId,
  type SizeClassResult,
} from "@/engine";

const TR_TOLERANCE = 1e-8;

type SizeClassExpectation =
  | { type: "class"; tons: number }
  | { type: "between"; lower: number; upper: number };

interface ConversionCase {
  input: [number, CapacityUnitId];
  tons?: number;
  btuh?: number;
  /** [expected kW, absolute tolerance from the digits given] */
  kw?: [number, number];
  sizeClass?: SizeClassExpectation;
}

const conversions: ConversionCase[] = [
  {
    input: [24_000, "btuh"],
    tons: 2,
    kw: [7.0337056841, 1e-10],
    sizeClass: { type: "class", tons: 2 },
  },
  {
    input: [19_000, "btuh"],
    tons: 19_000 / 12_000,
    kw: [5.5683503, 1e-7],
    sizeClass: { type: "class", tons: 1.5 },
  },
  {
    input: [21_000, "btuh"],
    tons: 1.75,
    sizeClass: { type: "between", lower: 1.5, upper: 2 },
  },
  { input: [12_500, "btuh"], sizeClass: { type: "class", tons: 1 } },
  { input: [1.5, "tr"], btuh: 18_000, kw: [5.2752792631, 1e-10] },
  { input: [3.5168528420667, "kw"], tons: 1 },
  { input: [200, "btumin"], tons: 1 },
  { input: [3.3333333333333, "btus"], tons: 1 },
  { input: [24, "kbtuh"], tons: 2 },
  { input: [0.024, "mmbtuh"], tons: 2 },
  { input: [0, "btuh"], tons: 0 },
];

const errors: [string, string][] = [
  ["", "EMPTY"],
  ["-1", "NEGATIVE"],
  ["12abc", "NOT_A_NUMBER"],
  ["1,5", "DECIMAL_COMMA"],
  ["1e5", "SCIENTIFIC"],
  ["12,00", "NOT_A_NUMBER"],
];

const simplify = (r: SizeClassResult) =>
  r.type === "class"
    ? { type: r.type, tons: r.sizeClass.tons }
    : r.type === "between"
      ? { type: r.type, lower: r.lower.tons, upper: r.upper.tons }
      : { type: r.type };

describe("acceptance table: conversions", () => {
  it.each(conversions.map((c) => [`${c.input[0]} ${c.input[1]}`, c] as const))(
    "%s",
    (_, c) => {
      const r = convertCapacity(capacity(...c.input));
      if (c.tons !== undefined)
        expect(Math.abs(r.tons - c.tons)).toBeLessThanOrEqual(TR_TOLERANCE);
      if (c.btuh !== undefined) expect(r.btuh).toBeCloseTo(c.btuh, 9);
      if (c.kw)
        expect(Math.abs(r.coolingKw - c.kw[0])).toBeLessThanOrEqual(c.kw[1]);
      if (c.sizeClass) expect(simplify(r.sizeClass)).toEqual(c.sizeClass);
    },
  );

  it("0 BTU/hr is valid", () => {
    expect(parseInput("0")).toEqual({ ok: true, value: 0 });
  });

  it("0.5 BTU/hr at 4 decimals shows 'less than 0.0001 TR'", () => {
    const { tons } = convertCapacity(capacity(0.5, "btuh"));
    expect(formatAmount(tons, "tr", { precision: 4 })).toBe(
      "less than 0.0001 TR",
    );
  });
});

describe("acceptance table: input errors", () => {
  it.each(errors)("%j → %s", (raw, code) => {
    const r = parseInput(raw);
    expect(r.ok ? "OK" : r.error.code).toBe(code);
  });
});

describe("acceptance table: compare", () => {
  it("A=18,000, B=24,000 → +6,000 BTU/hr; +0.5 TR; +1.7584 kW; +33.33%", () => {
    const r = compareCapacities(
      capacity(18_000, "btuh"),
      capacity(24_000, "btuh"),
    );
    const signed = { signDisplay: "exceptZero" } as const;
    expect(formatNumber(r.difference.btuh, signed)).toBe("+6,000");
    expect(formatNumber(r.difference.tons, signed)).toBe("+0.5");
    expect(formatNumber(r.difference.coolingKw, signed)).toBe("+1.7584");
    expect(r.percent.ok && formatPercent(r.percent.value)).toBe("+33.33%");
  });

  it("A=0, B=12,000 → percentage unavailable", () => {
    const r = compareCapacities(capacity(0, "btuh"), capacity(12_000, "btuh"));
    expect(r.percent.ok).toBe(false);
  });
});

describe("acceptance table: batch and CSV", () => {
  const lines = (n: number) =>
    Array.from({ length: n }, () => "12000").join("\n");

  it("200 lines all convert", () => {
    const r = convertBatch(lines(200), "btuh");
    expect(r.ok && r.value.filter((row) => row.status === "ok")).toHaveLength(
      200,
    );
  });

  it("201 lines → limit message", () => {
    const r = convertBatch(lines(201), "btuh");
    expect(r.ok ? "OK" : r.error.code).toBe("TOO_MANY_ROWS");
  });

  it("CSV cell =SUM(A1) is exported as '=SUM(A1)", () => {
    const r = convertBatch("=SUM(A1)", "btuh");
    expect(r.ok && toCsv(r.value, "btuh")).toContain(",'=SUM(A1),");
  });
});

describe("acceptance table: P1 (pending)", () => {
  it.todo("(M9) 24,000 BTU total, 2 h → 2 ton-hours; average 1 TR");
  it.todo("(M10) 24,000 BTU/hr, EER 12, 8 h, $0.15 → 2 kW; 16 kWh; $2.40");
  it.todo("(M10) EU EER 3.2 W/W → ≈ 10.92 BTU/Wh equivalent");
  it.todo("(M11) 300 ft², normal, 2 people, no kitchen → 8,000 BTU/hr");
  it.todo("(M11) 300 ft², sunny, 4 people, kitchen → 14,000 BTU/hr");
  it.todo(
    "(M11) 149.99 / 150 / 2,500 / 2,500.01 ft² → 5,000 / 6,000 / 34,000 / unsupported",
  );
  it.todo("(M10/M9) EER 0, duration 0 → invalid");
});
