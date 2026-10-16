import { describe, expect, it } from "vitest";

import { ICE_BLOCKS_MAX, iceBlocks } from "@/engine";

describe("iceBlocks", () => {
  it("draws one block per ton, the last one partial", () => {
    expect(iceBlocks(2)).toEqual({ fills: [1, 1], overflowTons: 0 });
    expect(iceBlocks(19_000 / 12_000)).toEqual({
      fills: [1, 0.58],
      overflowTons: 0,
    });
    expect(iceBlocks(0.5)).toEqual({ fills: [0.5], overflowTons: 0 });
  });

  it("draws nothing for zero, negatives and values below 0.005 tons", () => {
    expect(iceBlocks(0)).toEqual({ fills: [], overflowTons: 0 });
    expect(iceBlocks(-1)).toEqual({ fills: [], overflowTons: 0 });
    expect(iceBlocks(0.004)).toEqual({ fills: [], overflowTons: 0 });
  });

  it("ignores float noise below the displayed resolution", () => {
    expect(iceBlocks(1.0000001)).toEqual({ fills: [1], overflowTons: 0 });
    expect(iceBlocks(2.999)).toEqual({ fills: [1, 1, 1], overflowTons: 0 });
  });

  it("caps at 6 blocks and reports the rest as overflow tons", () => {
    expect(ICE_BLOCKS_MAX).toBe(6);
    expect(iceBlocks(6)).toEqual({
      fills: [1, 1, 1, 1, 1, 1],
      overflowTons: 0,
    });
    expect(iceBlocks(7.5)).toEqual({
      fills: [1, 1, 1, 1, 1, 1],
      overflowTons: 1.5,
    });
    expect(iceBlocks(3, 2)).toEqual({ fills: [1, 1], overflowTons: 1 });
  });
});
