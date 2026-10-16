import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Hex color tokens read from tokens.css at build time, for places CSS can't
 * reach (share cards, the browser theme color). Server/build only.
 */
export function colorTokens(theme: "light" | "dark"): Record<string, string> {
  const css = readFileSync(
    resolve(process.cwd(), "src/styles/tokens.css"),
    "utf8",
  );
  const dark = css.indexOf(".dark");
  const block =
    theme === "light" ? css.slice(css.indexOf(":root"), dark) : css.slice(dark);
  const body = block.slice(0, block.indexOf("}"));
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{3,8})\s*;/gi)].map((m) => [
      m[1]!,
      m[2]!,
    ]),
  );
}
