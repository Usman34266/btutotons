import Link from "next/link";

import { getContent } from "@/content";
import { routeCopy } from "@/lib/metadata";
import { routes } from "@/registry/routes";

import { Container } from "./container";

/** Live tools only (spec p. 7). About, methodology, privacy and terms join in M6. */
const FOOTER_ROUTES = [routes.home, routes["tons-to-btu"], routes.batch];

const toolName = (r: (typeof FOOTER_ROUTES)[number]) =>
  r.id === "home" ? getContent().home.h1 : routeCopy(r).breadcrumb;

export function SiteFooter() {
  const { common } = getContent();
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <Container className="py-6">
        <nav aria-labelledby="footer-tools">
          <h2 id="footer-tools" className="text-label text-muted-foreground">
            {common.footer.relatedTools}
          </h2>
          <ul className="mt-2 flex flex-wrap gap-x-6">
            {FOOTER_ROUTES.map((r) => (
              <li key={r.id}>
                <Link
                  href={r.path}
                  className="-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent"
                >
                  {toolName(r)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
