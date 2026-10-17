import { getUiContent } from "@/content/ui";
import {
  formatAmount,
  formatInputAmount,
  formatInputValue,
  type ConversionResult,
  type Precision,
} from "@/engine";

import { isSingularText } from "./pluralize";

/** "3.5 cooling kW equals 0.9952 refrigeration tons." Client-safe. */
export const pairSentence = (
  result: ConversionResult,
  precision: Precision,
): string =>
  getUiContent().unitPair.sentence(
    formatInputAmount(result.input.value, result.input.unit),
    formatAmount(result.output.value, result.output.unit, {
      precision,
      style: "long",
    }),
    result.input.unit === "tr" &&
      !isSingularText(formatInputValue(result.input.value)),
  );
