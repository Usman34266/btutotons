import { W_PER_BTUH } from "../constants";

/** /btu-to-watts/: Cooling W = BTU/hr × W_PER_BTUH. */
export const btuhToWatts = (btuh: number): number => btuh * W_PER_BTUH;
