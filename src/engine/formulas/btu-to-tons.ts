import { BTUH_PER_TON } from "../constants";

/** /btu-to-tons/: Refrigeration tons = BTU/hr ÷ 12,000. */
export const btuhToTons = (btuh: number): number => btuh / BTUH_PER_TON;
