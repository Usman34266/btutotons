import { CompareSection } from "@/components/compare/compare-section";
import { ConversionLinks } from "@/components/content/conversion-links";
import {
  Explainer,
  NameplateTeaser,
  ReferenceChart,
  TrustAndFaq,
} from "@/components/content/reference-sections";
import { Converter } from "@/components/converter/converter";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { COMPARE_ANCHOR } from "@/registry/routes";

const { home } = getContent();

export const metadata = pageMetadata("home");

/**
 * Sections 01–06, 08 and 10–11 (build prompt §10.1). Room sizing and
 * next-step sections (07, 09) appear when their pages are live.
 */
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

          <div className="flex flex-col gap-12 pt-6 md:gap-16 md:pt-10">
            <ReferenceChart />
            <Explainer />
            <NameplateTeaser />
            <ConversionLinks />
            <TrustAndFaq />
          </div>
        </Container>
      </main>
      <SiteFooter />
      <JsonLd route="home" />
    </>
  );
}
