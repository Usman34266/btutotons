import type { Analytics } from "./analytics";

export const noopAnalytics: Analytics = {
  track() {},
};
