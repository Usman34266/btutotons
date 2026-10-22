import { W_PER_BTUH } from "../constants";

/** /kw-to-btu/: BTU/hr = cooling kW × 1,000 ÷ W_PER_BTUH. */
export const kwToBtuh = (kw: number): number => (kw * 1_000) / W_PER_BTUH;
