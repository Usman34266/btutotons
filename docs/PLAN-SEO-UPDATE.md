# SEO update plan (October 2026)

Source: `BTU-to-Tons-SEO-Priority-Plan.pdf` (Hasnain, 18 Oct 2026), plus five pages from
btutowatts.com the owner wants used as inspiration. Status: **built 2026-10-22 (D113), unpublished; waiting at the gate for the HVAC review.**

## 1. What the PDF asks for

Six calculator pages (ranked by competitor traffic, not by volume for us) and six blog articles
(US search volumes unverified; the PDF says to check them before committing the calendar).

## 2. What already exists (the PDF could not see the live site)

| PDF page        | URL in PDF       | Status in this repo                                  |
| --------------- | ---------------- | ---------------------------------------------------- |
| BTU/hr to kW    | `/btu-to-kw/`    | **Live** (M8, D108)                                  |
| kW to BTU/hr    | `/kw-to-btu/`    | **Live** (M8, D108)                                  |
| Tons to kW      | `/tons-to-kw/`   | **Live** (M8, D108), with the 0.5-5 ton table        |
| MBH to BTU/hr   | `/mbh-to-btu/`   | **Missing.** `kbtuh` (MBH) unit exists in the engine |
| Watts to BTU/hr | `/watts-to-btu/` | **Missing.** `w` unit exists in the engine           |
| BTU/hr to Watts | `/btu-to-watts/` | **Missing.** `w` unit exists in the engine           |

So the real calculator work is three new pages plus a gap review of the three live ones against the
PDF briefs. The blog does not exist at all (no route kind, no content type).

## 3. Conflicts with project rules (each needs an owner decision)

1. **"Thermal kW / thermal watts" vs "cooling kW / cooling W".** D100 chose "cooling kW everywhere"
   and the `btutotons` skill requires it. The PDF says "thermal". Proposal: keep "cooling", keep the
   PDF's numbers and its "not electrical input" warnings.
2. **Horsepower.** PRD section 4 (out of scope) and cheatsheet section 2 list horsepower as not
   supported. btutowatts has a BTU/hr to horsepower page. Adding it reverses that decision and
   needs a new sourced constant (cheatsheet rule: "if a fact is not here, do not use it").
3. **Heating vs cooling.** The MBH brief wants a "heating-versus-cooling capacity explanation".
   Everything on the site is cooling capacity. Needs an owner-approved wording.
4. **Blog.** Not in the PRD or the build prompt. The briefs cite manufacturer pages (LG, Mitsubishi,
   Carrier, Dometic, Pioneer); rule 1 ("never invent facts") means each claim must come from those
   sources and be recorded, and the P1 gate means an HVAC review before publishing.
5. **Constants.** PDF factors (3,412.141633 BTU/hr per kW; 0.2930710702 W per BTU/hr; 3.5168528421
   kW per ton) match the cheatsheet. The PDF's example "3.5 kW = 11,942.50 BTU/hr" checks out
   (11,942.4957). No new constants needed for the three missing calculators.

## 4. Decisions (answered, recorded as D112)

| #   | Question         | Recommendation                                                                    |
| --- | ---------------- | --------------------------------------------------------------------------------- |
| Q1  | Wording          | **Keep both:** label "cooling kW/W", copy also says "also called thermal kW" once |
| Q2  | Horsepower       | **Add now** (mechanical hp only; NIST constant added to cheatsheet)               |
| Q3  | Blog             | **Skipped**, no content yet                                                       |
| Q4  | btutowatts pages | **All five reviewed**, see section 5                                              |

## 5. btutowatts.com pages, mapped

| Their page                    | Our equivalent                              | Proposed action                                    |
| ----------------------------- | ------------------------------------------- | -------------------------------------------------- |
| `/kw/` (BTU/hr to kW)         | `/btu-to-kw/`                               | Already live. Borrow only the idea of a size scale |
| `/mbh/` (BTU/hr to MBH)       | none; PDF wants the reverse, `/mbh-to-btu/` | Build both directions (one registry entry each)    |
| `/horsepower/` (BTU/hr to hp) | none                                        | New: `/btu-to-hp/` (mechanical hp), plus reverse   |
| `/tons/` (BTU/hr to tons)     | homepage and 12 numeric pages               | Exists; no new page                                |
| `/btu-per-second-to-watts/`   | none; `btus` and `w` units exist            | New pair: `/btu-per-second-to-watts/`              |

Copy for any page is written fresh from our cheatsheet. We do not reuse their text or structure
beyond the idea of the pair.

## 6. Task list

Each milestone stops at a gate for approval (hard rule 8).

**M9a. Plan sign-off**

- [x] Owner answers Q1 to Q4 recorded as D112; PRD, cheatsheet and skill updated for horsepower.

**M9b. Three PDF calculators (unit-pair pages, registry-driven)**

- [x] `/mbh-to-btu/` (kbtuh to btuh; example 36 MBH = 36,000 BTU/hr = 3 tons; define MBH vs MMBTU/hr)
- [x] `/watts-to-btu/` (w to btuh; example 1,000 cooling W = 3,412.14 BTU/hr; input power is not cooling output)
- [x] `/btu-to-watts/` (btuh to w; example 12,000 BTU/hr = 3,516.85 cooling W; kW as secondary result; link to `/watts-to-btu/`)
- [x] For each: `UnitPageSlug` + `UNIT_PAGES` entry (`published: false`), copy in `unit-pages.ts` content, aliases, route registry, sitemap, homepage links
- [ ] Tests: engine example values, registry, e2e, never-say, 360px/200% zoom/keyboard
- [ ] Preview build, HVAC review recorded, then flip `published`

**M9c. Gap review of the three live pages against the PDF**

- [x] `/btu-to-kw/`: 9,000 / 12,000 / 18,000 / 24,000 presets; tons shown with kW; not-electrical note
- [x] `/kw-to-btu/`: tons shown; "clarify input units"; link to the reverse
- [x] `/tons-to-kw/`: 1-5 ton presets; BTU/hr result; worked spec comparison; "10.55 kW of cooling is not 10.55 kW of electrical input"
- [ ] Check meta titles against the PDF's suggestions (spec titles win where they conflict, D100)

**M9d. btutowatts-inspired additions**

- [x] `/btu-per-second-to-watts/` pair page
- [x] `/btu-to-hp/` and `/hp-to-btu/`: add `W_PER_HP` and the `hp` unit to the engine (ENGINE_VERSION bump, 100% coverage), decide its quantity kind, add the "unit equivalence, not motor sizing" copy
- [ ] Optional reverse `/watts-to-btu-per-second/`

**M10. Blog: DEFERRED (no content yet, D112)**

- [ ] Decide route kind and content type; `/blog/` index plus six articles in the route registry
- [ ] Verify keyword volumes in one US database before fixing the calendar (PDF requirement)
- [ ] Per article: symptom first, ordered checks, worksheet or log, link to the right converter, no diagnosis claims, no invented figures
- [ ] Sources recorded per claim; HVAC review before publishing

**Cross-cutting**

- [ ] Update homepage "All BTU and ton conversions" and sitemap counts
- [ ] Add LHCI URLs for new pages; keep homepage JS at or under 185 KB
- [ ] `pnpm check`, e2e, a11y, visual; DECISIONS entries for every choice
