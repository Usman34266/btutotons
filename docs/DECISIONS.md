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
