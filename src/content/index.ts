/**
 * Locale lookup for user-facing copy. Only en-US is live; other locales add
 * a folder with the same shape.
 */
import { DEFAULT_LOCALE, type LocaleId } from "@/config/locale";

import * as enUS from "./en-US";

export type Content = typeof enUS;
export type {
  AnswerSize,
  GlossaryTerm,
  NameplateField,
  RouteCopy,
  Segment,
} from "./en-US";

const CONTENT: Record<LocaleId, Content> = { "en-US": enUS };

export const getContent = (locale: LocaleId = DEFAULT_LOCALE): Content =>
  CONTENT[locale];
