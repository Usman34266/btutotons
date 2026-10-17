# Launch checklist

The M7 gate (build prompt §16) needs this signed off. Each item names its source. Tick an item only
when it's true in production.

## Repository and CI

- [x] GitHub repository created and this repo pushed to it (`Usman34266/btutotons`).
- [x] Repository secrets `CLOUDFLARE_API_TOKEN` (the "Edit Cloudflare Workers" token template) and `CLOUDFLARE_ACCOUNT_ID`.
- [x] Repository variable `CLOUDFLARE_DEPLOY_ENABLED=true` (the deploy job skips until it's set).
- [x] CI green on `main`: lint, format, typecheck, unit tests with coverage, build, Playwright, Lighthouse
      (build prompt §15, §16).
- [x] Cloudflare's own Git build disconnected, so only CI deploys (D111).

## Cloudflare (build prompt §15)

- [x] `btutotons.com` attached to the `btutotons` Worker as a custom domain (also in `wrangler.jsonc`; D111).
- [ ] Email to `contact@btutotons.com` still arrives now that Cloudflare runs the DNS (the MX records point to
      the registrar's forwarding at hosts.co.uk); if not, set up Cloudflare Email Routing.
- [ ] Rocket Loader off.
- [ ] Email Obfuscation off.
- [ ] Always Use HTTPS on.
- [ ] Web Analytics enabled for the site (cookieless), or the sentence about it removed from `/privacy/`
      before launch (D084).

## Content and placeholders (`src/config/site.ts`)

Each stays `null` and hidden until a real value exists (CLAUDE.md rule 6). Launching with them unset is fine.

- [ ] Owner's final legal read of `/about/`, `/privacy/` and `/terms/` (D089).
- [ ] `operator` and `contactEmail`: shown on the legal pages once set. Setting `contactEmail` also lists `/contact/` (sitemap, footer, indexing; D106).
- [ ] Embed: after deploy, frame `https://btutotons.com/embed/` from another https site and confirm it loads; every other page must refuse framing.
- [ ] `releaseDate`: turns on "Method updated" and the sitemap's `lastModified`.
- [ ] `reviewer`: turns on the reviewer line once a real HVAC review has happened.
- [ ] `logo`: set to `/logo.png` (D109). After deploy, confirm the Organization logo in Google's Rich Results Test
      and the favicon in a browser tab (light and dark).
- [ ] `customEvents` (Zaraz) stays `false` until verified cookieless (PRD open decision #4).

## After the first production deploy

- [ ] Smoke check on `https://btutotons.com` (`curl -I`): `/btu-to-tons-calculator/` 301s to `/`, an
      unknown path returns 404, the security headers are present, and `/opengraph-image` is `image/png`.
- [ ] Sitemap submitted in Google Search Console.
- [ ] After two weeks of traffic: p75 LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 in Web Analytics
      (build prompt §13; D094).
