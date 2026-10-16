import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { ImageResponse } from "next/og";

import { segmentsText } from "@/components/converter/segments";
import { site } from "@/config/site";
import { getContent } from "@/content";
import { routeCopy } from "@/lib/metadata";
import { numericPageModel } from "@/lib/numeric-page";
import { route, type RouteId } from "@/registry/routes";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const ogAlt = () => getContent().social.alt;

/** Satori reads WOFF, not the WOFF2 that next/font serves. */
const FONT_DIR = resolve(
  process.cwd(),
  "node_modules/@fontsource/ibm-plex-sans/files",
);
const FONTS = ([400, 600] as const).map((weight) => ({
  name: "IBM Plex Sans",
  data: readFileSync(
    resolve(FONT_DIR, `ibm-plex-sans-latin-${weight}-normal.woff`),
  ),
  weight,
  style: "normal" as const,
}));

/** Light-theme colors straight from tokens.css, so cards never drift from the site. */
function lightTokens(): Record<string, string> {
  const css = readFileSync(
    resolve(process.cwd(), "src/styles/tokens.css"),
    "utf8",
  );
  const root = css.slice(css.indexOf(":root"), css.indexOf(".dark"));
  return Object.fromEntries(
    [...root.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map((m) => [
      m[1],
      m[2],
    ]),
  );
}
const T = lightTokens();

interface OgCard {
  eyebrow: string;
  headline: string;
  body: string;
}

function cardFor(id: RouteId): OgCard {
  const r = route(id);
  if (r.numeric) {
    const m = numericPageModel(r.numeric);
    return {
      eyebrow: m.h1,
      headline: m.equation,
      body: segmentsText(m.answer),
    };
  }
  const copy = routeCopy(r);
  return { eyebrow: site.name, headline: copy.h1, body: copy.description };
}

export function ogImage(id: RouteId) {
  const { eyebrow, headline, body } = cardFor(id);
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: T.bg,
        borderBottom: `16px solid ${T.accent}`,
        fontFamily: "IBM Plex Sans",
        color: T.ink,
      }}
    >
      <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>
        {eyebrow}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            fontSize: headline.length > 24 ? 64 : 80,
            fontWeight: 600,
            lineHeight: 1.1,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            lineHeight: 1.35,
            color: T.muted,
          }}
        >
          {body}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: T.accent }}>
        {new URL(site.url).host}
      </div>
    </div>,
    { ...OG_SIZE, fonts: FONTS },
  );
}
