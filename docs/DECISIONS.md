# Decisions log

Newest last. Format: **ID · date · decision** — reason. Changing a decision means adding a new entry
that supersedes the old one, not editing it.

---

## Locked decisions (build prompt §2)

- **D001 · 2026-10-16 · Domain `btutotons.com`; main converter at `/` (canonical); `/btu-to-tons-calculator/` 301 → `/`.** Locked by the build prompt.
- **D002 · 2026-10-16 · Brand name "BTU to Tons".** Locked.
- **D003 · 2026-10-16 · US (en-US) only at launch; architecture Europe-ready** (locale layer, EU parser and EU size classes built and tested, not routed). Locked.
- **D004 · 2026-10-16 · P0 launch, then P1 tools as later milestones; P2 model-number lookup out of scope.** Locked.
- **D005 · 2026-10-16 · No ads at launch, no reserved ad slots.** Locked.
- **D006 · 2026-10-16 · Size class is a P0 feature** ("Sold as a 1.5 ton AC", ±10%, "between sizes"); values in one config file pending HVAC review. Locked.
- **D007 · 2026-10-16 · Cloudflare hosting, Next.js static export (`output: "export"`), no server runtime.** Locked.
- **D008 · 2026-10-16 · Ton definition: US refrigeration ton only, exactly 12,000 BTU_IT/h.** Locked.

## M0: setup

- **D009 · 2026-10-16 · Node 24 LTS (`.nvmrc`, `engines.node >= 24`).** Vitest 5 needs Node ≥ 22.12 and Wrangler 4 needs ≥ 22. The machine default (20.19) is unchanged; nvm switches per project.
- **D010 · 2026-10-16 · Next.js 16.4.1 with `cacheComponents` and `partialPrefetching` removed** (the scaffold enabled them). Next's docs state Cache Components requires the Node.js runtime, which conflicts with D007. A static site with no server data gains nothing from them.
- **D011 · 2026-10-16 · `next-best-practices` skill not installed: it no longer exists.** `vercel-labs/next-skills` now says the knowledge moved into Next's bundled docs (`node_modules/next/dist/docs/`) and the `AGENTS.md` block that `next dev` maintains. `CLAUDE.md` imports `AGENTS.md`. Installed: `shadcn`, `impeccable`, `web-design-guidelines`, `vercel-react-best-practices` (pinned in `skills-lock.json`). Removed `migrate-radix-to-base` (bundled with shadcn, irrelevant: we stay on Radix).
- **D012 · 2026-10-16 · shadcn/ui with the Radix base and "nova" preset (Lucide icons).** The preset's neutral palette and Geist font are placeholders, replaced by Coolant tokens and IBM Plex in M2.
- **D013 · 2026-10-16 · `cn()` lives at `src/lib/cn.ts` and re-exports the `cn` npm package** (shadcn's own clsx + tailwind-merge replacement; published by shadcn, MIT, no install scripts, no dependencies). `components.json` `aliases.utils` points at `@/lib/cn` to match the prompt's folder layout.
- **D014 · 2026-10-16 · Tailwind v4 through the `@tailwindcss/turbopack` loader (Next 16.4 scaffold default); no `postcss.config.mjs`.** Deviation from the prompt's file tree, which assumed PostCSS. Same Tailwind v4, CSS-first `@theme`; one fewer config file. Revisit if any tool needs PostCSS.
- **D015 · 2026-10-16 · `_redirects`/`_headers` generation runs inside `pnpm build` (`pnpm generate && next build`), not a `prebuild` hook.** pnpm does not run `pre*` scripts by default, so a `prebuild` script silently never ran. The generated files are git-ignored.
- **D016 · 2026-10-16 · Security header rules live in `scripts/generate-headers.ts`, not the route registry.** They are site-wide, not per route. Redirects do come from `src/registry/redirects.ts`. The redirect generator also emits the slashless form of each source.
- **D017 · 2026-10-16 · CSP starts with `script-src 'self' 'unsafe-inline'` + `https://static.cloudflareinsights.com`.** Static export cannot use nonces; Next's inline bootstrap and the next-themes script need inline. Tighten with build-time hashes later (tracked for M7).
- **D018 · 2026-10-16 · HSTS `max-age=31536000; includeSubDomains`, no `preload`.** Preload-list submission is hard to reverse and is the owner's call.
- **D019 · 2026-10-16 · Wrangler static assets with `html_handling: "force-trailing-slash"` and `not_found_handling: "404-page"`.** Matches `trailingSlash: true` and gives unknown routes a real 404 status.
- **D020 · 2026-10-16 · E2E tests run against `wrangler dev` serving `out/`, not `next start`.** `next start` does not serve a static export, and Wrangler applies `_redirects`, `_headers` and 404 handling as production does. Projects: desktop Chrome and a 360 × 740 mobile viewport.
- **D021 · 2026-10-16 · Lint enforces architecture:** `src/engine` cannot import React/Next/DOM globals or outer layers; everything else imports the engine only via `@/engine`.
- **D022 · 2026-10-16 · CI deploy job is gated by repo variable `CLOUDFLARE_DEPLOY_ENABLED == 'true'`** so CI stays green until Cloudflare secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) exist. Production deploy on push to `main`; PRs upload a preview version with alias `pr-<number>`.
- **D023 · 2026-10-16 · IBM Plex Sans loaded as a variable font** (wght 100–700), so the 650 H1 weight renders exactly; Plex Mono at 400/500 (static only).
- **D024 · 2026-10-16 · Parser mapping for unlisted cases: `Infinity` and `NaN` → `NOT_A_NUMBER`.** The prompt lists them as rejected but gives no code; they fail the number regex like any other mixed string.
- **D025 · 2026-10-16 · Spec PDF not in the repo.** The build prompt is the source of truth. FAQ copy ("10 Q&As from spec page 18", M5) and P1 page copy (spec pp. 24–26) are blocked until the PDF is added at `docs/source/btu-to-tons-spec-v2.pdf`.
- **D026 · 2026-10-16 · `NODE_ENV` override.** The developer shell exports `NODE_ENV=local`. Next forces production for builds (warning only); Vitest pins `NODE_ENV=test` in its config. CI does not set it.
- **D027 · 2026-10-16 · HSTS preload stays off (owner confirmed).** Reconsider after launch, once subdomain plans are settled. Supplements D018.

