import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { segmentsText } from "@/components/converter/segments";
import { numericPageModel } from "@/lib/numeric-page";
import { NUMERIC_PAGES } from "@/registry/numeric-pages";

/** Build prompt §10.5. Targeted patterns, so plain words like "only when" stay allowed. */
const NEVER_SAY: readonly [string, RegExp][] = [
  ["Manual J", /manual j/i],
  ["ASHRAE compliant", /ashrae[- ]compliant/i],
  ["certified", /\bcertified\b/i],
  ["approved by ENERGY STAR", /approved by energy star/i],
  ["you need a X ton AC", /you need an? [\w.,-]+ ?ton/i],
  ["buy", /\bbuy\b/i],
  ["correctly sized", /correctly sized/i],
  ["best", /\bbest\b/i],
  ["first/only claims", /\b(the|our) (first|only)\b/i],
  [
    "breaker size from tons",
    /breaker[^.]{0,40}\d+\s*(a|amps?)\b|\b\d+\s*(a|amps?)\b[^.]{0,20}breaker/i,
  ],
  /** A question is allowed: the approved FAQ asks it and answers "No". */
  ["uses X kW of electricity", /\buses? [\d.,]+ ?k?W\b(?![^"\n]*\?)/i],
  ["SEER2 ↔ EU SEER", /seer2?[^.]{0,40}\beu seer|\beu seer[^.]{0,40}seer2/i],
  ["fake ratings", /★|\b\d(\.\d)? (out of 5|stars?)\b/i],
];

const contentDir = resolve(import.meta.dirname, "../../src/content/en-US");

/** Copy as written, comments removed (they explain rules and may quote the list). */
const sourceCopy = readdirSync(contentDir)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => ({
    name: f,
    text: readFileSync(resolve(contentDir, f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1"),
  }));

/** The 20 numeric pages, as rendered from the template. */
const numericCopy = NUMERIC_PAGES.map((page) => {
  const m = numericPageModel(page);
  return {
    name: page.slug,
    text: [
      m.meta.title,
      m.meta.description,
      m.h1,
      segmentsText(m.answer),
      m.method,
      m.coolingKw,
      m.compareHeading,
      m.fitsHeading,
      ...m.links.map((l) => l.label),
    ].join("\n"),
  };
});

describe("never-say list", () => {
  it.each([...sourceCopy, ...numericCopy])("$name", ({ text }) => {
    for (const [rule, pattern] of NEVER_SAY)
      expect(text, rule).not.toMatch(pattern);
  });

  it("scans every content file", () => {
    expect(sourceCopy.map((f) => f.name)).toEqual(
      expect.arrayContaining([
        "nameplate.ts",
        "methodology.ts",
        "site-pages.ts",
        "home.ts",
        "reference.ts",
      ]),
    );
  });

  it("catches the phrases it bans", () => {
    const hits = (s: string) => NEVER_SAY.some(([, p]) => p.test(s));
    expect(hits("You need a 2 ton AC")).toBe(true);
    expect(hits("Buy now")).toBe(true);
    expect(hits("The only calculator")).toBe(true);
    expect(hits("Use a 20 A breaker")).toBe(true);
    expect(hits("It uses 3.5 kW")).toBe(true);
    expect(hits("Does 1 ton use 3.517 kW of electricity?")).toBe(false);
    expect(hits("Use the rated cooling capacity first.")).toBe(false);
    expect(hits("Use a model code only when it is verified.")).toBe(false);
  });
});
