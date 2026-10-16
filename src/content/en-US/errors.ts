import type { ParseErrorCode } from "@/engine";

/** Input error messages (build prompt §10.6). Exact copy. */
export const errors: Record<ParseErrorCode, string> = {
  EMPTY: "Enter your AC's rating, like 18000.",
  NEGATIVE: "Capacity can't be negative.",
  NOT_A_NUMBER: "Use numbers only, like 24000 or 24,000.",
  DECIMAL_COMMA: "Use a dot for decimals, like 1.5.",
  SCIENTIFIC: "Type the full number, like 1200000.",
  TOO_LARGE: "That's bigger than this tool supports (up to 1,000,000,000,000).",
  ZERO_NOT_ALLOWED: "This value must be more than 0.",
};
