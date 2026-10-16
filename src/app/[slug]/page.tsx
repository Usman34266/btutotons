import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CapacityTable } from "@/components/content/capacity-table";
import { Converter } from "@/components/converter/converter";
import { Segments } from "@/components/converter/segments";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { numericPageBySlug, numericPageModel } from "@/lib/numeric-page";
import { NUMERIC_PAGES } from "@/registry/numeric-pages";
import { numericRouteId } from "@/registry/routes";

/** Only the curated registry pages exist; any other slug is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return NUMERIC_PAGES.map(({ slug }) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = numericPageBySlug((await params).slug);
  return page ? pageMetadata(numericRouteId(page)) : {};
}

export default async function NumericPage({ params }: Props) {
  const page = numericPageBySlug((await params).slug);
  if (!page) notFound();

  const copy = getContent().numericTemplate;
  const m = numericPageModel(page);
  const lead = page.kind === "btu" ? "btuh" : "tons";

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-6 py-6 md:py-10">
          <PageBreadcrumb route={numericRouteId(page)} />
          <div className="flex flex-col gap-2">
            <h1>{m.h1}</h1>
            <p data-testid="answer" className="max-w-prose text-lg">
              <Segments segments={m.answer} />
            </p>
          </div>

          <Converter initial={m.converterInitial} />

          <div className="flex max-w-prose flex-col gap-10 pt-4">
            <section aria-labelledby="how" className="flex flex-col gap-3">
              <h2 id="how">{copy.howHeading}</h2>
              <p>{m.method}</p>
              <p
                data-testid="worked-example"
                className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[0.9375rem] tabular-nums"
              >
                {m.equation}
              </p>
              <p>{m.coolingKw}</p>
            </section>

            <section
              aria-labelledby="compare-heading"
              className="flex flex-col gap-3"
            >
              <h2 id="compare-heading">{m.compareHeading}</h2>
              <CapacityTable
                id="nearby"
                caption={m.compareHeading}
                lead={lead}
                rows={m.rows.map(({ slug, link, ...cells }) => ({
                  key: slug,
                  cells,
                  link,
                }))}
              />
            </section>

            <section aria-labelledby="fits" className="flex flex-col gap-3">
              <h2 id="fits">{m.fitsHeading}</h2>
              {copy.fits.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <nav aria-labelledby="more" className="flex flex-col gap-2">
              <h2 id="more">{copy.links.heading}</h2>
              <ul className="flex flex-col">
                {m.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
