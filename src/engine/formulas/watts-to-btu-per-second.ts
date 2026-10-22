import { W_PER_BTUH } from "../constants";

/** /watts-to-btu-per-second/: BTU/s = cooling W ÷ W_PER_BTUH ÷ 3,600 (= W ÷ 1,055.05585262). */
export const wattsToBtuPerSecond = (watts: number): number =>
  watts / W_PER_BTUH / 3_600;
