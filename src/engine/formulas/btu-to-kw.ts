import { W_PER_BTUH } from "../constants";

/** /btu-to-kw/: Cooling kW = BTU/hr × W_PER_BTUH ÷ 1,000. */
export const btuhToKw = (btuh: number): number => (btuh * W_PER_BTUH) / 1_000;
