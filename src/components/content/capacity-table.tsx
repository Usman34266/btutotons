import Link from "next/link";

import { getContent } from "@/content";
import type { CapacityRow } from "@/lib/capacity-rows";
import { cn } from "@/lib/cn";
import type { PageLink } from "@/lib/numeric-page";

export interface CapacityTableRow {
  key: string;
  cells: CapacityRow;
  /** Lead cell links here; null for the current page's own row. */
  link: PageLink | null;
}

const CELL = "px-2 py-2.5 sm:px-3";
const NUM = `${CELL} text-right font-mono tabular-nums whitespace-nowrap`;

/**
 * Equivalent capacities in normal HTML. `lead` is the column the rows are
 * keyed by (it comes first and carries the link). Fits 360px; any overflow
 * scrolls inside its own focusable region, never the page.
 */
export function CapacityTable({
  id,
  caption,
  captionVisible = false,
  rows,
  lead,
}: {
  id: string;
  caption: string;
  captionVisible?: boolean;
  rows: readonly CapacityTableRow[];
  lead: "btuh" | "tons";
}) {
  const cols = getContent().common.capacityColumns;
  const order =
    lead === "btuh" ? (["btuh", "tons"] as const) : (["tons", "btuh"] as const);
  const captionId = `${id}-caption`;

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className="max-w-3xl overflow-x-auto rounded-xl border border-border bg-surface"
    >
      <table className="w-full border-collapse text-[0.9375rem] sm:text-base">
        <caption
          id={captionId}
          className={cn(
            captionVisible
              ? "px-2 pt-3 pb-1 text-left text-label text-muted-foreground sm:px-3"
              : "sr-only",
          )}
        >
          {caption}
        </caption>
        <thead className="text-label text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className={`${CELL} text-left`}>
              {cols[order[0]]}
            </th>
            <th scope="col" className={`${CELL} text-right`}>
              {cols[order[1]]}
            </th>
            <th scope="col" className={`${CELL} text-right`}>
              {cols.coolingKw}
            </th>
            <th scope="col" className={`${CELL} text-left`}>
              {cols.sizeClass}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={cn(
                "border-b border-border last:border-b-0",
                !row.link && "bg-accent-soft",
              )}
            >
              <th
                scope="row"
                className="px-2 py-0 text-left font-mono font-medium whitespace-nowrap tabular-nums sm:px-3"
              >
                {row.link ? (
                  <Link
                    href={row.link.href}
                    aria-label={row.link.label}
                    className="-mx-1 inline-flex min-h-11 items-center rounded px-1 text-ink underline underline-offset-4 hover:text-accent"
                  >
                    {row.cells[order[0]]}
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 items-center">
                    {row.cells[order[0]]}
                  </span>
                )}
              </th>
              <td className={NUM}>{row.cells[order[1]]}</td>
              <td className={NUM}>{row.cells.coolingKw}</td>
              <td className={`${CELL} text-left`}>{row.cells.sizeClass}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
