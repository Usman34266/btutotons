/** /tons-to-btu/ copy (spec p. 24, p. 17; build prompt §10.4). */
export const tonsToBtu = {
  meta: {
    title: "Tons to BTU Calculator [12,000 BTU/hr per Ton]",
    description:
      "Convert refrigeration tons to BTU/hr instantly. Check common AC capacities, see the multiply-by-12,000 formula and compare cooling ratings.",
  },
  h1: "Tons to BTU Calculator",
  opening:
    "1 ton = 12,000 BTU/hr. Enter a refrigeration-ton rating to see its equivalent capacity.",

  sections: {
    formula: {
      heading: "Reverse formula",
      body: "To reverse the conversion, multiply refrigeration tons by 12,000. For example:",
      example: (equation: string) => `${equation} BTU/hr`,
    },
    ratings: {
      heading: "Common ton ratings",
      intro:
        "These are equivalent capacities. A matching size does not tell you if an AC is right for your room.",
      rowLink: (t: string) => `${t} Ton to BTU Converter`,
    },
    sizing: { heading: "Capacity vs sizing" },
  },
} as const;
