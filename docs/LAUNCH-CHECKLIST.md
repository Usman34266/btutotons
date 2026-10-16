# Launch checklist

The M7 gate (build prompt §16) needs this signed off. Each item names its source. Tick an item only
when it's true in production.

## Repository and CI

- [ ] GitHub repository created and this repo pushed to it (no remote yet).
- [ ] Repository secrets `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" token template) and `CLOUDFLARE_ACCOUNT_ID`.
- [ ] Repository variable `CLOUDFLARE_DEPLOY_ENABLED=true` (the deploy job skips until it's set).
- [ ] CI green on `main`: lint, format, typecheck, unit tests with coverage, build, Playwright, Lighthouse
      (build prompt §15, §16).

## Cloudflare (build prompt §15)

- [ ] `btutotons.com` attached to the `btutotons` Worker as a custom domain (`wrangler.jsonc` has no route yet).
- [ ] Rocket Loader off.
- [ ] Email Obfuscation off.
- [ ] Always Use HTTPS on.
- [ ] Web Analytics enabled for the site (cookieless), or the sentence about it removed from `/privacy/`
      before launch (D084).

## Content and placeholders (`src/config/site.ts`)

Each stays `null` and hidden until a real value exists (CLAUDE.md rule 6). Launching with them unset is fine.

- [ ] Owner's final legal read of `/about/`, `/privacy/` and `/terms/` (D089).
- [ ] `operator` and `contactEmail`: shown on the legal pages once set.
- [ ] `releaseDate`: turns on "Method updated" and the sitemap's `lastModified`.
- [ ] `reviewer`: turns on the reviewer line once a real HVAC review has happened.
- [ ] `logo`: adds the Organization logo to the JSON-LD.
- [ ] `customEvents` (Zaraz) stays `false` until verified cookieless (PRD open decision #4).

## After the first production deploy

- [ ] Smoke check on `https://btutotons.com` (`curl -I`): `/btu-to-tons-calculator/` 301s to `/`, an
      unknown path returns 404, the security headers are present, and `/opengraph-image` is `image/png`.
- [ ] Sitemap submitted in Google Search Console.
- [ ] After two weeks of traffic: p75 LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 in Web Analytics
      (build prompt §13; D094).
