import { plural } from "@/lib/pluralize";

/** /batch-btu-to-tons/ copy (spec p. 26, p. 10; build prompt §8.8). Numbers arrive pre-formatted by the engine. */
export const batch = {
  meta: {
    title: "Batch BTU to Tons [Convert up to 200 Values]",
    description:
      "Paste up to 200 cooling-capacity values, convert them to tons and cooling kW, and download a CSV with row-level validation. No login required.",
  },
  h1: "Batch BTU to Tons Converter",
  opening:
    "Paste one capacity per line and choose the unit shared by the list.",
  privacy: "The list is converted in your browser and never uploaded.",

  form: {
    unitLabel: "Input unit",
    valuesLabel: "Values",
    valuesHint: "One number per line; up to 200.",
    placeholder: "12000\n18000\n24000",
    convert: "Convert list",
    download: "Download CSV",
    fileName: "btu-to-tons.csv",
  },

  errors: {
    empty: "Paste at least one value, one per line.",
    tooMany: (count: string, max: string) =>
      `This list has ${count} values. The limit is ${max} at a time, so nothing was converted. Split the list and convert each part.`,
  },

  /** Polite status after converting: "3 rows converted." / "3 rows: 2 converted, 1 to fix." */
  summary: (total: string, invalid: string) =>
    invalid === "0"
      ? `${total} ${plural(total, "row", "rows")} converted.`
      : `${total} ${plural(total, "row", "rows")}: ${invalid} to fix, the rest converted.`,

  table: {
    caption: "Converted values",
    columns: {
      line: "Line",
      input: "Input",
      btuh: "BTU/hr",
      tons: "Tons",
      coolingKw: "Cooling kW",
      sizeClass: "Size class",
    },
    sizeClass: {
      cls: (t: string) => `${t} ton`,
      between: (lower: string, upper: string) =>
        `Between ${lower} and ${upper} ton`,
      outside: "—",
    },
  },

  sections: {
    paste: {
      heading: "Paste format",
      body: [
        "Put one value per line, up to 200 lines. Blank lines are skipped and don't count.",
        "Thousands separators are fine inside a value, like 24,000. Don't put several values on one line.",
        "Use a dot for decimals, like 1.5. A decimal comma such as 1,5 is rejected because it is ambiguous.",
        "Every value uses the input unit you choose. If the list mixes units, split it and convert each part on its own.",
      ],
    },
    columns: {
      heading: "Export columns",
      intro:
        "The CSV has one row per value, in the order you pasted, with these columns:",
      items: [
        ["row", "Position in the list. Blank lines are not counted."],
        [
          "input_value",
          "The value as read, or the text as pasted if it couldn't be read.",
        ],
        ["input_unit", "The unit you chose for the list."],
        ["BTU_per_hour", "Cooling capacity in BTU/hr."],
        [
          "refrigeration_tons",
          "Cooling capacity in refrigeration tons (12,000 BTU/hr each).",
        ],
        [
          "cooling_kW",
          "Cooling capacity in kW. Not the electricity the AC uses.",
        ],
        [
          "size_class",
          "The AC size name the value matches, like 1.5 ton, a between-sizes note, or empty.",
        ],
        ["status", "ok, or the reason code for a row that couldn't be read."],
      ] as const,
      notes: [
        "Numbers have up to 12 significant digits and no thousands separators.",
        "A cell that starts with =, +, -, @, a tab or a carriage return gets a leading apostrophe, so a spreadsheet shows it as text instead of running it as a formula.",
      ],
    },
    invalid: {
      heading: "Fix invalid rows",
      body: [
        "A line that isn't a valid number keeps its place. The table shows its line number and the reason; every other line still converts, and nothing is dropped.",
        "Fix the line in the box and convert again. In the CSV, that row keeps the text you pasted, the result columns stay empty and status holds the reason code.",
      ],
    },
  },
} as const;
