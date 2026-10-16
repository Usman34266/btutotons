/**
 * Model for the ice-block visual: one block per refrigeration ton, the last
 * one partial, at most `max` drawn, the rest reported as overflow tons.
 */
export const ICE_BLOCKS_MAX = 6;

export interface IceBlocksModel {
  /** Fill per drawn block, 0 < fill ≤ 1. */
  fills: number[];
  /** Tons beyond the drawn blocks (shown as "+N"). 0 when everything is drawn. */
  overflowTons: number;
}

export function iceBlocks(
  tons: number,
  max: number = ICE_BLOCKS_MAX,
): IceBlocksModel {
  // Draw at the 2-decimal resolution people read, so 1.0000001 tons is one block.
  const shown = Math.round(Math.max(tons, 0) * 100) / 100;
  if (shown > max)
    return { fills: Array<number>(max).fill(1), overflowTons: tons - max };

  const whole = Math.floor(shown);
  const part = Math.round((shown - whole) * 100) / 100;
  const fills = Array<number>(whole).fill(1);
  if (part > 0) fills.push(part);
  return { fills, overflowTons: 0 };
}
