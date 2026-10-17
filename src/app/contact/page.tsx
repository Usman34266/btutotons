import Link from "next/link";

import {
  PROSE_LINK,
  ProsePage,
  ProseSection,
} from "@/components/layout/prose-page";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { pageMetadata } from "@/lib/metadata";
import { routes } from "@/registry/routes";

export const metadata = pageMetadata("contact");

/** Listed (sitemap, footer, indexing) only once site.contactEmail is set (D106). */
export default function ContactPage() {
  const { contact } = getContent();
  return (
    <ProsePage route="contact" h1={contact.h1} lead={contact.lead}>
      <div className="flex flex-col gap-10 pt-4">
        <p className="max-w-prose text-lg" data-testid="contact-email">
          {site.contactEmail ? (
            <>
              {contact.email}{" "}
              <a href={`mailto:${site.contactEmail}`} className={PROSE_LINK}>
                {site.contactEmail}
              </a>
            </>
          ) : (
            contact.pending
          )}
        </p>
        {contact.sections.map((s, i) => (
          <ProseSection
            key={s.heading}
            id={`contact-${i}`}
            heading={s.heading}
            body={s.body}
          />
        ))}
        <p className="max-w-prose">
          <Link href={routes.methodology.path} className={PROSE_LINK}>
            {contact.methodLink}
          </Link>
        </p>
      </div>
    </ProsePage>
  );
}
