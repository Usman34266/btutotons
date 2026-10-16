import type { Metadata } from "next";

import { Converter } from "@/components/converter/converter";
import { Container } from "@/components/layout/container";
import { SiteHeader } from "@/components/layout/site-header";
import { getContent } from "@/content";

const { home } = getContent();

export const metadata: Metadata = {
  title: home.meta.title,
  description: home.meta.description,
  alternates: { canonical: "/" },
};

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
        </Container>
      </main>
    </>
  );
}
