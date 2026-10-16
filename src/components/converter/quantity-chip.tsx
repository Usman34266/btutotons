import { Snowflake, Thermometer, Zap, type LucideIcon } from "lucide-react";

import { getContent } from "@/content";
import type { QuantityKind } from "@/engine";
import { cn } from "@/lib/cn";

const KIND_STYLE: Record<
  QuantityKind,
  { Icon: LucideIcon; className: string }
> = {
  capacity: { Icon: Snowflake, className: "text-accent" },
  electrical: { Icon: Zap, className: "text-electric" },
  energy: { Icon: Thermometer, className: "text-energy" },
};

/**
 * Labels what a number measures. Icon + text, never color alone. Always on
 * its own surface fill so electric/success text keeps 4.5:1 (D041).
 */
export function QuantityChip({
  kind,
  className,
}: {
  kind: QuantityKind;
  className?: string;
}) {
  const { Icon, className: tone } = KIND_STYLE[kind];
  return (
    <span
      data-kind={kind}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current/35 bg-surface px-2.5 py-1 text-label",
        tone,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-4" />
      {getContent().unitsGlossary.quantityKinds[kind]}
    </span>
  );
}
