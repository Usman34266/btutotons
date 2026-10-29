/**
 * Starting state of the tonnage playground, shared by the server first paint
 * and the interactive version so the swap never changes what's shown.
 */
export const PLAYGROUND_DEFAULTS = { tons: 3, celsius: 21 } as const;

/**
 * Stage size: a fixed, shorter height on phones (no aspect-ratio box, which a
 * canvas can stretch), filling the column from md up.
 */
export const STAGE_CLASS =
  "relative h-[min(68vw,20rem)] w-full md:h-auto md:min-h-120 md:flex-1";
