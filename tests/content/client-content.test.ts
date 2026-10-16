import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const SRC = resolve(import.meta.dirname, "../../src");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });

/** Value imports only: `import type` and `export type` are erased. */
const IMPORT =
  /^\s*(?:import|export)\s+(?!type\b)(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']/gm;

function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith("@/")
    ? resolve(SRC, spec.slice(2))
    : spec.startsWith(".")
      ? resolve(dirname(from), spec)
      : null;
  if (!base) return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    resolve(base, "index.ts"),
  ])
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  return null;
}

const importsOf = (file: string) =>
  [...readFileSync(file, "utf8").matchAll(IMPORT)].map((m) => m[1]!);

/** Every module that ends up in a client bundle: "use client" files and what they import. */
function clientGraph() {
  const roots = sourceFiles(SRC).filter((f) =>
    /^\s*["']use client["']/.test(readFileSync(f, "utf8")),
  );
  const seen = new Set<string>();
  const stack = [...roots];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of importsOf(file)) {
      const target = resolveImport(file, spec);
      if (target) stack.push(target);
    }
  }
  return seen;
}

describe("client bundles carry only UI copy", () => {
  const graph = clientGraph();
  const barrel = resolve(SRC, "content/index.ts");
  const pageCopy = resolve(SRC, "content/en-US/index.ts");

  it("never reach the full content barrel", () => {
    const offenders = [...graph]
      .filter((f) =>
        importsOf(f).some((s) => {
          const t = resolveImport(f, s);
          return t === barrel || t === pageCopy;
        }),
      )
      .map((f) => relative(SRC, f));
    expect(offenders).toEqual([]);
  });

  it("finds the client components it guards", () => {
    const files = [...graph].map((f) => relative(SRC, f));
    expect(files).toContain("components/converter/converter.tsx");
    expect(files).toContain("content/ui.ts");
  });
});
