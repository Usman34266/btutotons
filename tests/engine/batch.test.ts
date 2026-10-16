import { describe, expect, it } from "vitest";

import { BATCH_MAX_ROWS, convertBatch } from "@/engine";

describe("convertBatch", () => {
  it("converts each non-blank line in order and keeps invalid rows", () => {
    const r = convertBatch("18000\n\n  24,000 \r\n1,5\r12abc\n", "btuh");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(
      r.value.map(({ row, line, raw, status }) => ({ row, line, raw, status })),
    ).toEqual([
      { row: 1, line: 1, raw: "18000", status: "ok" },
      { row: 2, line: 3, raw: "24,000", status: "ok" },
      { row: 3, line: 4, raw: "1,5", status: "error" },
      { row: 4, line: 5, raw: "12abc", status: "error" },
    ]);
    const [, second, third] = r.value;
    expect(second?.status === "ok" && second.result.tons).toBe(2);
    expect(third?.status === "error" && third.error.code).toBe("DECIMAL_COMMA");
  });

  it("uses one unit for the whole list", () => {
    const r = convertBatch("1\n2", "tr");
    expect(
      r.ok && r.value.map((row) => row.status === "ok" && row.result.btuh),
    ).toEqual([12_000, 24_000]);
  });

  it("returns no rows for blank input", () => {
    expect(convertBatch(" \n\n", "btuh")).toEqual({ ok: true, value: [] });
  });

  it("accepts exactly 200 rows and refuses 201 without converting any", () => {
    const lines = (n: number) =>
      Array.from({ length: n }, (_, i) => String(1_000 * (i + 1))).join("\n");
    const ok200 = convertBatch(lines(BATCH_MAX_ROWS), "btuh");
    expect(ok200.ok && ok200.value.every((row) => row.status === "ok")).toBe(
      true,
    );
    expect(ok200.ok && ok200.value).toHaveLength(200);
    expect(convertBatch(lines(201), "btuh")).toEqual({
      ok: false,
      error: { code: "TOO_MANY_ROWS", details: { max: 200, count: 201 } },
    });
  });

  it("does not count blank lines toward the limit", () => {
    const text = Array.from({ length: 200 }, () => "12000\n").join("\n");
    expect(convertBatch(text, "btuh").ok).toBe(true);
  });
});
