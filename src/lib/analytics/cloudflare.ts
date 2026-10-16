import type { Analytics, AnalyticsEvent, AnalyticsProps } from "./analytics";

interface ZarazWindow {
  zaraz?: { track(event: string, props?: Record<string, string>): void };
}

/**
 * Cloudflare Zaraz custom events. Not enabled until Zaraz is verified to run
 * cookieless (open decision #4); page views use Cloudflare Web Analytics.
 */
export const cloudflareAnalytics: Analytics = {
  track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
    const zaraz = (window as Window & ZarazWindow).zaraz;
    if (!zaraz) return;
    const clean = Object.fromEntries(
      Object.entries(props).filter(([, v]) => v !== undefined),
    ) as Record<string, string>;
    zaraz.track(event, clean);
  },
};
