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
  /** 1 cooling W in BTU/hr, 6 decimals: "3.412142". */
  btuhPerW: string;
  /** W_PER_HP, every digit: "745.69987158227022". */
  wPerHp: string;
  /** 1 hp in BTU/hr, 2 decimals: "2,544.43". */
  btuhPerHp: string;
  /** 3 tons in cooling kW, 2 decimals: "10.55". */
  kwFor3Tons: string;
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
  /** Replaces the homepage field label and hint when the input isn't an AC rating in BTU/hr. */
  field?: { label: string; hint: string };
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
        body: (f) => [
          NOT_ELECTRICITY,
          `A 3-ton AC has about ${f.kwFor3Tons} kW of cooling capacity. That is not ${f.kwFor3Tons} kW of electrical input.`,
          ESTIMATE_INPUT,
        ],
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
    field: {
      label: "Cooling capacity in kW",
      hint: "Use the cooling kW from the spec sheet, not the electrical input kW.",
    },
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
  "mbh-to-btu": {
    meta: {
      title: "MBH to BTU/hr Calculator [Formula & Examples]",
      description:
        "Convert MBH to BTU/hr: 1 MBH is 1,000 BTU/hr. See refrigeration tons and cooling kW too, and how MBH differs from MMBTU/hr.",
    },
    h1: "MBH to BTU/hr Calculator",
    field: {
      label: "Capacity in MBH",
      hint: "MBH means thousands of BTU per hour, as on a spec sheet or equipment schedule.",
    },
    opening: "Multiply MBH by 1,000 to get BTU per hour (BTU/hr).",
    sections: [
      {
        heading: "What MBH means",
        body: () => [
          "MBH is 1,000 BTU/hr. The M stands for thousand, not million. It is the same unit as kBTU/hr.",
          "MMBTU/hr is a different unit: 1 MMBTU/hr is 1,000,000 BTU/hr, or 1,000 MBH.",
        ],
      },
      { heading: "Worked example", body: () => [], example: true },
      {
        heading: "Heating and cooling ratings",
        body: () => [
          "The conversion is the same for heating and cooling capacity: 1 MBH is always 1,000 BTU/hr.",
          "A spec sheet can list more than one MBH figure. Check which one you're reading before you compare.",
          "Refrigeration tons describe cooling capacity: 1 ton is 12,000 BTU/hr, so 36 MBH is 3 tons.",
        ],
      },
    ],
  },
  "btu-to-mbh": {
    meta: {
      title: "BTU to MBH Calculator [1 MBH = 1,000 BTU/hr]",
      description:
        "Convert BTU/hr to MBH by dividing by 1,000. See a worked example, plus refrigeration tons and cooling kW for the same capacity.",
    },
    h1: "BTU/hr to MBH Calculator",
    opening: "Divide BTU per hour (BTU/hr) by 1,000 to get MBH.",
    sections: [
      {
        heading: "BTU/hr to MBH formula",
        body: () => ["MBH = BTU/hr ÷ 1,000. MBH is the same unit as kBTU/hr."],
        example: true,
      },
      {
        heading: "MBH vs MMBTU/hr",
        body: () => [
          "The M in MBH means thousand. MMBTU/hr means million BTU/hr, so 1 MMBTU/hr is 1,000 MBH.",
        ],
      },
    ],
  },
  "watts-to-btu": {
    meta: {
      title: "Watts to BTU/hr Calculator [Formula & Examples]",
      description:
        "Convert cooling watts to BTU/hr: 1 W is about 3.412 BTU/hr. Learn why an AC's electrical input watts are a different quantity.",
    },
    h1: "Watts to BTU/hr Calculator",
    field: {
      label: "Cooling capacity in watts",
      hint: "Use the cooling (thermal) watts from the spec sheet, not the input power.",
    },
    opening:
      "Multiply cooling watts by about 3.412 to get BTU per hour (BTU/hr).",
    sections: [
      {
        heading: "Watts to BTU/hr formula",
        body: (f) => [
          `BTU/hr = cooling W ÷ ${f.wPerBtuh}.`,
          `In one step, multiply cooling W by about ${f.btuhPerW}.`,
          "Cooling watts are also called thermal watts: the heat an AC removes per second.",
        ],
        example: true,
      },
      {
        heading: "Electrical watts differ",
        body: () => [
          "An AC that draws 1,000 W of electricity does not deliver only 3,412 BTU/hr of cooling. Input power and cooling capacity are different quantities.",
          "Working out cooling capacity from input watts needs the AC's efficiency rating.",
        ],
      },
    ],
  },
  "btu-to-watts": {
    meta: {
      title: "BTU to Watts Calculator [Thermal Power Conversion]",
      description:
        "Convert BTU/hr to cooling watts, with cooling kW and refrigeration tons alongside. Electrical watts need the AC's rated input or efficiency.",
    },
    h1: "BTU/hr to Watts Calculator",
    opening:
      "Multiply BTU per hour (BTU/hr) by 0.2930710701722222 to get cooling watts.",
    sections: [
      {
        heading: "BTU/hr to watts formula",
        body: (f) => [
          `Cooling W = BTU/hr × ${f.wPerBtuh}.`,
          `The factor comes from the International Table BTU: 1 BTU = ${f.jPerBtu} joules, and an hour has 3,600 seconds.`,
          "Cooling watts are also called thermal watts.",
        ],
        example: true,
      },
      {
        heading: "Cooling watts vs electrical watts",
        body: () => [
          "The result is cooling capacity, not the electricity the AC uses.",
          "An AC's electrical watts come from its rated input on the label or spec sheet, or from an efficiency rating. They can't be converted directly from BTU/hr.",
        ],
      },
    ],
  },
  "btu-per-second-to-watts": {
    meta: {
      title: "BTU/s to Watts Calculator [1 BTU/s = 1,055.06 W]",
      description:
        "Convert BTU per second to watts with the International Table BTU. See BTU/hr, refrigeration tons and cooling kW for the same rate.",
    },
    h1: "BTU per Second to Watts Calculator",
    field: {
      label: "Heat rate in BTU/s",
      hint: "BTU per second. Check the time unit: BTU/hr is 3,600 times smaller.",
    },
    opening: "Multiply BTU/s by about 1,055.06 to get watts.",
    sections: [
      {
        heading: "BTU/s to watts formula",
        body: (f) => [
          `One International Table BTU is ${f.jPerBtu} joules, and 1 watt is 1 joule per second. So W = BTU/s × ${f.jPerBtu}.`,
        ],
        example: true,
      },
      {
        heading: "Check your time unit",
        body: () => [
          "1 BTU/s = 60 BTU/min = 3,600 BTU/hr. AC ratings use BTU/hr, so a BTU/s figure is usually from engineering or lab work.",
          "A figure in plain BTU, with no time unit, is energy rather than a rate.",
        ],
      },
    ],
  },
  "btu-to-hp": {
    meta: {
      title: "BTU to Horsepower Calculator [BTU/hr to hp]",
      description:
        "Convert BTU/hr to mechanical horsepower. See the formula and a worked example. A unit equivalence, not motor or compressor sizing.",
    },
    h1: "BTU/hr to Horsepower Calculator",
    opening:
      "Divide BTU per hour (BTU/hr) by about 2,544.43 to get mechanical horsepower.",
    sections: [
      {
        heading: "BTU/hr to hp formula",
        body: (f) => [
          `hp = BTU/hr × ${f.wPerBtuh} ÷ ${f.wPerHp}.`,
          `One mechanical horsepower (550 ft·lbf/s) is ${f.wPerHp} W, or about ${f.btuhPerHp} BTU/hr.`,
        ],
        example: true,
      },
      {
        heading: "What the result means",
        body: () => [
          "This is a unit equivalence between two measures of power. It does not size a motor, compressor or boiler.",
          "This page uses mechanical horsepower only. Metric, electrical and boiler horsepower are different units.",
        ],
      },
    ],
  },
  "hp-to-btu": {
    meta: {
      title: "Horsepower to BTU/hr Calculator [1 hp = 2,544.43 BTU/hr]",
      description:
        "Convert mechanical horsepower to BTU/hr, with refrigeration tons and cooling kW alongside. A unit equivalence, not equipment sizing.",
    },
    h1: "Horsepower to BTU/hr Calculator",
    field: {
      label: "Power in horsepower",
      hint: "Mechanical horsepower (hp). Metric and boiler horsepower are different units.",
    },
    opening:
      "Multiply mechanical horsepower by about 2,544.43 to get BTU per hour (BTU/hr).",
    sections: [
      {
        heading: "hp to BTU/hr formula",
        body: (f) => [
          `BTU/hr = hp × ${f.wPerHp} ÷ ${f.wPerBtuh}.`,
          `In one step, multiply hp by about ${f.btuhPerHp}.`,
        ],
        example: true,
      },
      {
        heading: "What the result means",
        body: () => [
          "This is a unit equivalence between two measures of power. A motor's horsepower rating is not the cooling capacity of the AC it drives.",
          "This page uses mechanical horsepower only. Metric, electrical and boiler horsepower are different units.",
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
  presets: {
    heading: "Common values",
    /** Read before the visible value: "Convert 12,000 BTU/hr". */
    buttonVerb: "Convert",
  },
};
