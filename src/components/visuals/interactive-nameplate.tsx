"use client";

import { Ban, Hash, Snowflake, Zap, type LucideIcon } from "lucide-react";
import { useState } from "react";

import type { NameplateField } from "@/content";
import { getUiContent } from "@/content/ui";
import { cn } from "@/lib/cn";

/** Plate order, top to bottom; the key below uses the same numbers. */
const FIELDS: readonly NameplateField[] = [
  "model",
  "capacity",
  "electrical",
  "refrigerant",
];

const VERDICT_STYLE: Record<
  NameplateField,
  { Icon: LucideIcon; className: string }
> = {
  capacity: { Icon: Snowflake, className: "text-accent" },
  electrical: { Icon: Zap, className: "text-electric" },
  refrigerant: { Icon: Ban, className: "text-muted-foreground" },
  model: { Icon: Hash, className: "text-muted-foreground" },
};

const keyId = (field: NameplateField) => `nameplate-${field}`;

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Marker({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full border font-sans text-sm font-semibold tabular-nums",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-surface text-ink",
      )}
    >
      {n}
    </span>
  );
}

/**
 * An invented nameplate (no real brand) whose labels are hotspots. Every
 * explanation is in the static HTML; a hotspot only highlights its entry.
 */
export function InteractiveNameplate({
  capacityText,
}: {
  /** The example rating, already formatted ("35,000"). */
  capacityText: string;
}) {
  const { plate, hotspots, read } = getUiContent().nameplate;
  const [selected, setSelected] = useState<NameplateField>("capacity");

  const select = (field: NameplateField) => {
    setSelected(field);
    document.getElementById(keyId(field))?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-2">
      <figure className="flex flex-col gap-2 md:sticky md:top-4">
        <div className="rounded-xl border-2 border-ink/60 bg-muted p-3 shadow-card">
          <p className="border-b-2 border-ink/60 pb-2 text-center text-label font-semibold tracking-widest text-ink uppercase">
            {plate.title}
          </p>
          <ul aria-label={plate.fieldsLabel} className="flex flex-col pt-2">
            {FIELDS.map((field, i) => {
              const { label, value } = plate.fields[field];
              const active = selected === field;
              return (
                <li key={field}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-controls={keyId(field)}
                    onClick={() => select(field)}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2 text-left font-mono tabular-nums",
                      active
                        ? "bg-accent-soft ring-2 ring-accent"
                        : "hover:bg-surface",
                    )}
                  >
                    <Marker n={i + 1} active={active} />
                    <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm text-ink uppercase">
                        {label}
                      </span>
                      <span className="font-semibold text-ink">
                        {typeof value === "function"
                          ? value(capacityText)
                          : value}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <figcaption className="text-label text-muted-foreground">
          {plate.caption}
        </figcaption>
      </figure>

      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground">{read.instruction}</p>
        <ol className="flex flex-col gap-3" data-testid="nameplate-key">
          {FIELDS.map((field, i) => {
            const { title, verdict, body } = hotspots[field];
            const { Icon, className } = VERDICT_STYLE[field];
            const active = selected === field;
            return (
              <li
                key={field}
                id={keyId(field)}
                data-active={active || undefined}
                className={cn(
                  "flex scroll-mt-4 gap-3 rounded-xl border p-4 transition-colors",
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-border bg-surface",
                )}
              >
                <Marker n={i + 1} active={active} />
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3>{title}</h3>
                  <p
                    className={cn(
                      "inline-flex items-center gap-1.5 font-medium",
                      active ? "text-ink" : className,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {verdict}
                  </p>
                  {body.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
