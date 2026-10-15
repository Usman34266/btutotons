# btutotons.com

A fast, accurate BTU-to-tons calculator for AC owners and HVAC technicians.
Next.js static export, deployed to Cloudflare as static assets.

## Quick start

```bash
nvm use            # Node 24
pnpm install
pnpm dev           # http://localhost:3000
```

## Scripts

| Command              | What it does                                                                           |
| -------------------- | -------------------------------------------------------------------------------------- |
| `pnpm build`         | Generates `public/_redirects` and `public/_headers`, then exports the site to `out/`   |
| `pnpm preview`       | Serves `out/` with Wrangler on port 4173 (redirects, headers and 404 as in production) |
| `pnpm check`         | Lint, type-check and unit tests                                                        |
| `pnpm test:coverage` | Unit tests with coverage (engine must stay at 100%)                                    |
| `pnpm test:e2e`      | Playwright e2e and a11y tests against `pnpm preview` (run `pnpm build` first)          |
| `pnpm lhci`          | Lighthouse CI on `out/`                                                                |
| `pnpm deploy`        | `wrangler deploy` (CI does this on `main`)                                             |

## Docs

- [CLAUDE.md](CLAUDE.md): rules, commands and architecture for contributors and coding agents
- [docs/PRD.md](docs/PRD.md): product requirements
- [docs/DESIGN.md](docs/DESIGN.md): the "Coolant" design system
- [docs/STANDARDS-CHEATSHEET.md](docs/STANDARDS-CHEATSHEET.md): constants, formulas, units
- [docs/DECISIONS.md](docs/DECISIONS.md): decision log

## Cloudflare setup

- CI deploys when the repo variable `CLOUDFLARE_DEPLOY_ENABLED` is `true` and the secrets
  `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.
- In the Cloudflare dashboard: **Rocket Loader off**, **Email Obfuscation off** (both break hydration),
  **Always Use HTTPS on**.
