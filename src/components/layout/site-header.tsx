import Link from "next/link";

import { site } from "@/config/site";

import { Container } from "./container";
import { ThemeToggle } from "./theme-toggle";

/**
 * Logo + theme toggle. Nav links (Converters · Chart · Guides) are added in M5,
 * when their targets exist, so the header never links to a missing page.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 text-lg font-semibold text-ink"
        >
          {site.name}
        </Link>
        <ThemeToggle />
      </Container>
    </header>
  );
}
