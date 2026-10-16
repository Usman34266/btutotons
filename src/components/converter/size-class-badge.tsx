import type { Segment } from "@/content";
import { getUiContent } from "@/content/ui";
import { formatInputValue, formatNumber, type SizeClassResult } from "@/engine";

import { InfoPopover } from "./info-popover";
import { Segments } from "./segments";

/** Copy for a size class; empty when the value is outside every class. */
export function sizeClassSegments(
  sizeClass: SizeClassResult,
  tons: number,
): Segment[] {
  const copy = getUiContent().home.sizeClass;
  const exact = formatNumber(tons, { precision: 2 });
  switch (sizeClass.type) {
    case "class":
      return copy.cls(formatInputValue(sizeClass.sizeClass.tons), exact);
    case "between":
      return copy.between(
        formatInputValue(sizeClass.lower.tons),
        formatInputValue(sizeClass.upper.tons),
        exact,
      );
    case "outside":
      return [];
  }
}

/** "Sold as a 1.5 ton AC. Exact: 1.58 tons." Labels an AC; never a recommendation. */
export function SizeClassBadge({
  sizeClass,
  tons,
}: {
  sizeClass: SizeClassResult;
  tons: number;
}) {
  const segments = sizeClassSegments(sizeClass, tons);
  if (segments.length === 0) return null;
  const copy = getUiContent().home.sizeClass;

  return (
    <p data-testid="size-class">
      <Segments segments={segments} />{" "}
      <InfoPopover label={copy.infoLabel} className="text-ink">
        <p>{copy.info}</p>
      </InfoPopover>
    </p>
  );
}
