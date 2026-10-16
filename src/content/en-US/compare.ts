/** Compare panel copy (spec p. 10, build prompt §8.7). Numbers arrive pre-formatted by the engine. */
export const compare = {
  heading: "Compare two ratings",
  fields: { a: "Rating A", b: "Rating B" },
  unitLabel: { a: "Unit for rating A", b: "Unit for rating B" },
  placeholder: { a: "e.g. 18000", b: "e.g. 24000" },
  prompt: "Enter both ratings to see the difference.",

  /** B relative to A, in words; the numbers are magnitudes. */
  summary: {
    more: (btuh: string) => `B has ${btuh} BTU/hr more capacity.`,
    less: (btuh: string) => `B has ${btuh} BTU/hr less capacity.`,
    same: "A and B have the same capacity.",
  },
  difference: (tons: string, coolingKw: string) =>
    `Difference: ${tons} / ${coolingKw}.`,
  percent: {
    more: (pct: string) => `B is ${pct} higher than A.`,
    less: (pct: string) => `B is ${pct} lower than A.`,
  },
  baselineZero: "Percentage unavailable: baseline is zero.",
  note: "Capacity difference only. Efficiency, room suitability and actual performance are separate.",

  actions: {
    use: { a: "Use A", b: "Use B" },
    /** Read after "Use A", so the button's name is "Use A in the calculator". */
    useSuffix: " in the calculator",
    copy: "Copy comparison",
  },
  copyText: (a: string, b: string, lines: readonly string[]) =>
    [`A: ${a}.`, `B: ${b}.`, ...lines].join(" "),
} as const;
