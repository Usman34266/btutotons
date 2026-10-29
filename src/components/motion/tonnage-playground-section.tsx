import { getContent } from "@/content";
import {
  capacity,
  convertCapacity,
  formatAmount,
  formatNumber,
} from "@/engine";

import { AcPoster } from "./ac-poster";
import { PLAYGROUND_DEFAULTS, STAGE_CLASS } from "./playground-defaults";
import { TonnagePlaygroundLoader } from "./tonnage-playground-loader";

/** Static first paint: the playground's defaults, same layout, no controls. */
function StaticCard() {
  const { tonnagePlayground: copy } = getContent();
  const { tons, btuh } = convertCapacity(
    capacity(PLAYGROUND_DEFAULTS.tons, "tr"),
  );
  const tonsText = formatNumber(tons, { precision: 2 });
  const btuhText = formatAmount(btuh, "btuh", { precision: 2 });
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-12">
      <div className="flex flex-col border-b border-border bg-muted md:col-span-7 md:border-r md:border-b-0">
        <div className={STAGE_CLASS}>
          <AcPoster
            temperature={`${formatNumber(PLAYGROUND_DEFAULTS.celsius)}${copy.temperature.unit}`}
            tons={copy.lcd.tons(tonsText)}
            btuh={btuhText}
          />
        </div>
        <p className="px-4 pb-3 text-label text-muted-foreground md:px-6">
          {copy.airNote}
        </p>
      </div>
      <div className="flex min-h-96 flex-col gap-4 p-4 md:col-span-5 md:p-6">
        <p className="text-2xl font-semibold text-ink tabular-nums">
          {formatAmount(tons, "tr", { style: "long" })} {copy.equals} {btuhText}
        </p>
        <p className="text-label text-muted-foreground">{copy.loading}</p>
      </div>
    </div>
  );
}

/** Prototype section: heading and copy on the server, the playground lazy. */
export function TonnagePlaygroundSection() {
  const { tonnagePlayground: copy } = getContent();
  return (
    <section
      aria-labelledby="playground-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <p className="text-label text-accent">{copy.eyebrow}</p>
        <h2 id="playground-heading">{copy.heading}</h2>
        <p className="max-w-prose text-muted-foreground">{copy.intro}</p>
      </div>
      <TonnagePlaygroundLoader>
        <StaticCard />
      </TonnagePlaygroundLoader>
    </section>
  );
}
