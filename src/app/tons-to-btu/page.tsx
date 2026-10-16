import { CapacityTable } from "@/components/content/capacity-table";
import { Converter } from "@/components/converter/converter";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getContent } from "@/content";
import { capacity, convertCapacity, formatInputValue } from "@/engine";
import { capacityRowOf } from "@/lib/capacity-rows";
import { pageMetadata } from "@/lib/metadata";
import { TON_PAGE_VALUES, tonPageSlug } from "@/registry/numeric-pages";

export const metadata = pageMetadata("tons-to-btu");

/** The worked example in "Reverse formula" (spec p. 17 uses 2 tons ↔ 24,000 BTU/hr). */
const EXAMPLE_TONS = 2;

export default function TonsToBtuPage() {
  const { tonsToBtu, numericTemplate } = getContent();
  const { formula, ratings, sizing } = tonsToBtu.sections;
  const example = convertCapacity(capacity(EXAMPLE_TONS, "tr")).equation;
  const rows = TON_PAGE_VALUES.map((tons) => ({
    key: String(tons),
    cells: capacityRowOf(capacity(tons, "tr")),
    link: {
      href: `/${tonPageSlug(tons)}/` as const,
      label: ratings.rowLink(formatInputValue(tons)),
    },
  }));

  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-6 py-6 md:py-10">
          <PageBreadcrumb route="tons-to-btu" />
          <div className="flex flex-col gap-2">
            <h1>{tonsToBtu.h1}</h1>
            <p className="text-lg text-muted-foreground">{tonsToBtu.opening}</p>
          </div>

          <Converter initial={{ direction: "to-btuh" }} />

          <div className="flex max-w-prose flex-col gap-10 pt-4">
            <section aria-labelledby="formula" className="flex flex-col gap-3">
              <h2 id="formula">{formula.heading}</h2>
              <p>{formula.body}</p>
              <p
                data-testid="worked-example"
                className="rounded-lg border border-border bg-surface px-4 py-3 font-mono text-[0.9375rem] tabular-nums"
              >
                {formula.example(example)}
              </p>
            </section>

            <section aria-labelledby="ratings" className="flex flex-col gap-3">
              <h2 id="ratings">{ratings.heading}</h2>
              <p>{ratings.intro}</p>
              <CapacityTable
                id="ratings-table"
                caption={ratings.heading}
                rows={rows}
                lead="tons"
              />
            </section>

            <section aria-labelledby="sizing" className="flex flex-col gap-3">
              <h2 id="sizing">{sizing.heading}</h2>
              {numericTemplate.fits.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          </div>
        </Container>
      </main>
      <SiteFooter />
      <JsonLd route="tons-to-btu" />
    </>
  );
}
