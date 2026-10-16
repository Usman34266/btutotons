import {
  PROSE_LINK,
  ProsePage,
  ProseSection,
} from "@/components/layout/prose-page";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("privacy");

export default function PrivacyPage() {
  const { privacy } = getContent();
  return (
    <ProsePage route="privacy" h1={privacy.h1}>
      <div className="flex flex-col gap-10">
        {privacy.sections.map((s, i) => (
          <ProseSection
            key={s.heading}
            id={`privacy-${i}`}
            heading={s.heading}
            body={s.body}
          />
        ))}
        {(site.contactEmail || site.releaseDate) && (
          <div className="flex max-w-prose flex-col gap-3">
            {site.contactEmail && (
              <p>
                {privacy.contact}{" "}
                <a href={`mailto:${site.contactEmail}`} className={PROSE_LINK}>
                  {site.contactEmail}
                </a>
              </p>
            )}
            {site.releaseDate && (
              <p>{privacy.updated(formatDate(site.releaseDate))}</p>
            )}
          </div>
        )}
      </div>
    </ProsePage>
  );
}
