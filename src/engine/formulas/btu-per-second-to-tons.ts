import { BTUH_PER_TON } from "../constants";

/** /btu-per-second-to-tons/: Refrigeration tons = BTU/s × 3,600 ÷ 12,000. */
export const btuPerSecondToTons = (btuPerSecond: number): number =>
  (btuPerSecond * 3_600) / BTUH_PER_TON;
