import Link from "next/link";

import { site } from "@/config/site";
import { getContent } from "@/content";
import { CHART_ANCHOR, routes } from "@/registry/routes";

import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-lg px-3 text-ink hover:bg-muted";

/**
 * Logo, nav and theme toggle. "Converters" joins the nav when its target
 * exists, so the header never links to a missing page (D073).
 */
export function SiteHeader() {
  const { nav } = getContent().common;
  return (
    <header className="border-b border-border bg-surface">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 text-lg font-semibold text-ink"
        >
          {site.name}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label={nav.label}>
            <ul className="flex items-center">
              <li>
                <Link
                  href={`${routes.home.path}#${CHART_ANCHOR}`}
                  className={NAV_LINK}
                >
                  {nav.chart}
                </Link>
              </li>
              <li>
                <Link href={routes.nameplate.path} className={NAV_LINK}>
                  {nav.guides}
                </Link>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
