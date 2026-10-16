import { describe, expect, it } from "vitest";

import { CSV_COLUMNS, convertBatch, escapeCsvCell, toCsv } from "@/engine";

const csvFor = (text: string) => {
  const r = convertBatch(text, "btuh");
  if (!r.ok) throw new Error("unexpected batch error");
  return toCsv(r.value, "btuh").split("\r\n");
};

describe("escapeCsvCell", () => {
  it.each([
    ["=SUM(A1)", "'=SUM(A1)"],
    ["+1", "'+1"],
    ["-1", "'-1"],
    ["@cmd", "'@cmd"],
    ["\tx", "'\tx"],
    ["\rx", '"\'\rx"'],
    ["19,000", '"19,000"'],
    ['say "hi"', '"say ""hi"""'],
    ["a\nb", '"a\nb"'],
    ["=1,2", '"\'=1,2"'],
    ["plain", "plain"],
    ["", ""],
  ])("%j → %j", (cell, expected) => {
    expect(escapeCsvCell(cell)).toBe(expected);
  });
});

describe("toCsv", () => {
  it("writes the fixed header", () => {
    expect(csvFor("")[0]).toBe(CSV_COLUMNS.join(","));
    expect(CSV_COLUMNS.join(",")).toBe(
      "row,input_value,input_unit,BTU_per_hour,refrigeration_tons,cooling_kW,size_class,status",
    );
  });

  it("writes valid rows with 12 significant digits and no separators", () => {
    expect(csvFor("19,000")[1]).toBe(
      "1,19000,BTU/hr,19000,1.58333333333,5.56835033327,1.5 ton,ok",
    );
  });

  it("writes between and outside size classes", () => {
    const [, between, outside] = csvFor("21000\n0");
    expect(between).toBe(
      "1,21000,BTU/hr,21000,1.75,6.15449247362,between 1.5 ton and 2 ton,ok",
    );
    expect(outside).toBe("2,0,BTU/hr,0,0,0,,ok");
  });

  it("keeps invalid rows with their raw text, escaped, and the error code", () => {
    const [, injected, comma] = csvFor("=SUM(A1)\n1,5");
    expect(injected).toBe("1,'=SUM(A1),BTU/hr,,,,,NOT_A_NUMBER");
    expect(comma).toBe('2,"1,5",BTU/hr,,,,,DECIMAL_COMMA');
  });

  it("ends with CRLF", () => {
    const r = convertBatch("1", "btuh");
    expect(r.ok && toCsv(r.value, "btuh").endsWith("ok\r\n")).toBe(true);
  });
});
