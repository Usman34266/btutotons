"use client";

import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
import { LazyMotion, MotionConfig, domMax, m } from "motion/react";
import { lazy, Suspense, useRef, useState } from "react";

import { DigitMorph } from "@/components/converter/digit-morph";
import { Segments } from "@/components/converter/segments";
import { sizeClassSegments } from "@/components/converter/size-class-badge";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getUiContent } from "@/content/ui";
import {
  UNITS,
  capacity,
  classifySize,
  convertCapacity,
  formatAmount,
  formatNumber,
} from "@/engine";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/pluralize";
import { US_SIZE_CLASS_TONS } from "@/registry/size-classes";

import { AcPoster } from "./ac-poster";
import { PLAYGROUND_DEFAULTS, STAGE_CLASS } from "./playground-defaults";
import { StopSlider, type SliderStop } from "./stop-slider";
import { useNearViewport } from "./use-near-viewport";

const AcScene = lazy(() => import("./ac-scene"));

type Mode = "tons" | "btuh";

const MODES: Mode[] = ["tons", "btuh"];
const CLASS_TONS: readonly number[] = US_SIZE_CLASS_TONS;
const MAX_TONS = CLASS_TONS[CLASS_TONS.length - 1]!;
const nominalBtuh = (tons: number) =>
  convertCapacity(capacity(tons, "tr")).btuh;

/** Labelled on every width; the rest only from sm up (360px stays readable). */
const ALWAYS_LABELLED = new Set([1, 2, 3, 4, 5]);
const TONS_STOPS: SliderStop[] = CLASS_TONS.map((t, i) => ({
  value: i,
  label: formatNumber(t),
  wideOnly: t === 0.75 || t === 1.25,
}));
const BTUH_STOPS: SliderStop[] = CLASS_TONS.map((t) => ({
  value: nominalBtuh(t),
  label:
    ALWAYS_LABELLED.has(t) || t === CLASS_TONS[0]
      ? formatNumber(nominalBtuh(t))
      : undefined,
  wideOnly: t === CLASS_TONS[0],
}));
/** BTU/hr slider: the US size list's nominal range, in 500 BTU/hr steps. */
const BTUH_RANGE = {
  min: nominalBtuh(CLASS_TONS[0]!),
  max: nominalBtuh(MAX_TONS),
  step: 500,
} as const;

/** Setpoint range of a typical remote, whole degrees (display only). */
const TEMP = { min: 18, max: 30, step: 1 } as const;
const TEMP_STOPS: SliderStop[] = Array.from(
  { length: TEMP.max - TEMP.min + 1 },
  (_, i) => TEMP.min + i,
).map((c) => ({
  value: c,
  label: c % 2 === 0 ? formatNumber(c) : undefined,
}));

/**
 * Cooling effort (illustration, pending HVAC review): the share of rated
 * capacity the pictured AC uses, from gentle at the warmest setting to full at
 * the coolest. It drives the air and fan bars only; the numbers stay rated.
 */
const EFFORT = { atWarmest: 0.35, atCoolest: 1 } as const;
const EFFORT_LEVELS = ["gentle", "steady", "full"] as const;
type EffortLevel = (typeof EFFORT_LEVELS)[number];

function coolingEffort(celsius: number): number {
  const coolness = (TEMP.max - celsius) / (TEMP.max - TEMP.min);
  return EFFORT.atWarmest + coolness * (EFFORT.atCoolest - EFFORT.atWarmest);
}

const effortLevel = (effort: number): EffortLevel =>
  effort >= 0.85 ? "full" : effort >= 0.55 ? "steady" : "gentle";

function EffortMeter({ level }: { level: EffortLevel }) {
  const copy = getUiContent().tonnagePlayground.effort;
  const lit = EFFORT_LEVELS.indexOf(level) + 1;
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-label text-ink">{copy.label}</span>
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="flex items-end gap-1">
          {EFFORT_LEVELS.map((l, i) => (
            <span
              key={l}
              className={cn(
                "w-2 rounded-sm transition-colors duration-200",
                i < lit ? "bg-accent" : "bg-border",
              )}
              style={{ height: `${8 + i * 6}px` }}
            />
          ))}
        </span>
        <span className="min-w-14 text-right text-label text-accent">
          {copy.levels[level]}
        </span>
      </span>
    </div>
  );
}

