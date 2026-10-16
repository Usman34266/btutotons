/**
 * WCAG 2.2 contrast for the Coolant tokens, read straight from tokens.css
 * (the single source). Text ≥ 4.5:1; UI boundaries and focus ≥ 3:1.
 */
import { describe, expect, it } from "vitest";

import { colorTokens } from "@/lib/design-tokens";

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
};

const THEMES = { light: colorTokens("light"), dark: colorTokens("dark") };

/**
 * Where each text token may appear. Muted (gray) text never sits on the
 * colored result panel. Electric and success text never sit on
 * --accent-soft (4.44 / 4.41 in light mode): chips carry their own surface
 * fill, and the copied state sits on the page (D041).
 */
const TEXT_ON: Record<string, string[]> = {
  ink: ["bg", "surface", "accent-soft"],
  muted: ["bg", "surface"], // on --accent-soft, secondary text uses --ink (D043)
  accent: ["bg", "surface", "accent-soft"],
  energy: ["bg", "surface", "accent-soft"],
  danger: ["bg", "surface", "accent-soft"],
  electric: ["bg", "surface"],
  success: ["bg", "surface"],
};

describe.each(Object.entries(THEMES))("%s theme", (_, t) => {
  it("defines every token", () => {
    for (const name of [
      "bg",
      "surface",
      "ink",
      "muted",
      "border",
      "accent",
      "accent-soft",
      "electric",
      "energy",
      "danger",
      "success",
      "on-accent",
    ]) {
      expect(t[name], name).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  for (const [fg, backgrounds] of Object.entries(TEXT_ON)) {
    for (const bg of backgrounds) {
      it(`${fg} text on ${bg} ≥ 4.5:1`, () => {
        expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it("on-accent text on an accent fill ≥ 4.5:1", () => {
    expect(contrast(t["on-accent"]!, t.accent!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["bg", "surface"])(
    "input outline (muted) and focus ring (accent) on %s ≥ 3:1",
    (bg) => {
      expect(contrast(t.muted!, t[bg]!)).toBeGreaterThanOrEqual(3);
      expect(contrast(t.accent!, t[bg]!)).toBeGreaterThanOrEqual(3);
    },
  );
});
