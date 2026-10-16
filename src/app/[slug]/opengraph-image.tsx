import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogImage } from "@/lib/og/card";
import { numericPageBySlug } from "@/lib/numeric-page";
import { numericRouteId } from "@/registry/routes";

export { generateStaticParams } from "./page";

export const dynamic = "force-static";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = ogAlt();

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = numericPageBySlug((await params).slug);
  if (!page) throw new Error("Unknown numeric page");
  return ogImage(numericRouteId(page));
}
