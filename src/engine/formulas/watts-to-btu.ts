import { W_PER_BTUH } from "../constants";

/** /watts-to-btu/: BTU/hr = cooling W ÷ W_PER_BTUH. */
export const wattsToBtuh = (watts: number): number => watts / W_PER_BTUH;
