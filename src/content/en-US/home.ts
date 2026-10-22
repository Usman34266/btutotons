import type { CapacityUnitId } from "@/engine";
import { plural } from "@/lib/pluralize";

/** A run of text; `strong` runs render bold. */
export interface Segment {
  text: string;
  strong?: boolean;
}

/** Unit words used inside sentences ("Your 19,000 BTU AC"). */
const SENTENCE_UNIT: Record<Exclude<CapacityUnitId, "tr">, string> = {
  btuh: "BTU",
  kbtuh: "MBH",
  mmbtuh: "MMBTU/hr",
  btumin: "BTU/min",
  btus: "BTU/s",
  kw: "kW (cooling)",
  w: "W (cooling)",
  hp: "hp",
};

const tons = (n: string) => `${n} ${plural(n, "ton", "tons")}`;

/** Homepage and converter copy (build prompt §10.2, §8.6). Numbers arrive pre-formatted by the engine. */
export const home = {
  meta: {
    title: "BTU to Tons Calculator [12,000 BTU/hr = 1 Ton]",
    description:
      "Convert BTU/hr to tons instantly and see what size AC it is. Compare AC capacities, use common shortcuts and see cooling kW with clear formulas.",
  },
  h1: "BTU to Tons Calculator",
  subheading:
    "Enter your AC's BTU rating to see its size in tons. 12,000 BTU/hr = 1 ton.",

  converter: {
    directionLabel: "Conversion direction",
    directions: { "to-tons": "BTU/hr → tons", "to-btuh": "Tons → BTU/hr" },
    inputLabel: {
      "to-tons": "Your AC's cooling capacity",
      "to-btuh": "Size in tons",
    },
    inputHint: {
      "to-tons": "Find it on the AC's label or spec sheet.",
      "to-btuh": "Enter the size in tons, like 1.5.",
    },
    placeholder: { "to-tons": "e.g. 18000", "to-btuh": "e.g. 1.5" },
    unitLabel: "Unit",
    tonsUnit: "refrigeration tons",
    /** Shown in the result panel while the field holds text that isn't a valid number. */
    invalidPrompt: "The result appears once the number is valid.",
    empty: {
      "to-tons": {
        rule: "12,000 BTU/hr = 1 ton",
        prompt: "Type a rating to see its size in tons.",
      },
      "to-btuh": {
        rule: "1 ton = 12,000 BTU/hr",
        prompt: "Type a size in tons to see BTU/hr.",
      },
    },
    bigUnit: {
      "to-tons": (n: string) => plural(n, "ton", "tons"),
      "to-btuh": () => "BTU/hr",
    },
    secondary: { btuh: "BTU/hr", coolingKw: "Cooling kW" },
    resultNote:
      "1 refrigeration ton = 12,000 BTU/hr. Cooling kW is cooling capacity, not electricity use.",
    /** Screen-reader announcement: the sentence, then the precise value when the sentence rounds it. */
    announcement: (sentence: string, value: string | null) =>
      value ? `${sentence} ${value}.` : sentence,
  },

  sentence: {
    /** BTU/hr (or other capacity unit) → tons. */
    toTons(
      value: string,
      unit: Exclude<CapacityUnitId, "tr">,
      size:
        | { type: "class"; cls: string }
        | { type: "between"; lower: string; upper: string }
        | { type: "outside"; tons: string },
    ): Segment[] {
      const lead = `Your ${value} ${SENTENCE_UNIT[unit]} AC is `;
      switch (size.type) {
        case "class":
          return [
            { text: `${lead}a ` },
            { text: `${size.cls} ton`, strong: true },
            { text: " AC." },
          ];
        case "between":
          return [
            { text: `${lead}between the ` },
            { text: `${size.lower} and ${size.upper} ton`, strong: true },
            { text: " sizes." },
          ];
        case "outside":
          return [
            { text: lead },
            { text: tons(size.tons), strong: true },
            { text: "." },
          ];
      }
    },
    /** Tons → BTU/hr. */
    toBtuh(t: string, btuh: string): Segment[] {
      return [
        {
          text: `${t} refrigeration ${plural(t, "ton", "tons")} ${plural(t, "equals", "equal")} `,
        },
        { text: `${btuh} BTU per hour`, strong: true },
        { text: "." },
      ];
    },
  },

  sizeClass: {
    cls: (cls: string, exact: string): Segment[] => [
      { text: `Sold as a ${cls} ton AC.`, strong: true },
      { text: ` Exact: ${tons(exact)}.` },
    ],
    between: (lower: string, upper: string, exact: string): Segment[] => [
      { text: `Between the ${lower} and ${upper} ton sizes.`, strong: true },
      { text: ` Exact: ${tons(exact)}.` },
    ],
    infoLabel: "About AC size names",
    info: "ACs are named by nominal size. A 1.5 ton AC is 18,000 BTU/hr nominal; the rated capacity on the spec sheet can be a little higher or lower.",
  },

  math: {
    toggle: "Show the math",
    /** Heading of the always-open math on a printout. */
    printHeading: "The math",
    formulas: (perTon: string, wPerBtuh: string) => [
      `Tons = BTU/hr ÷ ${perTon}`,
      `Cooling kW = BTU/hr × ${wPerBtuh} ÷ 1,000`,
    ],
    yourNumbers: "Your numbers",
    precisionLabel: "Decimal places",
  },

  actions: {
    copy: "Copy result",
    copied: "Copied",
    copyFailed: "Couldn't copy. Select the numbers and copy them instead.",
    share: "Share link",
    linkCopied: "Link copied",
    reset: "Reset",
    shareTitle: "BTU to Tons",
    /** Plain-text result for the clipboard. */
    copyText: ({
      input,
      outputs,
      size,
      equation,
    }: {
      input: string;
      outputs: string[];
      size: string | null;
      equation: string;
    }) =>
      [`${[input, ...outputs].join(" = ")}.`, size, `Calculation: ${equation}.`]
        .filter(Boolean)
        .join(" "),
    print: "Print",
    embed: "Embed",
    embedDialog: {
      title: "Embed this calculator",
      body: "Paste this code into your website or blog post to add the free BTU to tons converter. It loads from btutotons.com, links back to it and stays up to date.",
      codeLabel: "Embed code",
      copyCode: "Copy code",
      codeCopied: "Code copied",
      copyFailed: "Couldn't copy. Select the code and copy it instead.",
      close: "Close",
      /** The iframe's accessible name on the host page. */
      frameTitle: "BTU to Tons Calculator",
      credit: "Calculator by",
    },
  },

  /** Homepage links to every published conversion page (D106). */
  conversions: {
    heading: "All BTU and ton conversions",
    intro:
      "Each page shows the answer, the calculation and nearby capacities, with the converter ready for another value.",
    groups: {
      btu: "BTU/hr to tons",
      ton: "Tons to BTU/hr",
      unit: "Cooling kW and other units",
      calculators: "Calculators",
    },
  },

  /** Homepage section 04 (spec p. 17): compare lives at /#compare, the list tool on its own page. */
  tools: {
    heading: "Compare two ratings or convert a list",
    intro:
      "Check the difference between two capacities, or paste multiple values for a downloadable conversion table.",
    compare: "Compare two ratings",
    batch: "Convert a list",
  },

  quickValues: {
    heading: "Common AC ratings",
    /** Read before the visible "6,000 BTU/hr" so the button's name is "Convert 6,000 BTU/hr". */
    buttonVerb: "Convert",
    /** Spec p. 17, section 03. */
    hint: "Choose a capacity to fill the calculator, or open its worked example.",
    detailsLabel: "Worked examples:",
    /** Accessible name of a details link; starts with the visible number. */
    detailsLink: (n: string) => `${n} BTU to Tons`,
  },
} as const;
