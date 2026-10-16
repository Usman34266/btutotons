/**
 * Appends 200 (serve-in-place) rules to out/_redirects for exported files
 * whose names Cloudflare's asset server re-encodes. It 307-redirects any path
 * that changes under encodeURIComponent, and Next names [slug] prefetch files
 * "__next.$d$slug.__PAGE__.txt": every prefetch would cost a redirect (and
 * fails on the http preview, where the CSP upgrades it to https). A rule whose
 * target is already encoded is served directly (D074). Runs after next build.
 */
import { appendFileSync, readdirSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const outDir = resolve(import.meta.dirname, "../out");

const files = readdirSync(outDir, { recursive: true, withFileTypes: true })
  .filter((d) => d.isFile())
  .map((d) => relative(outDir, resolve(d.parentPath, d.name)).split(sep));

/** As the browser sends it ("$" stays raw) → as the asset server expects it. */
const lines = files.flatMap((parts) => {
  const sent = `/${parts.map(encodeURI).join("/")}`;
  const stored = `/${parts.map(encodeURIComponent).join("/")}`;
  return sent === stored ? [] : [`${sent} ${stored} 200`];
});

appendFileSync(
  resolve(outDir, "_redirects"),
  `# Encoded asset names, by scripts/alias-encoded-assets.ts.\n${lines.join("\n")}\n`,
);
console.log(`_redirects: ${lines.length} encoded-asset rules`);
