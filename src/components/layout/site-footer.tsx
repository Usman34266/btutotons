import Link from "next/link";

import { site } from "@/config/site";
import { getContent } from "@/content";
import { routeCopy } from "@/lib/metadata";
import { isPublished, routes, type RouteDef } from "@/registry/routes";

import { Container } from "./container";
import { Logo } from "./logo";

/** Live pages only (spec p. 7). */
const TOOL_ROUTES = [
  routes.home,
  routes["tons-to-btu"],
  routes.batch,
  routes.nameplate,
];
/** Contact joins once it's listed (a real address exists, D106). */
const SITE_ROUTES = [
  routes.about,
  routes.methodology,
  routes.privacy,
  routes.terms,
  routes.contact,
].filter(isPublished);

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
      <ul className="mt-2 flex flex-wrap gap-x-6 sm:flex-col sm:items-start">
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
      <Container className="grid gap-8 py-8 md:grid-cols-12">
        <div className="flex flex-col gap-2 md:col-span-5">
          <Link
            href={routes.home.path}
            className="-mx-2 inline-flex min-h-11 items-center self-start rounded-lg px-2 text-lg font-semibold text-ink"
          >
            <Logo />
          </Link>
          <p className="max-w-xs text-muted-foreground">{footer.tagline}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:col-span-7">
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
        </div>
        <p className="border-t border-border pt-6 text-sm text-muted-foreground md:col-span-12">
          {footer.copyright(new Date().getFullYear(), site.name)}
        </p>
      </Container>
    </footer>
  );
}
