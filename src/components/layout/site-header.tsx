import Link from "next/link";

import { getContent } from "@/content";
import { CHART_ANCHOR, routes } from "@/registry/routes";

import { CalculatorsMenu } from "./calculators-menu";
import { Container } from "./container";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINK =
  "inline-flex min-h-11 items-center rounded-lg px-2 text-ink hover:bg-muted sm:px-3";

/** Logo, nav (calculators menu, chart, guides) and theme toggle (D115). */
export function SiteHeader() {
  const { nav } = getContent().common;
  return (
    <header className="relative border-b border-border bg-surface">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 text-lg font-semibold text-ink"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label={nav.label}>
            <ul className="flex items-center">
              <li>
                <CalculatorsMenu />
              </li>
              <li className="hidden sm:block">
                <Link
                  href={`${routes.home.path}#${CHART_ANCHOR}`}
                  className={NAV_LINK}
                >
                  {nav.chart}
                </Link>
              </li>
              <li className="hidden sm:block">
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
