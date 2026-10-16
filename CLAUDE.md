# btutotons.com

BTU-to-tons calculator for AC owners (primary) and HVAC technicians. Next.js static export on Cloudflare.

@AGENTS.md

## Read first

| Doc                                 | What it holds                                                       |
| ----------------------------------- | ------------------------------------------------------------------- |
| `docs/PRD.md`                       | Users, scope (P0/P1), requirements, open decisions                  |
| `docs/DESIGN.md`                    | "Coolant" tokens, type, layout, component states, motion, copy tone |
| `docs/STANDARDS-CHEATSHEET.md`      | The only source of constants, formulas, units, limits               |
| `docs/DECISIONS.md`                 | Every decision with its reason. Add an entry for each new one       |
| `.claude/skills/btutotons/SKILL.md` | Project rules: quantity kinds, labelling, never-say list            |

The build prompt is the source of truth; where it conflicts with itself or the spec PDF, **stop and ask**.

## Hard rules

1. **Never invent facts.** Units, constants, standards and copy claims come only from the docs above.
2. **Static export only.** No middleware/proxy, server actions, request-time route handlers,
   `next.config` redirects/headers/rewrites, or default `next/image` optimisation. This beats any skill advice.
3. **No calculation outside `src/engine`.** Components never calculate; every displayed number goes
   through `engine/format.ts`.
4. **Import the engine only via `@/engine`** (the facade). Lint enforces it.
5. **No hard-coded colors** outside `src/styles/tokens.css`.
6. **Placeholders that need a human** (reviewer, release date, logo) live in `src/config/site.ts` as `null`
   and are never faked in copy.
7. Check all copy against the never-say list and the exact error/tooltip copy tables.
8. Stop at every milestone gate (build prompt §16), report, wait for approval.

## Commands

Node 24 (`nvm use`), pnpm.

```bash
pnpm dev             # dev server
pnpm build           # generate _redirects/_headers, then static export to out/
pnpm budget          # homepage initial JS ≤ 185 KB gzipped (after a build)
pnpm preview         # serve out/ with Wrangler on :4173 (redirects, headers, 404 as prod)
pnpm lint            # ESLint (incl. architecture rules)
pnpm typecheck       # next typegen && tsc --noEmit
pnpm test            # Vitest (engine + registry)
pnpm test:coverage   # engine must stay at 100%
pnpm test:e2e        # Playwright against `wrangler dev` (needs a fresh `pnpm build`)
pnpm lhci            # Lighthouse CI on out/
pnpm check           # lint + typecheck + unit tests (run before every commit)
```

## Architecture

```
app/ (routes) → components/ → hooks → engine facade (engine/index.ts) → engine modules
                     ↑                            ↑
                content/ (copy)            registry/ (data)
```

- `src/engine/`: pure TypeScript. No React, Next, DOM or `window`. Pipeline:
  `parse → validate → normalize (BTU/hr) → convert → format`, each step returns `Result<T>`.
  `Quantity { value, unit, kind }`; kinds `capacity | energy | electrical` never mix.
  Strategies: electrical input, size-class region, number parser.
- `src/registry/`: data only (units, routes, numeric pages, chart rows, size classes, FAQs, redirects).
  **Adding a page or redirect = adding an entry.** The route registry drives metadata, sitemap,
  links, breadcrumbs and tests.
- `src/content/<locale>/`: all user-facing copy, keyed by locale. Only `en-US` is live.
  Client components (and anything they import) read `getUiContent()` from `@/content/ui`, never
  `@/content`, so page-only copy stays out of the browser bundle. A test enforces it.
- `src/components/`: narrow props (e.g. `ResultPanel` takes a `ConversionResult`).
- `src/lib/analytics/`: `Analytics` interface; props carry only mode, unit, error code, route. **Never values.**
- `src/config/`: `site.ts`, `fonts.ts`, `locale.ts`.
- `scripts/`: build-time generators (`_redirects`, `_headers`, OG fallback).

## Conventions

- TypeScript strict + `noUncheckedIndexedAccess`. No `any` without a comment explaining why.
- User-input mistakes return `Result` errors, never throw.
- Numeric routes come from one `[slug]` template + registry + one copy builder.
- Share state only in the URL fragment (`#v=24000&u=btuh&p=4`), never query strings.
- `localStorage` only through `lib/safe-storage.ts`; the site works without storage.
- No `dangerouslySetInnerHTML` except JSON-LD built from our own data.
- Small, focused commits; run `pnpm check` first.
- Tests: `tests/engine` (one file per module + `acceptance-table.test.ts` + `units.property.test.ts`),
  `tests/registry`, `tests/e2e`, `tests/visual`.

## Skills

- Pages and data flow → Next bundled docs (`node_modules/next/dist/docs/`) + `btutotons` skill.
- Components → `shadcn` + `impeccable`, reading `docs/DESIGN.md`.
- After each UI milestone → `/impeccable critique`, then `/impeccable polish`.
- Before each release gate → `web-design-guidelines` audit + `vercel-react-best-practices` review.

## Definition of done (every milestone)

Strict types, clean lint, green unit/e2e/a11y/visual tests; no calculation outside the engine; every
new page in the route registry with metadata and tests; copy checked against the never-say list;
360px, 200% zoom and keyboard checked; `docs/DECISIONS.md` updated.
