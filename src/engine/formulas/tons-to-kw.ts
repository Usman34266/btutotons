import { BTUH_PER_TON, W_PER_BTUH } from "../constants";

/** /tons-to-kw/: Cooling kW = refrigeration tons × 12,000 × W_PER_BTUH ÷ 1,000. */
export const tonsToKw = (tons: number): number =>
  (tons * BTUH_PER_TON * W_PER_BTUH) / 1_000;
