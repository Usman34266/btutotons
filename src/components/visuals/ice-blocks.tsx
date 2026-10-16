import { getContent } from "@/content";
import { formatCompact, iceBlocks } from "@/engine";
import { cn } from "@/lib/cn";

const BLOCK = { x: 1.5, y: 1.5, width: 29, height: 29, rx: 6 } as const;

function Block({ fill }: { fill: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-8 animate-in duration-200 fade-in-0"
    >
      <rect
        {...BLOCK}
        className="fill-surface stroke-accent"
        strokeWidth="1.5"
      />
      <rect
        {...BLOCK}
        className="origin-bottom fill-accent/30 transition-transform duration-200 ease-out [transform-box:fill-box]"
        style={{ transform: `scaleY(${fill})` }}
      />
      {/* Corner glint: reads as ice, not as a plain square. */}
      <path
        d="M7.5 14V10.5a3 3 0 0 1 3-3H14"
        className="fill-none stroke-accent/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Zero tons: one fully melted (dashed, empty) block, so the row never looks broken. */
function MeltedBlock() {
  return (
    <svg viewBox="0 0 32 32" className="size-8">
      <rect
        {...BLOCK}
        className="fill-none stroke-accent/60"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
    </svg>
  );
}

/**
 * One ice block per refrigeration ton (partial for fractions, max 6 + "+N").
 * Decorative: the exact number is always shown as text next to it.
 * Fill changes scale from the bottom (melt/form); static under reduced motion.
 * On the --accent-soft result panel pass captionClassName="text-ink" (D043).
 */
export function IceBlocks({
  tons,
  className,
  captionClassName = "text-muted-foreground",
}: {
  tons: number;
  className?: string;
  captionClassName?: string;
}) {
  const { fills, overflowTons } = iceBlocks(tons);

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <div
        aria-hidden="true"
        className="flex min-h-8 flex-wrap items-end gap-1.5"
      >
        {fills.length === 0 ? (
          <MeltedBlock />
        ) : (
          fills.map((fill, i) => <Block key={i} fill={fill} />)
        )}
        {overflowTons > 0 && (
          <span className="pb-1 text-label text-accent">
            +{formatCompact(overflowTons)}
          </span>
        )}
      </div>
      <figcaption className={cn("text-label", captionClassName)}>
        {getContent().unitsGlossary.iceBlocksCaption}
      </figcaption>
    </figure>
  );
}
