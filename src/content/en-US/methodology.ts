/**
 * /methodology/ copy (build prompt §10.4). Every fact comes from
 * docs/STANDARDS-CHEATSHEET.md; numbers arrive pre-formatted by the engine.
 */
export const methodology = {
  meta: {
    title: "Methodology [Constants, Sources and Rounding]",
    description:
      "How BTU to Tons converts cooling capacity: the 12,000 BTU/hr refrigeration ton, NIST's International Table BTU, how AC size names are matched and how numbers are rounded.",
  },
  h1: "Methodology",
  opening:
    "Every result on this site comes from one calculation engine. This page lists its constants, formulas, sources and rounding rules.",

  constants: {
    heading: "Constants",
    rows: {
      ton: (btuh: string) =>
        [
          "1 refrigeration ton",
          `${btuh} BTU/hr`,
          "Exact. The US refrigeration ton.",
        ] as const,
      btu: (joules: string) =>
        ["1 BTU", `${joules} J`, "International Table BTU (BTU_IT)."] as const,
      watt: (watts: string) =>
        [
          "1 BTU/hr",
          `${watts} W`,
          "From the BTU_IT, divided by 3,600 seconds.",
        ] as const,
      hp: (watts: string) =>
        [
          "1 horsepower",
          `${watts} W`,
          "Mechanical horsepower (550 ft·lbf/s). Used only on the horsepower pages.",
        ] as const,
      tonKw: (kw: string) =>
        [
          "1 refrigeration ton",
          `${kw} cooling kW`,
          "Derived from the rows above; rounded to 6 decimal places.",
        ] as const,
    },
    columns: ["Quantity", "Value"],
    note: "“Ton” always means the US refrigeration ton: a rate of heat removal, never weight or refrigerant charge.",
  },

  formulas: {
    heading: "Formulas",
    intro:
      "Every input is first converted to BTU/hr. Results are then calculated from that value:",
    lines: (perTon: string, wPerBtuh: string) => [
      `Tons = BTU/hr ÷ ${perTon}`,
      `BTU/hr = tons × ${perTon}`,
      `Cooling kW = BTU/hr × ${wPerBtuh} ÷ 1,000`,
    ],
    unitsHeading: "Input units",
    unitsIntro: "How each input unit becomes BTU/hr:",
    unitColumns: ["Unit", "To BTU/hr"],
    sameUnit: "No change",
    kwNote:
      "Cooling kW and cooling W are cooling capacity, not the electricity the AC uses.",
  },

  sources: {
    heading: "Sources",
    items: [
      {
        name: "NIST SI conversion factors (Special Publication 811, Appendix B.8)",
        href: "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8",
        use: "International Table BTU and refrigeration-ton conversion basis.",
      },
    ],
  },

  sizeClasses: {
    heading: "AC size names",
    intro:
      "ACs are sold by nominal size, and the rated capacity on a spec sheet can sit a little above or below it. To name the size of an AC you already have, this site uses its own documented convention:",
    steps: (band: string) => [
      `A value within ${band} of a nominal size gets that size's name.`,
      "If two sizes are that close, the closer one wins; an exact tie reads “between”.",
      "A value between two sizes but not close to either reads “between” too.",
      "Outside the list, only the exact tons show.",
    ],
    list: (sizes: string) => `Nominal sizes: ${sizes} tons.`,
    notAdvice:
      "A size name describes an AC; it isn't a recommendation for your space.",
  },

  rounding: {
    heading: "Rounding and limits",
    items: (max: string) => [
      "Calculations keep full precision; only the display rounds.",
      "Choose 2, 4 or 6 decimal places (4 by default). Whole numbers drop trailing zeros, so 2 tons shows as “2”.",
      "A value too small to show reads “less than” the smallest step, such as “less than 0.0001” at 4 decimal places, never zero.",
      "CSV downloads keep up to 12 significant digits.",
      `Inputs from 0 to ${max} in the chosen unit are accepted. Negative numbers, scientific notation and decimal commas are rejected with a message.`,
    ],
  },

  version: {
    heading: "Version",
    engine: (v: string) => `Calculation engine version ${v}.`,
    /** Shown only once site.releaseDate is set. */
    updated: (date: string) => `Method updated: ${date}.`,
  },
} as const;
