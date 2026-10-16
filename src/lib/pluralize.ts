/** Singular only when the displayed number reads exactly "1" (or "+1"). */
export const isSingularText = (displayed: string): boolean =>
  displayed.replace(/^[+-]/, "") === "1";

export const plural = (
  displayed: string,
  singular: string,
  pluralForm: string,
): string => (isSingularText(displayed) ? singular : pluralForm);
