import Link from "next/link";

import {
  PROSE_LINK,
  ProsePage,
  ProseSection,
} from "@/components/layout/prose-page";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/registry/routes";

export const metadata = pageMetadata("terms");

export default function TermsPage() {
  const { terms } = getContent();
  return (
    <ProsePage route="terms" h1={terms.h1}>
      <div className="flex flex-col gap-10">
        {terms.sections.map((s, i) => (
          <ProseSection
            key={s.heading}
            id={`terms-${i}`}
            heading={s.heading}
            body={s.body}
          />
        ))}
        <div className="flex max-w-prose flex-col gap-3">
          <p>
            <Link href={routes.methodology.path} className={PROSE_LINK}>
              {terms.methodLink}
            </Link>
          </p>
          {site.releaseDate && (
            <p>{terms.updated(formatDate(site.releaseDate))}</p>
          )}
        </div>
      </div>
    </ProsePage>
  );
}
