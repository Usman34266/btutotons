/**
 * The logo mark (D109): one ice block, partly melted, with the corner glint of
 * the result panel's ice blocks. One geometry for the header, the icons in
 * public/ (scripts/generate-brand-assets.tsx) and the share cards.
 */
export const MARK = {
  viewBox: "0 0 32 32",
  block: { x: 3.25, y: 3.25, width: 25.5, height: 25.5, rx: 6 },
  blockStroke: 2.5,
  water: "M3.25 17.5H28.75V22.75a6 6 0 0 1-6 6H9.25a6 6 0 0 1-6-6Z",
  glint: "M9 13V11a2.5 2.5 0 0 1 2.5-2.5H14",
  glintStroke: 2.25,
  /** Mark size inside the round favicon badge, as a share of its diameter. */
  badgeScale: 0.62,
} as const;

/**
 * Draws in `color` (default currentColor, so a `text-*` class sets it).
 * Satori (share cards, icons) needs a hex color and a pixel size instead, and
 * fails on attributes that are present but undefined.
 */
export function BrandMark({
  color = "currentColor",
  size,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox={MARK.viewBox}
      {...(size !== undefined && { width: size, height: size })}
      {...(className !== undefined && { className })}
      aria-hidden="true"
    >
      <rect
        {...MARK.block}
        fill="none"
        stroke={color}
        strokeWidth={MARK.blockStroke}
      />
      <path d={MARK.water} fill={color} />
      <path
        d={MARK.glint}
        fill="none"
        stroke={color}
        strokeWidth={MARK.glintStroke}
        strokeLinecap="round"
      />
    </svg>
  );
}
