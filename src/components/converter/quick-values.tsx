import { getContent } from "@/content";
import { formatInputValue } from "@/engine";

/** Common ratings that fill the calculator (BTU/hr). */
export const QUICK_VALUES_BTUH = [
  6_000, 9_000, 12_000, 18_000, 24_000, 36_000,
] as const;

export function QuickValues({ onSelect }: { onSelect(btuh: number): void }) {
  const copy = getContent().home.quickValues;
  return (
    <section
      aria-labelledby="quick-values-heading"
      className="flex flex-col gap-3"
    >
      <h2 id="quick-values-heading" className="text-label text-ink">
        {copy.heading}
      </h2>
      <ul className="grid grid-cols-3 gap-2">
        {QUICK_VALUES_BTUH.map((btuh) => {
          const shown = formatInputValue(btuh);
          return (
            <li key={btuh}>
              <button
                type="button"
                onClick={() => onSelect(btuh)}
                className="flex min-h-11 w-full flex-col items-center justify-center rounded-lg border border-input bg-surface px-2 py-1.5 transition-colors duration-150 hover:bg-muted active:translate-y-px"
              >
                <span className="sr-only">{copy.buttonVerb} </span>
                <span className="text-base font-medium text-ink">
                  {shown}
                </span>{" "}
                <span className="text-xs text-muted-foreground">BTU/hr</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
