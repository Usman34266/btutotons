import { BTUH_PER_TON } from "../constants";

/** /tons-to-btu/: BTU/hr = refrigeration tons × 12,000. */
export const tonsToBtuh = (tons: number): number => tons * BTUH_PER_TON;
