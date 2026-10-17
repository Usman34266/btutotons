/**
 * Writes the brand files to public/ from the logo mark and tokens.css (D109, D110):
 * icon.svg and favicon.ico (the mark on a round --accent badge, since search
 * results crop favicons to a circle; the SVG follows the system theme),
 * apple-touch-icon.png and logo.png (the Organization logo). Runs at prebuild;
 * the outputs are git-ignored.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { ImageResponse } from "next/og";
import type { ReactElement } from "react";

import { BrandMark, MARK } from "../src/lib/brand-mark";
import { colorTokens } from "../src/lib/design-tokens";

const light = colorTokens("light");
const dark = colorTokens("dark");
const write = (name: string, data: string | Buffer) =>
  writeFileSync(resolve(import.meta.dirname, "../public", name), data);

async function png(size: number, element: ReactElement) {
  const image = new ImageResponse(element, { width: size, height: size });
  return Buffer.from(await image.arrayBuffer());
}

const centred = {
  display: "flex",
  width: "100%",
  height: "100%",
  alignItems: "center",
  justifyContent: "center",
} as const;

/** The mark on an opaque --surface square (iOS rounds the corners itself). */
const tile = (size: number, inset: number) =>
  png(
    size,
    <div style={{ ...centred, background: light.surface }}>
      <BrandMark color={light.accent} size={size - 2 * inset} />
    </div>,
  );

/** The mark knocked out of a round --accent badge. */
const badge = (size: number) =>
  png(
    size,
    <div style={{ ...centred, borderRadius: "50%", background: light.accent }}>
      <BrandMark color={light["on-accent"]} size={size * MARK.badgeScale} />
    </div>,
  );

/** ICO with PNG entries (supported by every browser that still asks for it). */
function ico(images: { size: number; data: Buffer }[]) {
  const dir = Buffer.alloc(6 + 16 * images.length);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(images.length, 4);
  let offset = dir.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + 16 * i;
    dir.writeUInt8(size % 256, entry);
    dir.writeUInt8(size % 256, entry + 1);
    dir.writeUInt16LE(1, entry + 4);
    dir.writeUInt16LE(32, entry + 6);
    dir.writeUInt32LE(data.length, entry + 8);
    dir.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([dir, ...images.map((i) => i.data)]);
}

const { x, y, width, height, rx } = MARK.block;
const offset = 16 * (1 - MARK.badgeScale);
write(
  "icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}">` +
    `<style>circle{fill:${light.accent}}g{color:${light["on-accent"]}}` +
    `@media (prefers-color-scheme:dark){circle{fill:${dark.accent}}g{color:${dark["on-accent"]}}}</style>` +
    `<circle cx="16" cy="16" r="16"/>` +
    `<g transform="translate(${offset} ${offset}) scale(${MARK.badgeScale})">` +
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" fill="none" stroke="currentColor" stroke-width="${MARK.blockStroke}"/>` +
    `<path d="${MARK.water}" fill="currentColor"/>` +
    `<path d="${MARK.glint}" fill="none" stroke="currentColor" stroke-width="${MARK.glintStroke}" stroke-linecap="round"/>` +
    `</g></svg>\n`,
);

const sizes = [16, 32, 48];
write(
  "favicon.ico",
  ico(
    await Promise.all(
      sizes.map(async (size) => ({ size, data: await badge(size) })),
    ),
  ),
);

write("apple-touch-icon.png", await tile(180, 26));
write("logo.png", await tile(512, 56));

console.log(
  "brand assets: icon.svg, favicon.ico, apple-touch-icon.png, logo.png",
);
