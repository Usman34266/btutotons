/**
 * Fails when a page's initial JavaScript (every script the exported HTML
 * loads, gzipped) is over its budget (D097). The noModule polyfill is left out:
 * modern browsers never download it. Runs after next build.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

/** Page path → budget in KB (1 KB = 1,024 bytes), gzipped. */
const BUDGETS: Record<string, number> = { "/": 185 };

const outDir = resolve(import.meta.dirname, "../out");

function initialScripts(html: string): string[] {
  const srcs = new Set<string>();
  for (const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g))
    if (!/\bnoModule\b/i.test(m[0])) srcs.add(m[1]!);
  for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+\.js)"[^>]*>/g))
    if (/\brel="(?:preload|modulepreload)"/.test(m[0])) srcs.add(m[1]!);
  return [...srcs];
}

let failed = false;
for (const [path, budget] of Object.entries(BUDGETS)) {
  const html = readFileSync(resolve(outDir, `.${path}index.html`), "utf8");
  const scripts = initialScripts(html);
  const kb =
    scripts.reduce(
      (sum, src) =>
        sum + gzipSync(readFileSync(resolve(outDir, `.${src}`))).length,
      0,
    ) / 1024;
  const ok = kb <= budget;
  failed ||= !ok;
  console.log(
    `${ok ? "ok  " : "OVER"} ${path}: ${kb.toFixed(1)} KB of ${budget} KB (${scripts.length} scripts)`,
  );
}
if (failed) process.exit(1);
