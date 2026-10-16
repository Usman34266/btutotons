/** Site-wide UI strings. */
export const common = {
  themeToggle: "Switch between light and dark theme",
  skipToContent: "Skip to main content",
  breadcrumb: "Breadcrumb",

  /** Header links; each is added only when its target exists (D073). */
  nav: { label: "Main", chart: "Chart" },

  footer: {
    relatedTools: "Related tools",
  },

  /** Size class in table cells (chart, comparison tables, batch). */
  sizeClassCell: {
    cls: (t: string) => `${t} ton`,
    between: (lower: string, upper: string) =>
      `Between ${lower} and ${upper} ton`,
    outside: "—",
  },

  /** Capacity table headers (chart, comparison tables). */
  capacityColumns: {
    btuh: "BTU/hr",
    tons: "Tons",
    coolingKw: "Cooling kW",
    sizeClass: "Size class",
  },
} as const;
