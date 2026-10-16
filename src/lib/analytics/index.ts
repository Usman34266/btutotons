import { site } from "@/config/site";

import type { Analytics } from "./analytics";
import { cloudflareAnalytics } from "./cloudflare";
import { noopAnalytics } from "./noop";

export type { Analytics, AnalyticsEvent, AnalyticsProps } from "./analytics";

/** Components depend on the interface; the adapter is chosen here. */
export const analytics: Analytics = site.customEvents
  ? cloudflareAnalytics
  : noopAnalytics;
