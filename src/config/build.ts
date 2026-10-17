/**
 * Build-time switches. NEXT_PUBLIC_ so server and client bundles read the
 * same value (some client components import the route registry).
 */

/** `pnpm build:preview`: also export unpublished pages, noindex, for testing (D100). */
export const PREVIEW_UNPUBLISHED =
  process.env.NEXT_PUBLIC_BTUTOTONS_PREVIEW === "1";
