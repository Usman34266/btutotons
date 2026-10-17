import { OG_CONTENT_TYPE, OG_SIZE, ogAlt, ogImage } from "@/lib/og/card";
import { slugRoute } from "@/registry/routes";

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
  const r = slugRoute((await params).slug);
  if (!r) throw new Error("Unknown page");
  return ogImage(r.id);
}
