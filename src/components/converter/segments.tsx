import type { Segment } from "@/content";

/** Renders copy segments; `strong` runs are bold. */
export function Segments({ segments }: { segments: readonly Segment[] }) {
  return segments.map((s, i) =>
    s.strong ? (
      <strong key={i} className="font-semibold">
        {s.text}
      </strong>
    ) : (
      <span key={i}>{s.text}</span>
    ),
  );
}

export const segmentsText = (segments: readonly Segment[]) =>
  segments.map((s) => s.text).join("");
