import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PROSE_LINK } from "@/components/layout/prose-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getContent } from "@/content";
import { CHART_ANCHOR, routes } from "@/registry/routes";

const { notFound } = getContent().common;

export const metadata: Metadata = {
  title: notFound.title,
  robots: { index: false },
};

const LINKS = [
  { href: routes.home.path, name: notFound.links.home },
  { href: `${routes.home.path}#${CHART_ANCHOR}`, name: notFound.links.chart },
  { href: routes["tons-to-btu"].path, name: notFound.links.reverse },
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-4 py-10 md:py-16">
          <h1>{notFound.h1}</h1>
          <p className="max-w-prose text-lg">{notFound.body}</p>
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`-mx-1 inline-flex min-h-11 items-center px-1 ${PROSE_LINK}`}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
