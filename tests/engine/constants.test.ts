import { describe, expect, it } from "vitest";

import {
  BTUH_PER_TON,
  BTU_WH_PER_W_W,
  FT2_PER_M2,
  J_PER_BTU,
  W_PER_BTUH,
} from "@/engine";

describe("constants (NIST SP 811 B.8, International Table BTU)", () => {
  it("defines the US refrigeration ton as exactly 12,000 BTU/hr", () => {
    expect(BTUH_PER_TON).toBe(12_000);
  });

  it("derives W per BTU/hr from 1 BTU_IT = 1,055.05585262 J", () => {
    expect(J_PER_BTU).toBe(1_055.05585262);
    expect(W_PER_BTUH).toBeCloseTo(J_PER_BTU / 3_600, 15);
  });

  it("makes 1 ton ≈ 3.5168528 kW of cooling", () => {
    expect((BTUH_PER_TON * W_PER_BTUH) / 1_000).toBeCloseTo(
      3.5168528420667,
      12,
    );
  });

  it("keeps BTU/Wh per W/W as the reciprocal of W per BTU/hr", () => {
    expect(BTU_WH_PER_W_W).toBeCloseTo(1 / W_PER_BTUH, 8);
  });

  it("uses 1 ft² = 0.09290304 m² exactly", () => {
    expect(FT2_PER_M2).toBeCloseTo(1 / 0.09290304, 9);
  });
});