## M1: engine

- **D028 · 2026-10-16 · `DECIMAL_COMMA` applies to `^\d+,\d$` (e.g. `1,5`) and EU full form `1.000,5`; other stray commas are `NOT_A_NUMBER`.** The acceptance table pins `1,5` → DECIMAL_COMMA and `12,00` → NOT_A_NUMBER, so a two-digit tail can't be the trigger. A one-digit tail can never be a thousands group, so it is unambiguous.
- **D029 · 2026-10-16 · Display trims all trailing zeros, not only on whole numbers** (`1.75`, not `1.7500`). Matches the prompt's own copy examples ("Exact: 1.75 tons") and the "2, not 2.0000" rule; easier to read for owners.
- **D030 · 2026-10-16 · Batch rows carry both `row` (position among non-blank lines, used as the CSV row) and `line` (line number in the pasted text, for "fix line 12" messages).** Blank lines are skipped and do not count toward the 200 limit. Over the limit, nothing is converted.
- **D031 · 2026-10-16 · CSV cell content:** `input_value` is the parsed number for valid rows and the raw (escaped) text for invalid rows; `size_class` is `1.5 ton`, `between 1.5 ton and 2 ton`, or empty; `status` is `ok` or the error code (human copy can be mapped in M4). CRLF line endings, RFC 4180 quoting after the formula-injection prefix.
- **D032 · 2026-10-16 · Size class compares in each region's nominal unit (BTU/hr for US, kW for EU) with a 1e-9 relative epsilon** on the band edge and on ties. Without it, `1.1 × 12,000 = 13,200.000000000002` would fall outside the inclusive 1-ton band.
- **D033 · 2026-10-16 · Tiny values:** a non-zero value smaller than the display step renders as the magnitude "less than 0.0001" (no sign). Compare results carry `direction` (`more`/`less`/`same`) so copy states the sign in words; "+6,000"-style signs apply only above the step. Percent uses 2 decimals.
- **D034 · 2026-10-16 · Parser details:** the Unicode minus (U+2212) counts as a minus sign; `-0` reads as 0; scientific notation is detected before the sign check, so `-1e5` → `SCIENTIFIC`; numerals too long for a double → `TOO_LARGE`.
- **D035 · 2026-10-16 · Equation text:** BTU/hr `19,000 ÷ 12,000 = 1.5833`; tons `1.5 × 12,000 = 18,000`; other units show the step to BTU/hr first (`24 × 1,000 = 24,000 BTU/hr; 24,000 ÷ 12,000 = 2`). Constants show up to 10 decimals (`0.2930710702`).
- **D036 · 2026-10-16 · M1 ships only the P0 engine modules.** Ton-hours, power/EER strategies, room estimate and load report are built in M9–M11; their acceptance rows are `it.todo` in the same dataset. Electrical units are a `never` type until M10.
- **D037 · 2026-10-16 · Coverage gate is 100% for statements, branches, functions and lines** in `src/engine` (stricter than the prompt's line-only gate).

## M2: design system

- **D038 · 2026-10-16 · `/dev/components` exists only under `next dev`.** The page is `page.dev.tsx`; `next.config.ts` (a phase function) adds the `dev.tsx` page extension only in `PHASE_DEVELOPMENT_SERVER`, so the static export never contains it.
- **D039 · 2026-10-16 · Input and select outlines use `--muted`, not `--border`.** `--border` is 1.24:1 on the surface; WCAG 1.4.11 needs 3:1 for a control's boundary. `--border` stays for dividers.
- **D040 · 2026-10-16 · Added `--on-accent` (text on a solid accent fill): light #FFFFFF, dark #0B0F14.** Reuses the existing `--surface` (light) and `--bg` (dark) values; no new color. 5.67:1 / 9.52:1.
- **D041 · 2026-10-16 · `--electric` and `--success` text never sit on `--accent-soft`** (4.44:1 / 4.41:1 in light mode). Token values stay as specified; chips carry their own surface fill and the copied state sits on the page. Enforced by `tests/design/contrast.test.ts`.
- **D042 · 2026-10-16 · Native `<select>` replaces shadcn/Radix Select** for unit pickers: the platform picker on phones, no JS, accessible by default (GOV.UK pattern).
- **D043 · 2026-10-16 · On `--accent-soft`, secondary text uses `--ink`, never `--muted`.** Impeccable's detector flagged gray-on-color (5.62:1 passes AA, but gray on a tinted panel reads washed out). Enforced by the contrast test.
- **D044 · 2026-10-16 · Custom `DigitMorph` instead of `@number-flow/react`** (removed). NumberFlow formats numbers itself with Intl, which would bypass `engine/format.ts`. Ours takes the engine's formatted string, aligns characters on the decimal point, rolls only changed digits (~200ms, transform/opacity), stays static on first render and under reduced motion, and gives screen readers the plain text.
- **D045 · 2026-10-16 · Coolant tokens keep their own names (`--muted`, `--accent`, `--border`…); shadcn's variable set is removed.** The names clash with shadcn's meanings (shadcn `--accent` is a hover fill). Tailwind utilities map onto Coolant in `@theme` (table in DESIGN.md §8).
- **D046 · 2026-10-16 · Ice-block geometry is engine code (`engine/ice-blocks.ts`).** Drawn at 2-decimal resolution; max 6 blocks; "+N" is overflow **tons** (7.5 tons → 6 blocks "+1.5"), compact from a million ("+83.3T"). Zero shows one dashed "melted" block. The visual is `aria-hidden`; the number is always text.
- **D047 · 2026-10-16 · Selected state for tabs and segmented controls: surface fill + 1.5px inset `--accent` ring.** The previous gray border was 1.2:1.
- **D048 · 2026-10-16 · Popovers use a border only, no shadow** ("borders first; only the converter card gets a shadow").
- **D049 · 2026-10-16 · Every button size is ≥ 44px; shadcn's `xs`/`sm`/`icon-sm` sizes were removed** so they can't be used by mistake. Tab labels may wrap (360px).
- **D050 · 2026-10-16 · Impeccable critique ran single-context (degraded),** because this session uses sub-agents only on explicit request. Detector: 0 CLI findings; browser overlay found em-dash-overuse (false positive: the `--token` names) and gray-on-color (fixed, D043). Snapshot in `.impeccable/critique/`, closed after the fixes.
