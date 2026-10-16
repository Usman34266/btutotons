/** Slugs use digits without commas; a decimal point becomes a hyphen (1.5 → "1-5"). */
export const numberSlug = (value: number): string =>
  String(value).replace(".", "-");
