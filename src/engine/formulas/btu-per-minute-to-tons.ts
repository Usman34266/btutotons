import { BTUH_PER_TON } from "../constants";

/** /btu-per-minute-to-tons/: Refrigeration tons = BTU/min × 60 ÷ 12,000. */
export const btuPerMinuteToTons = (btuPerMinute: number): number =>
  (btuPerMinute * 60) / BTUH_PER_TON;
