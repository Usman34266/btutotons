/**
 * Site-wide settings. Fields that need a human decision stay null until
 * a real value exists; copy must never fake them (see docs/DECISIONS.md).
 */
export interface Reviewer {
  name: string;
  credentials: string;
  reviewedOn: string; // ISO date
}

export interface SiteConfig {
  name: string;
  url: string;
  locale: string;
  /** HVAC reviewer. null until a real review has happened. */
  reviewer: Reviewer | null;
  /** "Method updated" date (ISO). null until the release date is set. */
  releaseDate: string | null;
  /** Organization logo path for JSON-LD. null until the logo file exists. */
  logo: string | null;
  /** Who runs the site (person or company), for about/privacy/terms. null until the owner provides it. */
  operator: string | null;
  /** Public contact address. null until the owner provides it. */
  contactEmail: string | null;
  /** Zaraz custom events. false until verified cookieless (open decision #4). */
  customEvents: boolean;
}

export const site: SiteConfig = {
  name: "BTU to Tons",
  url: "https://btutotons.com",
  locale: "en-US",
  reviewer: null,
  releaseDate: null,
  logo: "/logo.png",
  operator: null,
  contactEmail: "contact@btutotons.com",
  customEvents: false,
};
