import { W_PER_BTUH } from "../constants";

/** /btu-per-second-to-watts/: Cooling W = BTU/s × 3,600 × W_PER_BTUH (= BTU/s × 1,055.05585262). */
export const btuPerSecondToWatts = (btuPerSecond: number): number =>
  btuPerSecond * 3_600 * W_PER_BTUH;
