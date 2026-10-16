import { jsonLdText, structuredData } from "@/lib/structured-data";
import type { RouteId } from "@/registry/routes";

/** The one allowed dangerouslySetInnerHTML: JSON-LD built from our own registry. */
export function JsonLd({ route }: { route: RouteId }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdText(structuredData(route)) }}
    />
  );
}
