import { Converter } from "@/components/converter/converter";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/registry/routes";

/** Unlisted: noindex, outside the sitemap (registry `listed: false`). */
export const metadata = pageMetadata("embed");

/** The converter alone, for iframes on other sites (D106). Framing is allowed for this path only. */
export default function EmbedPage() {
  const { embedPage } = getContent();
  return (
    <main id="main" className="flex flex-col gap-3 p-2 sm:p-4">
      <h1 className="sr-only">{embedPage.h1}</h1>
      <Converter embedded />
      <p className="text-right text-label text-muted-foreground">
        {embedPage.poweredBy}{" "}
        <a
          href={new URL(routes.home.path, site.url).href}
          target="_blank"
          rel="noopener"
          className="text-ink underline underline-offset-4 hover:text-accent"
        >
          {site.name}
        </a>
      </p>
    </main>
  );
}
