"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export interface SliderStop {
  value: number;
  /** Already formatted by the engine; no label draws a tick only. */
  label?: string;
  /** Label shown from the sm breakpoint up, so 360px never crowds. */
  wideOnly?: boolean;
}

/** Thumb diameter in px; ticks sit on the thumb's travel, not the full width. */
const THUMB = 24;

const share = (value: number, min: number, max: number) =>
  max === min ? 0 : (value - min) / (max - min);

/**
 * Native range input with labelled standard points under the track. Keyboard,
 * screen readers and touch come from the browser; `valueText` is announced.
 */
export function StopSlider({
  id,
  label,
  valueText,
  min,
  max,
  step,
  value,
  stops,
  note,
  onChange,
}: {
  id: string;
  label: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  stops: readonly SliderStop[];
  note?: string;
  onChange(value: number): void;
}) {
  const fill = `${share(value, min, max) * 100}%`;
  const at = (v: number) =>
    `calc(${THUMB / 2}px + ${share(v, min, max)} * (100% - ${THUMB}px))`;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-label text-ink">
          {label}
        </label>
        <span className="text-label text-accent tabular-nums">{valueText}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": fill } as CSSProperties}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none bg-transparent",
          "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
          "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--accent)_var(--fill),var(--border)_var(--fill))]",
          "[&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none",
          "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-surface",
          "[&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-card",
          "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-border",
          "[&::-moz-range-progress]:h-2 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-accent",
          "[&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
          "[&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:bg-accent",
        )}
      />
      <div aria-hidden="true" className="relative -mt-2 h-8">
        {stops.map((stop) => (
          <span
            key={stop.value}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5"
            style={{ left: at(stop.value) }}
          >
            <span
              className={cn(
                "h-2 w-px",
                stop.value <= value ? "bg-accent" : "bg-muted-foreground/50",
              )}
            />
            {stop.label && (
              <span
                className={cn(
                  "text-xs whitespace-nowrap text-muted-foreground tabular-nums",
                  stop.wideOnly && "hidden sm:inline",
                )}
              >
                {stop.label}
              </span>
            )}
          </span>
        ))}
      </div>
      {note && <p className="text-label text-muted-foreground">{note}</p>}
    </div>
  );
}
