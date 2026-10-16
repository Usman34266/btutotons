/**
 * /about/, /privacy/ and /terms/. Neither source has copy for these pages
 * (D083): they state only what the code does. The operator and contact
 * lines appear once site.operator / site.contactEmail are set.
 */
export const about = {
  meta: {
    title: "About BTU to Tons",
    description:
      "A free converter from BTU/hr to refrigeration tons for AC owners and HVAC technicians, with the formula and units behind every result.",
  },
  h1: "About BTU to Tons",
  /** Positioning copy, spec p. 5. */
  lead: "Know the capacity. Understand the difference. Convert one rating, compare two systems or work through a full list. See the formula and units behind every result.",
  sections: [
    {
      heading: "Who it's for",
      body: [
        "AC owners reading a BTU rating on a label or spec sheet, and HVAC technicians who need a quick, exact conversion on the job.",
      ],
    },
    {
      heading: "What it does",
      body: [
        "It converts cooling capacity between BTU/hr, refrigeration tons, cooling kW and other capacity units, names the AC size a rating matches, compares two ratings and converts lists of up to 200 values.",
      ],
    },
    {
      heading: "What it doesn't do",
      body: [
        "It doesn't tell you what size AC a space needs, and it never derives a breaker or wire size from tons. Cooling kW is cooling capacity, not the electricity an AC uses.",
      ],
    },
  ],
  methodLink: "How the numbers are calculated",
  operator: (name: string) => `BTU to Tons is run by ${name}.`,
  contact: "Contact:",
} as const;

export const privacy = {
  meta: {
    title: "Privacy Policy | BTU to Tons",
    description:
      "The values you enter stay in your browser. How BTU to Tons counts page views, what it stores on your device and how share links work.",
  },
  h1: "Privacy Policy",
  sections: [
    {
      heading: "Your values stay on your device",
      body: [
        "Every calculation runs in your browser. The numbers you type or paste, including batch lists, are never sent to us or to anyone else.",
        "Copying a result, sharing a link and downloading a CSV happen only when you choose to.",
      ],
    },
    {
      heading: "Share links",
      body: [
        "A share link keeps the value after the # in the address (for example #v=24000&u=btuh). Browsers don't send that part to the server.",
      ],
    },
    {
      heading: "Page views",
      body: [
        "We count page views with Cloudflare Web Analytics, which doesn't use cookies. It never receives the values you enter.",
      ],
    },
    {
      heading: "What's stored on your device",
      body: [
        "No cookies. Your browser's local storage keeps two preferences: light or dark theme, and the number of decimal places. Clearing this site's data removes them; the site works without them.",
      ],
    },
    {
      heading: "Hosting",
      body: [
        "The site is served by Cloudflare, which handles the network requests needed to deliver its pages.",
      ],
    },
  ],
  contact: "Questions about privacy:",
  /** Shown only once site.releaseDate is set. */
  updated: (date: string) => `Last updated: ${date}.`,
} as const;

export const terms = {
  meta: {
    title: "Terms of Use | BTU to Tons",
    description:
      "The terms for using BTU to Tons: results are unit conversions for reference, not professional advice, and the site is provided as is.",
  },
  h1: "Terms of Use",
  sections: [
    {
      heading: "Reference only",
      body: [
        "BTU to Tons is a free reference tool. Its results are unit conversions; they aren't professional advice.",
        "A conversion doesn't tell you whether an AC is the right size for a space, and capacity doesn't determine breaker or wire size. For equipment selection or installation, use a qualified professional, the manufacturer's documentation and the locally adopted codes.",
      ],
    },
    {
      heading: "No warranty",
      body: [
        "We check every formula against published constants, but the site is provided as is, without warranties of any kind. You're responsible for how you use the results.",
      ],
    },
    {
      heading: "Changes",
      body: ["We may update the tool and these terms at any time."],
    },
  ],
  methodLink: "How the numbers are calculated",
  /** Shown only once site.releaseDate is set. */
  updated: (date: string) => `Last updated: ${date}.`,
} as const;
