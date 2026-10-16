import { plural } from "@/lib/pluralize";

import type { Segment } from "./home";

const tonWord = (t: string) => plural(t, "ton", "tons");
const equalsWord = (t: string) => plural(t, "equals", "equal");

/** Size line inside the answer, for an AC owner (build prompt §10.3). */
export type AnswerSize =
  | { type: "class"; cls: string }
  | { type: "between"; lower: string; upper: string }
  | { type: "outside" };

const sizeSentence = (size: AnswerSize): Segment[] => {
  switch (size.type) {
    case "class":
      return [{ text: ` That's a ${size.cls} ton AC size.` }];
    case "between":
      return [
        {
          text: ` That's between the ${size.lower} and ${size.upper} ton AC sizes.`,
        },
      ];
    case "outside":
      return [];
  }
};

/**
 * Copy for the 20 numeric shortcut pages: titles and descriptions from spec
 * pp. 20–23 (pluralized), answers from build prompt §10.3, section headings
 * from spec p. 19. Numbers arrive pre-formatted by the engine:
 * n = BTU/hr, t = refrigeration tons.
 */
export const numericTemplate = {
  btu: {
    title: (n: string, t: string) =>
      `${n} BTU to Tons = ${t} [Formula + Chart]`,
    description: (n: string, t: string) =>
      `Convert ${n} BTU/hr to ${t} refrigeration ${tonWord(t)}. See the calculation, cooling kW and nearby capacities, or enter a different rating.`,
    h1: (n: string) => `${n} BTU to Tons`,
    /** The first sentence says "per hour" explicitly (spec p. 19). */
    answer: (
      n: string,
      t: string,
      rounded: boolean,
      size: AnswerSize,
    ): Segment[] => [
      { text: `${n} BTU per hour equals ` },
      { text: `${t} refrigeration ${tonWord(t)}`, strong: true },
      { text: rounded ? " (rounded)." : "." },
      ...sizeSentence(size),
    ],
    method: (n: string) => `Divide ${n} by 12,000 to convert the capacity.`,
    resultUnit: (t: string) => tonWord(t),
    compareHeading: (n: string, lower: string, upper: string) =>
      `Compare ${n} with ${lower} and ${upper} BTU/hr`,
  },
  ton: {
    title: (t: string, n: string) =>
      `${t} Ton to BTU = ${n} BTU/hr [Quick Chart]`,
    description: (t: string, n: string) =>
      `${t} refrigeration ${tonWord(t)} ${equalsWord(t)} ${n} BTU/hr. Check the formula, compare nearby cooling capacities and edit the value in the free converter.`,
    h1: (t: string) => `${t} Ton to BTU Converter`,
    answer: (t: string, n: string): Segment[] => [
      { text: `${t} refrigeration ${tonWord(t)} ${equalsWord(t)} ` },
      { text: `${n} BTU per hour`, strong: true },
      { text: `. Multiply ${t} by 12,000.` },
    ],
    method: (t: string) => `Multiply ${t} by 12,000 to calculate the capacity.`,
    resultUnit: () => "BTU/hr",
    compareHeading: (t: string, lower: string, upper: string) =>
      `Compare ${t} with ${lower} and ${upper} tons`,
  },

  howHeading: "How the conversion works",
  coolingKw: (kw: string) =>
    `Cooling capacity: ${kw} cooling kW. Cooling kW is not the electricity the AC uses.`,

  fits: {
    heading: (t: string) => `Does ${t} ${tonWord(t)} mean it fits my space?`,
    body: [
      "A refrigeration ton is a capacity unit, equal to 12,000 BTU/hr; it is not the unit's weight.",
      "There is no universal area-to-tonnage ratio. Room conditions, building design and climate affect the required capacity.",
      "Whole-home systems require a separate load calculation.",
    ],
  },

  links: {
    heading: "More conversions",
    home: "BTU to Tons Calculator",
    reverseHub: "Tons to BTU Calculator",
  },
} as const;
