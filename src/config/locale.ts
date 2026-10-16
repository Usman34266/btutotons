/**
 * Locale layer. Only en-US is routed at launch; EU locales are modelled so
 * the engine strategies (eu-comma parser, eu size classes) have a home.
 */
import type { NumberParserId, SizeClassRegion } from "@/engine";

export interface LocaleConfig {
  id: string;
  lang: string;
  parser: NumberParserId;
  sizeClassRegion: SizeClassRegion;
  /** Routed and emitted in hreflang. */
  live: boolean;
}

export const LOCALES = {
  "en-US": {
    id: "en-US",
    lang: "en-US",
    parser: "en-US",
    sizeClassRegion: "us",
    live: true,
  },
} as const satisfies Record<string, LocaleConfig>;

export type LocaleId = keyof typeof LOCALES;

export const DEFAULT_LOCALE: LocaleId = "en-US";
