import { W_PER_BTUH, W_PER_HP } from "../constants";

/** /hp-to-btu/: BTU/hr = horsepower × W_PER_HP ÷ W_PER_BTUH. */
export const hpToBtuh = (hp: number): number => (hp * W_PER_HP) / W_PER_BTUH;
