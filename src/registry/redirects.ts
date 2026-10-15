/**
 * Permanent redirects, emitted to public/_redirects at prebuild.
 * Paths use trailing slashes; the generator also emits the slashless form.
 * Numeric-page aliases are added in M5 together with their target pages.
 */
export interface RedirectRule {
  from: `/${string}/`;
  to: `/${string}`;
  status: 301;
}

export const redirects: readonly RedirectRule[] = [
  { from: "/btu-to-tons-calculator/", to: "/", status: 301 },
];
