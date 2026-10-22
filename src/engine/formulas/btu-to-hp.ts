import { W_PER_BTUH, W_PER_HP } from "../constants";

/** /btu-to-hp/: Horsepower = BTU/hr × W_PER_BTUH ÷ W_PER_HP. */
export const btuhToHp = (btuh: number): number =>
  (btuh * W_PER_BTUH) / W_PER_HP;
