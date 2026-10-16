import type { NumberParserId, ParseErrorCode } from "../types";

/**
 * Number grammar per locale. `read` returns null when the text is not a
 * number in this grammar; `diagnose` then names the most helpful error.
 */
export interface NumberGrammar {
  id: NumberParserId;
  read(body: string): number | null;
  diagnose(
    body: string,
  ): Extract<ParseErrorCode, "NOT_A_NUMBER" | "DECIMAL_COMMA">;
}

const EN_US_NUMBER = /^\d{1,3}(,\d{3})+(\.\d+)?$|^\d+(\.\d+)?$/;
// "1,5" (one digit after a lone comma) or "1.000,5" (EU grouping + comma decimal).
// Anything else with stray commas, e.g. "12,00", is NOT_A_NUMBER. See D028.
const EN_US_DECIMAL_COMMA = /^\d+,\d$|^\d{1,3}(\.\d{3})+,\d+$/;

export const enUsGrammar: NumberGrammar = {
  id: "en-US",
  read: (body) =>
    EN_US_NUMBER.test(body) ? Number(body.replaceAll(",", "")) : null,
  diagnose: (body) =>
    EN_US_DECIMAL_COMMA.test(body) ? "DECIMAL_COMMA" : "NOT_A_NUMBER",
};

// Built and tested, not used by any en-US route (D003).
const EU_NUMBER = /^\d{1,3}(\.\d{3})+(,\d+)?$|^\d+(,\d+)?$/;

export const euCommaGrammar: NumberGrammar = {
  id: "eu-comma",
  read: (body) =>
    EU_NUMBER.test(body)
      ? Number(body.replaceAll(".", "").replace(",", "."))
      : null,
  diagnose: () => "NOT_A_NUMBER",
};

export const NUMBER_GRAMMARS: Readonly<Record<NumberParserId, NumberGrammar>> =
  {
    "en-US": enUsGrammar,
    "eu-comma": euCommaGrammar,
  };
