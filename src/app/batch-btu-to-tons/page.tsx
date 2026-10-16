import { BatchConverter } from "@/components/batch/batch-converter";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { SiteHeader } from "@/components/layout/site-header";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("batch");

export default function BatchPage() {
  const { batch } = getContent();
  const { paste, columns, invalid } = batch.sections;
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-6 py-6 md:py-10">
          <PageBreadcrumb route="batch" />
          <div className="flex flex-col gap-2">
            <h1>{batch.h1}</h1>
            <p className="text-lg text-muted-foreground">{batch.opening}</p>
            <p className="text-muted-foreground">{batch.privacy}</p>
          </div>

          <BatchConverter />

          <div className="flex max-w-prose flex-col gap-10 pt-4">
            <section className="flex flex-col gap-3">
              <h2>{paste.heading}</h2>
              {paste.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <section className="flex flex-col gap-3">
              <h2>{columns.heading}</h2>
              <p>{columns.intro}</p>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
                {columns.items.map(([name, meaning]) => (
                  <div key={name} className="contents">
                    <dt className="font-mono text-[0.9375rem] font-medium">
                      {name}
                    </dt>
                    <dd className="mb-2 sm:mb-0">{meaning}</dd>
                  </div>
                ))}
              </dl>
              {columns.notes.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>

            <section className="flex flex-col gap-3">
              <h2>{invalid.heading}</h2>
              {invalid.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}
