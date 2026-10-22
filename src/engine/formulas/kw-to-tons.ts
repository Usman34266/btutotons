import { BTUH_PER_TON, W_PER_BTUH } from "../constants";

/** /kw-to-tons/: Refrigeration tons = cooling kW × 1,000 ÷ W_PER_BTUH ÷ 12,000. */
export const kwToTons = (kw: number): number =>
  (kw * 1_000) / W_PER_BTUH / BTUH_PER_TON;
