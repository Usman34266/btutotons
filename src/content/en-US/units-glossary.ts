/** Unit explanations and quantity-kind labels (build prompt §9.4, §10.7). Exact copy. */
export const unitsGlossary = {
  terms: {
    btuh: {
      label: "BTU/hr",
      body: "How much heat an AC removes each hour. AC labels often drop the '/hr'.",
    },
    ton: {
      label: "Ton",
      body: "12,000 BTU/hr. It comes from the cooling of melting a ton of ice per day — not the AC's weight.",
    },
    coolingKw: {
      label: "Cooling kW",
      body: "Cooling capacity in metric units. Not the electricity the AC uses.",
    },
    eer: {
      label: "EER",
      body: "Cooling per watt of electricity. US EER is BTU/Wh; European EER is W/W.",
    },
  },
  whatIs: (label: string) => `What is ${label}?`,
  quantityKinds: {
    capacity: "Cooling capacity",
    electrical: "Electrical input",
    energy: "Thermal energy",
  },
  iceBlocksCaption: "1 ton = the cooling of melting 2,000 lb of ice per day.",
} as const;

export type GlossaryTerm = keyof typeof unitsGlossary.terms;
