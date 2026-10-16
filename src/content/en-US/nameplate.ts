/**
 * /ac-tonnage-by-model-number/ copy. Title, H1, opening and H2s from spec
 * p. 26; the description says only what is live (no model lookup, D082).
 * Hotspot and state copy from spec pp. 12, 14 and build prompt §10.4, §10.7.
 */
export type NameplateField =
  "model" | "capacity" | "electrical" | "refrigerant";

export const nameplate = {
  meta: {
    title: "AC Tonnage by Model Number [Nameplate Guide]",
    description:
      "Find the cooling capacity on your AC nameplate and convert it to tons. See which labels aren't tonnage and why model-number codes vary by manufacturer.",
  },
  h1: "Find AC Tonnage by Model Number",
  opening:
    "Start with the rated cooling capacity. Use a model code only when its manufacturer documentation is verified.",

  read: {
    heading: "Read the nameplate",
    intro:
      "Use the rated cooling capacity first. Model-number codes vary by manufacturer and product family.",
    instruction:
      "Select a label on the example nameplate to see what it means.",
  },

  /** The illustration: invented, no real brand; placeholders where a real value could be misread. */
  plate: {
    title: "Air conditioner",
    caption:
      "Example nameplate, not a real product. Layouts vary by manufacturer.",
    fieldsLabel: "Nameplate labels",
    fields: {
      model: { label: "Model no.", value: "XX-XXXXXX" },
      capacity: {
        label: "Cooling capacity",
        value: (n: string) => `${n} BTU/h`,
      },
      electrical: { label: "MCA / MOCP", value: "xx.x A / xx A" },
      refrigerant: { label: "Refrigerant charge", value: "R-xxx · x lb x oz" },
    },
  },

  hotspots: {
    capacity: {
      title: "Cooling capacity",
      verdict: "This is the number to convert",
      body: [
        "How much heat an AC removes each hour. AC labels often drop the '/hr'.",
        "Enter it below to see the size in tons.",
      ],
    },
    electrical: {
      title: "MCA and MOCP",
      verdict: "Electrical, not tonnage",
      body: [
        "Cooling capacity does not determine breaker size. Check the equipment nameplate and installation instructions for minimum circuit ampacity (MCA) and maximum overcurrent protection (MOCP). Have a qualified installer apply the locally adopted electrical code.",
      ],
    },
    refrigerant: {
      title: "Refrigerant charge",
      verdict: "Refrigerant weight, not tons",
      body: [
        "How much refrigerant the system holds, in pounds and ounces. It isn't refrigeration tons and doesn't tell you the cooling capacity.",
      ],
    },
    model: {
      title: "Model number",
      verdict: "Codes vary by manufacturer",
      body: [
        "Model-number codes vary by manufacturer and product family. Don't read tons from a model number unless the manufacturer's documentation for that exact family confirms the code.",
      ],
    },
  } satisfies Record<
    NameplateField,
    { title: string; verdict: string; body: readonly string[] }
  >,

  form: {
    heading: "Convert the rated capacity",
    label: "Rated cooling capacity",
    hint: "Enter the cooling-capacity rating, not power input or refrigerant charge.",
    unitLabel: "Unit",
    placeholder: "e.g. 35000",
    /** Spec p. 12 result label. */
    resultLabel: "Converted rated capacity",
    empty: "Type a rating to see its size in tons.",
    openInCalculator: "Open in the calculator",
  },

  families: {
    heading: "Supported model families",
    body: [
      "Some manufacturers put a capacity code in the model number, but where it sits and what it means vary by manufacturer and product family. A code is reliable only when the manufacturer's documentation for that exact family confirms it.",
      "No model families are verified here yet, so this guide never reads tonnage from a model number. Use the rated cooling capacity on the nameplate instead.",
    ],
  },

  unknown: {
    heading: "Unknown model help",
    body: [
      "We can't verify a model from its number. Enter the rated BTU/hr value from the nameplate, or check the manufacturer's documentation for that exact model.",
      "A system's rated capacity can depend on which indoor and outdoor units are used together, so check the documentation for your combination.",
      "You don't need the serial number.",
    ],
  },
} as const;
