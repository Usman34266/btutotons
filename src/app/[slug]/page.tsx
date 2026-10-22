import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CapacityTable } from "@/components/content/capacity-table";
import { Converter } from "@/components/converter/converter";
import { PairConverter } from "@/components/converter/pair-converter";
import { Segments } from "@/components/converter/segments";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { numericPageModel, type PageLink } from "@/lib/numeric-page";
import { unitPageModel } from "@/lib/unit-page";
import type { NumericPage } from "@/registry/numeric-pages";
import { SLUG_ROUTES, slugRoute } from "@/registry/routes";
import type { UnitPage } from "@/registry/unit-pages";

/** Only the curated registry pages exist; any other slug is a 404. */
export const dynamicParams = false;

/** Numeric pages, plus unit pages the build exports (unpublished ones only in preview, D100). */
export function generateStaticParams() {
  return SLUG_ROUTES.map(({ path }) => ({ slug: path.slice(1, -1) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = slugRoute((await params).slug);
  return r ? pageMetadata(r.id) : {};
}

export default async function SlugPage({ params }: Props) {
  const r = slugRoute((await params).slug);
  if (!r) notFound();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-6 py-6 md:py-10">
          <PageBreadcrumb route={r.id} />
          {r.numeric ? (
            <NumericTemplate page={r.numeric} />
          ) : (
            r.unit && <UnitTemplate page={r.unit} />
          )}
        </Container>
      </main>
      <SiteFooter />
      <JsonLd route={r.id} />
    </>
  );
}

function NumericTemplate({ page }: { page: NumericPage }) {
  const copy = getContent().numericTemplate;
  const m = numericPageModel(page);
  const lead = page.kind === "btu" ? "btuh" : "tons";

  return (
    <>
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
              current: link === null,
            }))}
          />
        </section>

        <section aria-labelledby="fits" className="flex flex-col gap-3">
          <h2 id="fits">{m.fitsHeading}</h2>
          {copy.fits.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </section>

        <MoreLinks heading={copy.links.heading} links={m.links} />
      </div>
    </>
  );
}

function UnitTemplate({ page }: { page: UnitPage }) {
  const copy = getContent().numericTemplate;
  const m = unitPageModel(page);

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1>{m.h1}</h1>
        <p data-testid="answer" className="max-w-prose text-lg">
          {m.opening}
        </p>
      </div>

      <PairConverter
        pair={m.pair}
        example={page.example}
        presets={page.presets}
        field={m.field}
      />

      <div className="flex max-w-prose flex-col gap-10 pt-4">
        {m.sections.map((s) => (
          <section
            key={s.id}
            aria-labelledby={s.id}
            className="flex flex-col gap-3"
          >
            <h2 id={s.id}>{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.example && (
              <>
                <p>{m.example.sentence}</p>
                <p
                  data-testid="worked-example"
                  className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[0.9375rem] tabular-nums"
                >
                  {m.example.equation}
                </p>
              </>
            )}
            {s.table && m.table && (
              <CapacityTable
                id={`${s.id}-table`}
                caption={m.table.caption}
                lead={m.table.lead}
                rows={m.table.rows}
              />
            )}
          </section>
        ))}

        <MoreLinks heading={copy.links.heading} links={m.links} />
      </div>
    </>
  );
}

function MoreLinks({
  heading,
  links,
}: {
  heading: string;
  links: readonly PageLink[];
}) {
  return (
    <nav aria-labelledby="more" className="flex flex-col gap-2">
      <h2 id="more">{heading}</h2>
      <ul className="flex flex-col">
        {links.map((l) => (
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
  );
}
