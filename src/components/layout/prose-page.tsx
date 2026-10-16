import type { ReactNode } from "react";

import type { StaticRouteId } from "@/registry/routes";

import { Container } from "./container";
import { PageBreadcrumb } from "./page-breadcrumb";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export const PROSE_LINK =
  "rounded text-ink underline underline-offset-4 hover:text-accent";

/** Shell for reading pages (guide, methodology, about, privacy, terms). */
export function ProsePage({
  route,
  h1,
  lead,
  children,
}: {
  route: StaticRouteId;
  h1: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-6 py-6 md:py-10">
          <PageBreadcrumb route={route} />
          <div className="flex max-w-prose flex-col gap-2">
            <h1>{h1}</h1>
            {lead && <p className="text-lg text-muted-foreground">{lead}</p>}
          </div>
          {children}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

/** An H2 section of plain paragraphs. */
export function ProseSection({
  id,
  heading,
  body,
  children,
}: {
  id: string;
  heading: string;
  body?: readonly string[];
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex max-w-prose flex-col gap-3">
      <h2 id={id}>{heading}</h2>
      {body?.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {children}
    </section>
  );
}
