"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

const DIGIT = /\d/;

/**
 * Character position relative to the decimal point (or the end, for whole
 * numbers), so "1.5833" → "1.625" keeps "1" and "." in place and only the
 * changed decimals roll.
 */
function slotOf(text: string, index: number): number {
  const dot = text.indexOf(".");
  return index - (dot === -1 ? text.length : dot);
}

function slotMap(text: string): Map<number, string> {
  return new Map(Array.from(text, (char, i) => [slotOf(text, i), char]));
}

/**
 * Shows an already-formatted number; when it changes, only the changed
 * digits roll in (~200ms). First render and server HTML are static.
 * Screen readers get the plain text once.
 */
export function DigitMorph({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(text);
  const [previous, setPrevious] = useState<string | null>(null);
  if (text !== current) {
    setPrevious(current);
    setCurrent(text);
  }

  const chars = Array.from(text);
  const beforeSlots = previous === null ? null : slotMap(previous);

  return (
    <span className={cn("inline-flex", className)}>
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className="inline-flex overflow-hidden whitespace-pre"
      >
        {chars.map((char, i) => {
          const slot = slotOf(text, i);
          const changed =
            beforeSlots !== null &&
            DIGIT.test(char) &&
            beforeSlots.get(slot) !== char;
          return (
            <span
              key={`${slot}:${char}`}
              className={cn("inline-block", changed && "animate-digit-roll")}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
