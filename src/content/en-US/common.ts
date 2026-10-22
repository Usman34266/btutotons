/** Site-wide UI strings. */
export const common = {
  themeToggle: "Switch between light and dark theme",
  skipToContent: "Skip to main content",
  breadcrumb: "Breadcrumb",

  /** Header links; each is added only when its target exists (D073, D082). */
  nav: {
    label: "Main",
    chart: "Chart",
    guides: "Guides",
    /** Header menu of every calculator (D115); "Menu" below 640px, where it also holds Chart and Guides. */
    calculators: "Calculators",
    menu: "Menu",
    menuGroups: {
      tons: "BTU and tons",
      kw: "Cooling kW and watts",
      other: "MBH and horsepower",
    },
  },

  footer: {
    tagline:
      "Convert AC ratings between BTU/hr, refrigeration tons and cooling kW.",
    relatedTools: "Related tools",
    /** "© 2026 BTU to Tons. Built with ♥ …"; the year is the build year (D116). */
    copyright: (year: number, name: string) =>
      `© ${year} ${name}. Built with ♥ for HVAC professionals and curious minds.`,
    siteLinks: "About this site",
    /** Link names; the pages' own H1s are longer. */
    names: {
      about: "About",
      methodology: "Methodology",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
    },
  },

  notFound: {
    title: "Page not found | BTU to Tons",
    h1: "Page not found",
    body: "This page doesn't exist. Try the converter or the conversion chart.",
    links: {
      home: "BTU to Tons Calculator",
      chart: "BTU to tons conversion chart",
      reverse: "Tons to BTU Calculator",
    },
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