const SPRING = { type: "spring", stiffness: 380, damping: 28 } as const;

/** Index of the size class nearest a BTU/hr value, for carrying it into tons mode. */
function nearestClassIndex(btuh: number): number {
  const result = classifySize(btuh);
  const tons =
    result.type === "class"
      ? result.sizeClass.tons
      : result.type === "between"
        ? result.lower.tons
        : btuh < BTUH_RANGE.min
          ? CLASS_TONS[0]!
          : MAX_TONS;
  return Math.max(0, CLASS_TONS.indexOf(tons));
}

function Readout({
  value,
  unit,
  primary,
}: {
  value: number;
  unit: "tr" | "btuh";
  primary: boolean;
}) {
  const text = formatNumber(value, { precision: 2 });
  const def = UNITS[unit];
  return (
    <m.div
      layout
      transition={SPRING}
      className={
        primary
          ? "flex flex-1 flex-col gap-1 rounded-lg bg-accent-soft px-4 py-3"
          : "flex flex-1 flex-col gap-1 rounded-lg border border-border px-4 py-3"
      }
    >
      <DigitMorph
        text={text}
        className="text-3xl font-semibold text-ink tabular-nums"
      />
      <span className="text-label text-muted-foreground">
        {plural(text, def.singular, def.plural)}
      </span>
    </m.div>
  );
}

/**
 * Prototype (Motion + React Three Fiber): pick a size in tons or BTU/hr and a
 * setpoint; the 3D wall unit shows them on its display and blows more cool
 * air as capacity grows. Every number comes from the engine; the airflow is
 * an illustration and the setpoint never changes the capacity.
 */
