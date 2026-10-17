import type { UnitPageSlug } from "@/registry/unit-pages";

/** Numbers the bodies quote, formatted by the engine (lib/unit-page.ts). */
export interface UnitFacts {
  /** 1 ton in cooling kW, 6 decimals: "3.516853". */
  kwPerTon: string;
  /** W_PER_BTUH, every digit: "0.2930710701722222". */
  wPerBtuh: string;
  /** J_PER_BTU: "1,055.05585262". */
  jPerBtu: string;
  /** 1 cooling kW in BTU/hr, 6 decimals: "3,412.141633". */
  btuhPerKw: string;
}

export interface UnitSection {
  heading: string;
  body: (f: UnitFacts) => readonly string[];
  /** Shows the worked example (sentence and equation) after the body. */
  example?: true;
  /** Shows the page's table of common values after the body. */
  table?: true;
}

export interface UnitPageCopy {
  meta: { title: string; description: string };
  h1: string;
  opening: string;
  sections: readonly UnitSection[];
}

const NOT_ELECTRICITY = "Cooling kW is not the electricity the AC uses.";
const ESTIMATE_INPUT =
  "To estimate electrical input, you need an efficiency rating or measured input watts.";

/** Spec pp. 24–25 for meta, H1, opening and H2s ("cooling kW", never "thermal kW": D100). */
export const unitPages: Record<UnitPageSlug, UnitPageCopy> = {
  "kw-to-tons": {
    meta: {
      title: "kW to Tons Calculator [3.517 kW per Ton]",
      description:
        "Convert cooling kilowatts to refrigeration tons with a clear formula and examples. Use cooling capacity, not electrical input power.",
    },
    h1: "kW to Tons Calculator",
    opening:
      "Enter cooling kW. Divide by approximately 3.516853 to calculate refrigeration tons.",
    sections: [
      {
        heading: "Cooling kW explained",
        body: (f) => [
          "Cooling kW is cooling capacity in metric units: how much heat an AC removes.",
          `One refrigeration ton is 12,000 BTU/hr, which equals ${f.kwPerTon} cooling kW.`,
        ],
      },
      { heading: "Conversion example", body: () => [], example: true },
      {
        heading: "Electrical input differs",
        body: () => [
          `${NOT_ELECTRICITY} Electrical input depends on efficiency and operating conditions.`,
          ESTIMATE_INPUT,
        ],
      },
    ],
  },
  "tons-to-kw": {
    meta: {
      title: "Tons to kW Calculator [Cooling Power Explained]",
      description:
        "Convert refrigeration tons to cooling kW. See the 3.516853 kW-per-ton factor and learn why cooling output differs from electricity use.",
    },
    h1: "Tons to kW Calculator",
    opening: "One refrigeration ton equals approximately 3.516853 cooling kW.",
    sections: [
      {
        heading: "Tons to kW formula",
        body: (f) => [
          `Multiply refrigeration tons by 12,000 to get BTU/hr, then multiply by ${f.wPerBtuh} and divide by 1,000 to get cooling kW.`,
          `In one step, multiply tons by about ${f.kwPerTon}.`,
        ],
        example: true,
      },
      {
        heading: "Common ratings",
        body: () => [
          "Nominal AC sizes from half a ton to 5 tons, in BTU/hr and cooling kW.",
        ],
        table: true,
      },
      {
        heading: "Estimate input power",
        body: () => [NOT_ELECTRICITY, ESTIMATE_INPUT],
      },
    ],
  },
  "btu-to-kw": {
    meta: {
      title: "BTU to kW Calculator [Capacity + Formula]",
      description:
        "Convert BTU/hr to cooling kW instantly. View a worked example and common ratings, with a clear distinction between capacity and electricity use.",
    },
    h1: "BTU/hr to kW Calculator",
    opening: "Multiply BTU/hr by 0.0002930710701722222 to obtain cooling kW.",
    sections: [
      {
        heading: "BTU/hr to kW formula",
        body: (f) => [
          `Cooling kW = BTU/hr × ${f.wPerBtuh} ÷ 1,000.`,
          `The factor comes from the International Table BTU: 1 BTU = ${f.jPerBtu} joules.`,
        ],
      },
      { heading: "Example conversion", body: () => [], example: true },
      {
        heading: "What the result means",
        body: () => [
          `The result is the same cooling capacity in metric units. ${NOT_ELECTRICITY}`,
        ],
      },
    ],
  },
  "kw-to-btu": {
    meta: {
      title: "kW to BTU Calculator [1 kW = 3,412.14 BTU/hr]",
      description:
        "Convert cooling kW to BTU/hr with an editable calculator, formula and examples. Electrical input requires efficiency to infer AC cooling capacity.",
    },
    h1: "kW to BTU/hr Calculator",
    opening: "One cooling kilowatt equals approximately 3,412.142 BTU/hr.",
    sections: [
      {
        heading: "kW to BTU/hr formula",
        body: (f) => [
          `BTU/hr = cooling kW × 1,000 ÷ ${f.wPerBtuh}.`,
          `In one step, multiply cooling kW by about ${f.btuhPerKw}.`,
        ],
        example: true,
      },
      {
        heading: "Common values",
        body: () => ["Cooling kW values in BTU/hr and refrigeration tons."],
        table: true,
      },
      {
        heading: "Cooling vs electrical kW",
        body: () => [
          "This page converts cooling kW: the heat an AC removes. An electrical kW figure is the power the AC draws, which is a different quantity.",
          "Working out cooling capacity from electrical input needs the AC's efficiency rating.",
        ],
      },
    ],
  },
  "btu-per-minute-to-tons": {
    meta: {
      title: "BTU/min to Tons Calculator [200 BTU/min = 1 Ton]",
      description:
        "Convert BTU per minute to refrigeration tons. Normalize the time unit, see a worked calculation and compare equivalent BTU/hr and cooling kW.",
    },
    h1: "BTU per Minute to Tons Calculator",
    opening:
      "Multiply BTU/min by 60, then divide by 12,000. Equivalently, divide BTU/min by 200.",
    sections: [
      {
        heading: "Minute-to-hour step",
        body: () => [
          "An hour has 60 minutes, so BTU/min × 60 = BTU/hr. Dividing by 12,000 then gives refrigeration tons.",
        ],
      },
      { heading: "Worked example", body: () => [], example: true },
      {
        heading: "Reverse conversion",
        body: () => [
          "To convert refrigeration tons to BTU/min, multiply by 200: 1 ton = 200 BTU/min.",
        ],
      },
    ],
  },
  "btu-per-second-to-tons": {
    meta: {
      title: "BTU/s to Tons Calculator [Time-Unit Formula]",
      description:
        "Convert BTU per second to refrigeration tons with the correct time factor. See BTU/hr and cooling kW alongside a worked example.",
    },
    h1: "BTU per Second to Tons Calculator",
    opening: "Multiply BTU/s by 0.3 to obtain refrigeration tons.",
    sections: [
      {
        heading: "Second-to-hour step",
        body: () => [
          "An hour has 3,600 seconds, so BTU/s × 3,600 = BTU/hr. Dividing by 12,000 then gives refrigeration tons.",
        ],
      },
      {
        heading: "Formula",
        body: () => [
          "Refrigeration tons = BTU/s × 0.3, because 3,600 ÷ 12,000 = 0.3.",
        ],
        example: true,
      },
      {
        heading: "Check your time unit",
        body: () => [
          "BTU/s, BTU/min and BTU/hr differ by a factor of 60 at each step: 1 ton = 200 BTU/min = 12,000 BTU/hr.",
          "A rating in plain BTU, with no time unit, is energy rather than capacity.",
        ],
      },
    ],
  },
};

/** The unit-pair converter. Field label and hint reuse home.converter. */
export const unitPair = {
  placeholder: (example: string) => `e.g. ${example}`,
  emptyPrompt: (from: string, to: string) =>
    `Enter a value in ${from} to see it in ${to}.`,
  /** "3.5 cooling kW equals 0.9952 refrigeration tons." / "2 refrigeration tons equal 7.0337 cooling kW." */
  sentence: (input: string, output: string, pluralInput: boolean) =>
    `${input} ${pluralInput ? "equal" : "equals"} ${output}.`,
  secondary: { tons: "Refrigeration tons" },
};
