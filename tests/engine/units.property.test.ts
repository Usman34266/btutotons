import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  CAPACITY_UNIT_IDS,
  MAX_INPUT_VALUE,
  SIZE_CLASS_BAND_FOR_TESTS,
  capacity,
  classifySize,
  convertBatch,
  convertCapacity,
  escapeCsvCell,
  formatInputValue,
  fromBtuh,
  parseInput,
  toBtuh,
} from "./support";

const value = fc.double({
  min: 0,
  max: MAX_INPUT_VALUE,
  noNaN: true,
  noDefaultInfinity: true,
});
const unit = fc.constantFrom(...CAPACITY_UNIT_IDS);

describe("capacity units (property)", () => {
  it("round-trip: fromBase(toBase(x)) ≈ x for every unit", () => {
    fc.assert(
      fc.property(unit, value, (u, x) => {
        const back = fromBtuh(toBtuh(capacity(x, u)), u);
        expect(Math.abs(back - x)).toBeLessThanOrEqual(
          Math.max(1e-300, Math.abs(x) * 1e-12),
        );
      }),
    );
  });

  it("conversion is monotonic", () => {
    fc.assert(
      fc.property(unit, value, value, (u, a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        expect(convertCapacity(capacity(lo, u)).tons).toBeLessThanOrEqual(
          convertCapacity(capacity(hi, u)).tons,
        );
      }),
    );
  });
});

describe("size class (property)", () => {
  it("never returns a class more than 10% away", () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 100_000, noNaN: true }),
        fc.constantFrom("us", "eu"),
        (btuh, region) => {
          const r = classifySize(btuh, region);
          if (r.type !== "class") return;
          const d =
            Math.abs(btuh - r.sizeClass.nominalBtuh) / r.sizeClass.nominalBtuh;
          expect(d).toBeLessThanOrEqual(SIZE_CLASS_BAND_FOR_TESTS + 1e-9);
        },
      ),
    );
  });

  it("'between' always brackets the value with adjacent nominal sizes", () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 100_000, noNaN: true }), (btuh) => {
        const r = classifySize(btuh);
        if (r.type !== "between") return;
        expect(r.lower.nominalBtuh).toBeLessThan(r.upper.nominalBtuh);
        expect(btuh).toBeGreaterThanOrEqual(r.lower.nominalBtuh);
        expect(btuh).toBeLessThanOrEqual(r.upper.nominalBtuh);
      }),
    );
  });
});

describe("parser (property)", () => {
  it("reads back any whole number it formats with grouping", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }), (n) => {
        fc.pre(n <= MAX_INPUT_VALUE);
        expect(parseInput(formatInputValue(n))).toEqual({ ok: true, value: n });
      }),
    );
  });
});

describe("batch and CSV (property)", () => {
  it("never drops rows", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ maxLength: 12 }), { maxLength: 60 }),
        (lines) => {
          const text = lines.join("\n");
          const nonBlank = text
            .split(/\r\n|\r|\n/)
            .filter((l) => l.trim() !== "").length;
          const r = convertBatch(text, "btuh");
          expect(r.ok && r.value.length).toBe(nonBlank);
        },
      ),
    );
  });

  it("never leaves a formula-starting cell unescaped", () => {
    fc.assert(
      fc.property(fc.string(), (cell) => {
        const out = escapeCsvCell(cell);
        const unquoted = out.startsWith('"') ? out.slice(1) : out;
        expect(/^[=+\-@\t\r]/.test(unquoted)).toBe(false);
      }),
    );
  });
});
