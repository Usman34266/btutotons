/**
 * Homepage sections 05, 06 and 10 (spec pp. 17–18, build prompt §10.1–10.9).
 * Where the two give different wording, the plainer one is used (D073).
 */
export const reference = {
  chart: {
    heading: "BTU to tons conversion chart",
    intro:
      "These are equivalent capacities. A matching size does not tell you if an AC is right for your room.",
    /** Spec p. 18: label the rows as examples, not as sizes sold in every category. */
    caption: "Common capacity examples",
    rowLink: (n: string) => `${n} BTU to Tons`,
  },

  explainer: {
    heading: "What do BTU/hr and refrigeration tons mean?",
    body: "BTU is a unit of thermal energy. BTU/hr measures the rate of heat transfer. A refrigeration ton is another capacity unit, equal to 12,000 BTU/hr; it is not the unit's weight.",
    formulaHeading: "How to convert BTU/hr to tons",
    formula:
      "Divide BTU/hr by 12,000. For example, 24,000 ÷ 12,000 = 2 tons. To reverse the conversion, multiply refrigeration tons by 12,000.",
    reverseLink: "Tons to BTU Calculator",
  },

  trust: {
    label: "Method:",
    method:
      "standard refrigeration-ton conversion using International Table BTU (NIST). Calculations are shown for reference. Size classes and estimates use separate, documented assumptions.",
    /** Shown only once site.releaseDate is set. */
    updated: (date: string) => `Method updated: ${date}.`,
    /** Shown only once site.reviewer is set. */
    reviewedBy: (name: string, credentials: string, date: string) =>
      `Reviewed by ${name}, ${credentials}, on ${date}.`,
  },

  faq: {
    heading: "Frequently asked questions",
    /**
     * Spec p. 18 plus the 19,000 BTU question (build prompt §10.8).
     * "Can I size a whole-home AC here?" and "Can the model number identify
     * tonnage?" wait until the room tool and nameplate guide are live (D073).
     */
    items: [
      {
        q: "How many BTU are in one ton?",
        a: "One refrigeration ton equals 12,000 BTU per hour. Confirm that the rating is a rate, not total energy.",
      },
      {
        q: "Is 24,000 BTU a 2-ton AC?",
        a: "A 24,000 BTU/hr cooling rating equals 2 tons. Actual rated performance can differ from a nominal model size.",
      },
      {
        q: "What size AC is 19,000 BTU?",
        a: "About 1.58 tons, which is sold as a 1.5 ton AC. ACs are named by nominal size, so the rated BTU/hr on the spec sheet is often a little above or below the size name.",
      },
      {
        q: "Are tons the weight of the AC?",
        a: "No. Refrigeration tons measure heat-transfer capacity, not equipment weight or refrigerant mass.",
      },
      {
        q: "Does 1 ton use 3.517 kW of electricity?",
        a: "No. About 3.517 kW is its cooling capacity. Electrical input depends on efficiency and operating conditions.",
      },
      {
        q: "Can I convert total BTU to tons?",
        a: "Provide a duration: divide BTU by hours, then divide by 12,000. Without time, total BTU converts to ton-hours.",
      },
      {
        q: "How many square feet can 2 tons cool?",
        a: "There is no universal area-to-tonnage ratio. Room conditions, building design and climate affect the required capacity.",
      },
      {
        q: "Does this work for heat pumps?",
        a: "It converts a stated capacity rating. Heating and cooling capacities can differ and change with outdoor conditions.",
      },
      {
        q: "Can tonnage tell me the breaker size?",
        a: "No. Use the nameplate and installation requirements; capacity is not electrical input or circuit protection.",
      },
    ],
  },
} as const;
