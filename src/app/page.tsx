import { CompareSection } from "@/components/compare/compare-section";
import { Converter } from "@/components/converter/converter";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { COMPARE_ANCHOR } from "@/registry/routes";

const { home } = getContent();

export const metadata = pageMetadata("home");

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Container className="flex flex-col gap-4 py-6 md:gap-6 md:py-10">
          <div className="flex flex-col gap-2">
            <h1>{home.h1}</h1>
            <p className="text-lg text-muted-foreground">{home.subheading}</p>
          </div>
          <Converter />

          <section
            id={COMPARE_ANCHOR}
            aria-labelledby="tools-heading"
            className="flex scroll-mt-4 flex-col gap-4 pt-6 md:pt-10"
          >
            <div className="flex flex-col gap-2">
              <h2 id="tools-heading">{home.tools.heading}</h2>
              <p className="max-w-prose text-muted-foreground">
                {home.tools.intro}
              </p>
            </div>
            <CompareSection />
          </section>
        </Container>
      </main>
    </>
  );
}
