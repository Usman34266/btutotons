import Link from "next/link";

import { getContent } from "@/content";
import { conversionGroups } from "@/lib/conversion-links";

const LINK =
  "-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent";

/** Homepage: links to every published conversion page, grouped by direction (D106). */
export function ConversionLinks() {
  const { conversions } = getContent().home;
  return (
    <section
      aria-labelledby="conversions-heading"
      className="flex flex-col gap-4"
      data-testid="conversion-links"
    >
      <div className="flex flex-col gap-2">
        <h2 id="conversions-heading">{conversions.heading}</h2>
        <p className="max-w-prose text-muted-foreground">{conversions.intro}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {conversionGroups().map((g) => (
          <nav
            key={g.id}
            aria-labelledby={`conversions-${g.id}`}
            className="flex flex-col gap-1"
          >
            <h3 id={`conversions-${g.id}`} className="text-label text-ink">
              {g.heading}
            </h3>
            <ul className="flex flex-col">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={LINK}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </section>
  );
}
