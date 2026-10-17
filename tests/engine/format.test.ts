import { describe, expect, it } from "vitest";

import {
  formatAmount,
  formatCompact,
  formatConstant,
  formatCsvNumber,
  formatInputAmount,
  formatInputValue,
  formatNumber,
  formatPercent,
  formatRatioPercent,
  isDisplayRounded,
  isPrecision,
} from "@/engine";

describe("formatInputAmount", () => {
  it("keeps the value as typed and pluralizes the long unit name", () => {
    expect(formatInputAmount(3.5, "kw")).toBe("3.5 cooling kW");
    expect(formatInputAmount(1, "tr")).toBe("1 refrigeration ton");
    expect(formatInputAmount(3.3333333333, "btus")).toBe("3.3333333333 BTU/s");
    expect(formatInputAmount(24_000, "btuh")).toBe("24,000 BTU/hr");
  });
});

describe("formatNumber", () => {
  it("rounds to 4 decimals by default and trims trailing zeros", () => {
    expect(formatNumber(19_000 / 12_000)).toBe("1.5833");
    expect(formatNumber(2)).toBe("2");
    expect(formatNumber(1.75)).toBe("1.75");
    expect(formatNumber(24_000)).toBe("24,000");
  });

  it("supports 2 and 6 decimals", () => {
    expect(formatNumber(19_000 / 12_000, { precision: 2 })).toBe("1.58");
    expect(formatNumber(19_000 / 12_000, { precision: 6 })).toBe("1.583333");
  });

  it("shows 'less than' the step for tiny non-zero values", () => {
    expect(formatNumber(0.5 / 12_000)).toBe("less than 0.0001");
    expect(formatNumber(0.001, { precision: 2 })).toBe("less than 0.01");
    expect(formatNumber(1e-7, { precision: 6 })).toBe("less than 0.000001");
    expect(formatNumber(-0.00001)).toBe("less than 0.0001");
  });

  it("formats zero (and negative zero) as 0", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-0)).toBe("0");
    expect(formatNumber(-0, { signDisplay: "exceptZero" })).toBe("0");
  });

  it("can show an explicit sign for differences", () => {
    expect(formatNumber(6_000, { signDisplay: "exceptZero" })).toBe("+6,000");
    expect(formatNumber(-0.5, { signDisplay: "exceptZero" })).toBe("-0.5");
  });

  it("can show the magnitude only, for copy that states the direction", () => {
    expect(formatNumber(-6_000, { signDisplay: "never" })).toBe("6,000");
    expect(formatNumber(0.5, { signDisplay: "never" })).toBe("0.5");
    expect(
      formatAmount(-1, "tr", { style: "long", signDisplay: "never" }),
    ).toBe("1 refrigeration ton");
  });

  it("rounds just below a whole number up to it", () => {
    expect(formatNumber(1.99999)).toBe("2");
  });
});

describe("formatAmount", () => {
  it("uses the unit symbol by default", () => {
    expect(formatAmount(1.5, "tr")).toBe("1.5 TR");
    expect(formatAmount(0.5 / 12_000, "tr")).toBe("less than 0.0001 TR");
    expect(formatAmount(18_000, "btuh")).toBe("18,000 BTU/hr");
  });

  it("pluralizes long names on the displayed value", () => {
    expect(formatAmount(1, "tr", { style: "long" })).toBe(
      "1 refrigeration ton",
    );
    expect(formatAmount(1.00001, "tr", { style: "long" })).toBe(
      "1 refrigeration ton",
    );
    expect(formatAmount(2, "tr", { style: "long" })).toBe(
      "2 refrigeration tons",
    );
    expect(formatAmount(1.5, "tr", { style: "long" })).toBe(
      "1.5 refrigeration tons",
    );
    expect(formatAmount(0, "tr", { style: "long" })).toBe(
      "0 refrigeration tons",
    );
    expect(
      formatAmount(1, "tr", { style: "long", signDisplay: "exceptZero" }),
    ).toBe("+1 refrigeration ton");
    expect(formatAmount(1, "tonhour", { style: "long" })).toBe("1 ton-hour");
    expect(formatAmount(5.27, "kw", { style: "long" })).toBe("5.27 cooling kW");
  });
});

describe("formatPercent", () => {
  it("shows two decimals and a sign", () => {
    expect(formatPercent(100 / 3)).toBe("+33.33%");
    expect(formatPercent(-25)).toBe("-25%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(0.001)).toBe("less than 0.01%");
  });

  it("can drop the sign", () => {
    expect(formatPercent(-25, "never")).toBe("25%");
    expect(formatPercent(100 / 3, "never")).toBe("33.33%");
  });
});

describe("formatInputValue", () => {
  it("shows a typed value with grouping and up to 10 decimals", () => {
    expect(formatInputValue(19_000)).toBe("19,000");
    expect(formatInputValue(3.5168528420667)).toBe("3.5168528421");
    expect(formatInputValue(0.2930710701722222)).toBe("0.2930710702");
  });
});

describe("formatCsvNumber", () => {
  it("uses up to 12 significant digits, no separators, no exponent", () => {
    expect(formatCsvNumber(19_000 / 12_000)).toBe("1.58333333333");
    expect(formatCsvNumber(1e18)).toBe("1000000000000000000");
    expect(formatCsvNumber(1e-7)).toBe("0.0000001");
    expect(formatCsvNumber(24_000)).toBe("24000");
  });
});

describe("isPrecision", () => {
  it("accepts 2, 4, 6 only", () => {
    expect([2, 4, 6].every(isPrecision)).toBe(true);
    expect([0, 3, "4", null].some(isPrecision)).toBe(false);
  });
});

describe("formatConstant", () => {
  it("keeps every digit of a published constant, grouped", () => {
    expect(formatConstant(0.2930710701722222)).toBe("0.2930710701722222");
    expect(formatConstant(12_000)).toBe("12,000");
    expect(formatConstant(1_055.05585262)).toBe("1,055.05585262");
  });
});

describe("formatRatioPercent", () => {
  it("shows a ratio as a percent", () => {
    expect(formatRatioPercent(0.1)).toBe("10%");
    expect(formatRatioPercent(0.125)).toBe("12.5%");
  });
});

describe("isDisplayRounded", () => {
  it("is true only when the display drops digits", () => {
    expect(isDisplayRounded(8_000 / 12_000)).toBe(true);
    expect(isDisplayRounded(10_000 / 12_000)).toBe(true);
    expect(isDisplayRounded(0.5)).toBe(false);
    expect(isDisplayRounded(1.75, 2)).toBe(false);
    expect(isDisplayRounded(1.755, 2)).toBe(true);
  });
});

describe("formatCompact", () => {
  it("uses 2 decimals below a million and compact notation above", () => {
    expect(formatCompact(1.5)).toBe("1.5");
    expect(formatCompact(999_999)).toBe("999,999");
    expect(formatCompact(83_333_333_333_327)).toBe("83.3T");
  });
});