export default function TonnagePlayground() {
  const copy = getUiContent().tonnagePlayground;
  // The 3D chunk (~245 KB gz) loads only once the stage itself is on screen.
  const stage = useRef<HTMLDivElement>(null);
  const stageSeen = useNearViewport(stage);
  const [mode, setMode] = useState<Mode>("tons");
  const [classIndex, setClassIndex] = useState(
    CLASS_TONS.indexOf(PLAYGROUND_DEFAULTS.tons),
  );
  const [btuh, setBtuh] = useState(nominalBtuh(PLAYGROUND_DEFAULTS.tons));
  const [temperature, setTemperature] = useState<number>(
    PLAYGROUND_DEFAULTS.celsius,
  );
  const [swing, setSwing] = useState(true);

  const tons = CLASS_TONS[classIndex]!;
  const result =
    mode === "tons"
      ? convertCapacity(capacity(tons, "tr"))
      : convertCapacity(capacity(btuh, "btuh"));

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (next === "btuh") setBtuh(result.btuh);
    else setClassIndex(nearestClassIndex(result.btuh));
    setMode(next);
  };

  const order =
    mode === "tons" ? (["tr", "btuh"] as const) : (["btuh", "tr"] as const);
  const readout = (unit: "tr" | "btuh") => ({
    unit,
    value: unit === "tr" ? result.tons : result.btuh,
  });
  const tonsText = formatNumber(result.tons, { precision: 2 });
  const btuhText = formatAmount(result.btuh, "btuh", { precision: 2 });
  const temperatureText = `${formatNumber(temperature)}${copy.temperature.unit}`;
  const announcement = `${formatAmount(result.tons, "tr", { style: "long", precision: 2 })} ${copy.equals} ${btuhText}`;
  const sizeLine =
    mode === "btuh" ? sizeClassSegments(result.sizeClass, result.tons) : [];

  // Air strength: share of the largest listed size × cooling effort (visual only).
  const effort = coolingEffort(temperature);
  const strength = Math.max(Math.min(result.tons / MAX_TONS, 1) * effort, 0.05);
  const lcd = {
    mode: copy.lcd.mode,
    temperature: formatNumber(temperature),
    unit: copy.temperature.unit,
    tons: copy.lcd.tons(tonsText),
    btuh: btuhText,
    fanLevel: Math.max(1, Math.ceil(strength * 3)),
    swing,
  };
  const poster = (
    <AcPoster temperature={temperatureText} tons={lcd.tons} btuh={lcd.btuh} />
  );

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-12">
          <div className="flex flex-col border-b border-border bg-muted md:col-span-7 md:border-r md:border-b-0">
            <div ref={stage} className={STAGE_CLASS}>
              {stageSeen ? (
                <Suspense fallback={poster}>
                  <AcScene
                    strength={strength}
                    swing={swing}
                    lcd={lcd}
                    fallback={poster}
                  />
                </Suspense>
              ) : (
                poster
              )}
            </div>
            <p className="px-4 pb-3 text-label text-muted-foreground md:px-6">
              {copy.airNote}
            </p>
          </div>

          <div className="flex flex-col gap-5 p-4 md:col-span-5 md:p-6">
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(v) => {
                if (v === "tons" || v === "btuh") switchMode(v);
              }}
              aria-label={copy.modeLabel}
              className="w-full"
            >
              {MODES.map((item) => (
                <ToggleGroupItem key={item} value={item} className="flex-1">
                  {copy.modes[item]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {mode === "tons" ? (
              <StopSlider
                id="tonnage-slider"
                label={copy.sliderLabel.tons}
                valueText={formatAmount(tons, "tr", { style: "long" })}
                min={0}
                max={CLASS_TONS.length - 1}
                step={1}
                value={classIndex}
                stops={TONS_STOPS}
                note={copy.stopsLabel}
                onChange={setClassIndex}
              />
            ) : (
              <StopSlider
                id="tonnage-slider"
                label={copy.sliderLabel.btuh}
                valueText={formatAmount(btuh, "btuh")}
                min={BTUH_RANGE.min}
                max={BTUH_RANGE.max}
                step={BTUH_RANGE.step}
                value={btuh}
                stops={BTUH_STOPS}
                note={copy.stopsLabel}
                onChange={setBtuh}
              />
            )}

            {/* Keyed by unit, so a mode switch slides the two cards past each other. */}
            <div className="flex items-center gap-2">
              <Readout key={order[0]} {...readout(order[0])} primary />
              <m.span
                key="arrow"
                layout
                className="flex shrink-0 items-center justify-center text-muted-foreground"
                animate={{ rotate: mode === "tons" ? 0 : 180 }}
                transition={SPRING}
              >
                <ArrowLeftRight aria-hidden="true" className="size-5" />
              </m.span>
              <Readout key={order[1]} {...readout(order[1])} primary={false} />
            </div>
            <p className="sr-only" aria-live="polite">
              {announcement}
            </p>
            {sizeLine.length > 0 && (
              <p>
                <Segments segments={sizeLine} />
              </p>
            )}

            <StopSlider
              id="temperature-slider"
              label={copy.temperature.label}
              valueText={temperatureText}
              min={TEMP.min}
              max={TEMP.max}
              step={TEMP.step}
              value={temperature}
              stops={TEMP_STOPS}
              note={copy.temperature.note}
              onChange={setTemperature}
            />
            <EffortMeter level={effortLevel(effort)} />

            <div className="flex items-center justify-between gap-3">
              <span id="swing-label" className="text-label text-ink">
                {copy.swing.label}
              </span>
              <Button
                type="button"
                variant="outline"
                aria-pressed={swing}
                aria-labelledby="swing-label swing-state"
                onClick={() => setSwing((on) => !on)}
                className={cn(
                  "min-w-24",
                  swing && "border-accent bg-accent-soft text-ink",
                )}
              >
                <ArrowUpDown aria-hidden="true" />
                <span id="swing-state">
                  {swing ? copy.swing.on : copy.swing.off}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
