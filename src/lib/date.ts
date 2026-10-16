import { site } from "@/config/site";

/** "October 16, 2026" from an ISO date, in UTC so server and client agree. */
export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(site.locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
