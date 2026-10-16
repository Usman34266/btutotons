import Link from "next/link";

import { getContent } from "@/content";
import { routeCopy } from "@/lib/metadata";
import { routes, type RouteDef } from "@/registry/routes";

import { Container } from "./container";

/** Live pages only (spec p. 7). */
const TOOL_ROUTES = [
  routes.home,
  routes["tons-to-btu"],
  routes.batch,
  routes.nameplate,
];
const SITE_ROUTES = [
  routes.about,
  routes.methodology,
  routes.privacy,
  routes.terms,
] as const;

const LINK =
  "-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent";

const toolName = (r: RouteDef) =>
  r.id === "home" ? getContent().home.h1 : routeCopy(r).breadcrumb;

function FooterNav({
  id,
  heading,
  links,
}: {
  id: string;
  heading: string;
  links: readonly { key: string; href: string; name: string }[];
}) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="text-label text-muted-foreground">
        {heading}
      </h2>
      <ul className="mt-2 flex flex-wrap gap-x-6">
        {links.map((l) => (
          <li key={l.key}>
            <Link href={l.href} className={LINK}>
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  const { footer } = getContent().common;
  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <Container className="flex flex-col gap-6 py-6">
        <FooterNav
          id="footer-tools"
          heading={footer.relatedTools}
          links={TOOL_ROUTES.map((r) => ({
            key: r.id,
            href: r.path,
            name: toolName(r),
          }))}
        />
        <FooterNav
          id="footer-site"
          heading={footer.siteLinks}
          links={SITE_ROUTES.map((r) => ({
            key: r.id,
            href: r.path,
            name: footer.names[r.id],
          }))}
        />
      </Container>
    </footer>
  );
}
