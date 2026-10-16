import { useId } from "react";

import { getUiContent } from "@/content/ui";
import {
  formatInputValue,
  type BatchRow,
  type ConversionResult,
  type Precision,
} from "@/engine";
import { capacityRow } from "@/lib/capacity-rows";

const NUM = "px-3 py-2.5 text-right font-mono tabular-nums whitespace-nowrap";
const TEXT = "px-3 py-2.5 text-left";

function OkCells({
  result,
  precision,
}: {
  result: ConversionResult;
  precision: Precision;
}) {
  const row = capacityRow(result, precision);
  return (
    <>
      <td className={`${TEXT} font-mono tabular-nums`}>
        {formatInputValue(result.input.value)}
      </td>
      <td className={NUM}>{row.btuh}</td>
      <td className={NUM}>{row.tons}</td>
      <td className={NUM}>{row.coolingKw}</td>
      <td className={`${TEXT} whitespace-nowrap`}>{row.sizeClass}</td>
    </>
  );
}

/**
 * Every pasted line keeps its place. Invalid lines show their line number and
 * the reason instead of results. Scrolls sideways on narrow screens, inside
 * its own focusable region (the page itself never scrolls sideways).
 */
export function BatchTable({
  rows,
  precision,
}: {
  rows: readonly BatchRow[];
  precision: Precision;
}) {
  const { batch, errors } = getUiContent();
  const cols = batch.table.columns;
  const captionId = useId();

  return (
    <div
      role="region"
      aria-labelledby={captionId}
      tabIndex={0}
      className="overflow-x-auto rounded-xl border border-border bg-surface"
    >
      <table className="w-full min-w-[42rem] border-collapse">
        <caption id={captionId} className="sr-only">
          {batch.table.caption}
        </caption>
        <thead className="text-label text-muted-foreground">
          <tr className="border-b border-border">
            <th scope="col" className={TEXT}>
              {cols.line}
            </th>
            <th scope="col" className={TEXT}>
              {cols.input}
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {cols.btuh}
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {cols.tons}
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {cols.coolingKw}
            </th>
            <th scope="col" className={TEXT}>
              {cols.sizeClass}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.line}
              data-status={row.status}
              className="border-b border-border last:border-b-0"
            >
              <th scope="row" className={`${TEXT} font-medium`}>
                {row.line}
              </th>
              {row.status === "ok" ? (
                <OkCells result={row.result} precision={precision} />
              ) : (
                <>
                  <td className={`${TEXT} font-mono wrap-anywhere`}>
                    {row.raw}
                  </td>
                  <td colSpan={4} className={`${TEXT} font-medium text-danger`}>
                    {errors[row.error.code]}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
