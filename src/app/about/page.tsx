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

export const metadata = pageMetadata("about");

export default function AboutPage() {
  const { about } = getContent();
  return (
    <ProsePage route="about" h1={about.h1} lead={about.lead}>
      <div className="flex flex-col gap-10 pt-4">
        {about.sections.map((s, i) => (
          <ProseSection
            key={s.heading}
            id={`about-${i}`}
            heading={s.heading}
            body={s.body}
          />
        ))}
        <div className="flex max-w-prose flex-col gap-3">
          <p>
            <Link href={routes.methodology.path} className={PROSE_LINK}>
              {about.methodLink}
            </Link>
          </p>
          {site.operator && <p>{about.operator(site.operator)}</p>}
          {site.contactEmail && (
            <p>
              {about.contact}{" "}
              <a href={`mailto:${site.contactEmail}`} className={PROSE_LINK}>
                {site.contactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </ProsePage>
  );
}
