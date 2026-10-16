/**
 * Copy for client components and anything they import. Importing "@/content"
 * there would ship every page's copy to the browser
 * (tests/content/client-content.test.ts).
 */
import { DEFAULT_LOCALE, type LocaleId } from "@/config/locale";

import * as enUS from "./en-US/ui";

export type UiContent = typeof enUS;

const UI: Record<LocaleId, UiContent> = { "en-US": enUS };

export const getUiContent = (locale: LocaleId = DEFAULT_LOCALE): UiContent =>
  UI[locale];
