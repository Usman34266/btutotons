import Link from "next/link";

import { IceBlocks } from "@/components/visuals/ice-blocks";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { capacity, formatInputValue } from "@/engine";
import { capacityRowOf } from "@/lib/capacity-rows";
import { formatDate } from "@/lib/date";
import { BTU_PAGE_VALUES, btuPageSlug } from "@/registry/numeric-pages";
import { CHART_ANCHOR, routes } from "@/registry/routes";

import { CapacityTable } from "./capacity-table";

const LINK = "text-ink underline underline-offset-4 hover:text-accent rounded";

/** Homepage section 05: the 12 chart rows, each linked to its numeric page. */
export function ReferenceChart() {
  const { chart } = getContent().reference;
  const rows = BTU_PAGE_VALUES.map((btuh) => ({
    key: String(btuh),
    cells: capacityRowOf(capacity(btuh, "btuh")),
    link: {
      href: `/${btuPageSlug(btuh)}/` as const,
      label: chart.rowLink(formatInputValue(btuh)),
    },
  }));
  return (
    <section
      id={CHART_ANCHOR}
      aria-labelledby="chart-heading"
      className="flex scroll-mt-4 flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <h2 id="chart-heading">{chart.heading}</h2>
        <p className="max-w-prose text-muted-foreground">{chart.intro}</p>
      </div>
      <CapacityTable
        id="chart-table"
        caption={chart.caption}
        captionVisible
        rows={rows}
        lead="btuh"
      />
    </section>
  );
}

/** Homepage section 06: what the units mean and how to convert. */
export function Explainer() {
  const { explainer } = getContent().reference;
  return (
    <section
      aria-labelledby="explainer-heading"
      className="flex max-w-prose flex-col gap-3"
    >
      <h2 id="explainer-heading">{explainer.heading}</h2>
      <p>{explainer.body}</p>
      <IceBlocks tons={1} className="py-2" />
      <h3 className="pt-2">{explainer.formulaHeading}</h3>
      <p>{explainer.formula}</p>
      <p>
        <Link href={routes["tons-to-btu"].path} className={LINK}>
          {explainer.reverseLink}
        </Link>
      </p>
    </section>
  );
}

/** Homepage section 10: method, then the FAQ. Reviewer and date only when real. */
export function TrustAndFaq() {
  const { trust, faq } = getContent().reference;
  return (
    <div className="flex max-w-prose flex-col gap-10">
      <div
        data-testid="trust"
        className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 md:p-6"
      >
        <p>
          <strong className="font-semibold">{trust.label}</strong>{" "}
          {trust.method}
          {site.releaseDate &&
            ` ${trust.updated(formatDate(site.releaseDate))}`}
        </p>
        {site.reviewer && (
          <p>
            {trust.reviewedBy(
              site.reviewer.name,
              site.reviewer.credentials,
              formatDate(site.reviewer.reviewedOn),
            )}
          </p>
        )}
      </div>

      <section aria-labelledby="faq-heading" className="flex flex-col gap-6">
        <h2 id="faq-heading">{faq.heading}</h2>
        {faq.items.map(({ q, a }) => (
          <div key={q} className="flex flex-col gap-1.5">
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
