/**
 * Permanent redirects, emitted to public/_redirects at prebuild.
 * Paths use trailing slashes; the generator also emits the slashless form.
 * Singular/plural spelling variants go to the one canonical page (spec p. 19).
 */
import { numberSlug } from "@/lib/slug";

import { BTU_PAGE_VALUES, TON_PAGE_VALUES } from "./numeric-pages";

export interface RedirectRule {
  from: `/${string}/`;
  to: `/${string}`;
  status: 301;
}

export const redirects: readonly RedirectRule[] = [
  { from: "/btu-to-tons-calculator/", to: "/", status: 301 },
  { from: "/ton-to-btu/", to: "/tons-to-btu/", status: 301 },
  ...BTU_PAGE_VALUES.map((btuh): RedirectRule => ({
    from: `/${numberSlug(btuh)}-btu-to-ton/`,
    to: `/${numberSlug(btuh)}-btu-to-tons/`,
    status: 301,
  })),
  ...TON_PAGE_VALUES.map((tons): RedirectRule => ({
    from: `/${numberSlug(tons)}-tons-to-btu/`,
    to: `/${numberSlug(tons)}-ton-to-btu/`,
    status: 301,
  })),
];
