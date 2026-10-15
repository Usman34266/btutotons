# PRD: btutotons.com

Status: draft for M0 review · Owner: product · Build prompt wins where this differs.

## 1. Problem

AC owners read a BTU rating on a spec sheet or label ("19,000 BTU") but shop, talk and get quotes in
tons ("1.5 ton"). Converting is simple arithmetic, but people get stuck on three things:

1. The exact answer (1.58 tons) doesn't match the size name the AC is sold under (1.5 ton).
2. Units are mixed up: BTU vs BTU/hr, cooling kW vs electricity, tons of capacity vs tons of weight
   or refrigerant charge.
3. Many converter sites bury the answer under ads, popups and long intros, or quietly turn a
   conversion into a sizing recommendation.

HVAC technicians have the opposite problem: they need exact numbers, the formula and bulk conversion,
often on a phone with weak signal.

## 2. Users

| User                             | Share | Context                                                             | Core question                                           |
| -------------------------------- | ----- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| **AC owner**                     | ~80%  | Phone, holding a spec sheet or standing at the unit; not technical  | "My AC says 19,000 BTU. What ton is it?"                |
| **HVAC technician / contractor** | ~20%  | Phone in a basement or on a roof; converting lists, comparing units | "Exact TR and kW for these 40 values, with the formula" |

## 3. Goals

1. Answer the owner's question in the first screen of a 360px phone, in a plain sentence.
2. Be exactly right: NIST constants, documented rounding, full acceptance-test coverage.
3. Never mislead: no sizing advice, no electricity claims from cooling kW, no breaker sizing.
4. Be the fastest, calmest version of this tool: no ads, popups, logins or cookie banners.
5. Rank for "BTU to tons" and the numeric long tail through genuinely useful static pages.

## 4. Scope

### P0: launch (M0–M7)

| Area            | Requirement                                                                                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Converter `/`   | BTU/hr ↔ tons (+ cooling kW), all capacity units in the registry, direction tabs, size class, show the math, precision 2/4/6, quick values, copy/share/reset, fragment state |
| Size class      | "Sold as a 1.5 ton AC" with ±10% rule and "between sizes" state                                                                                                              |
| Compare         | `/#compare`: two ratings, difference in BTU/hr, TR, kW and %                                                                                                                 |
| Batch           | `/batch-btu-to-tons/`: up to 200 values, CSV export with injection protection                                                                                                |
| Numeric pages   | 20 registry-driven pages (12 BTU→tons, 8 tons→BTU)                                                                                                                           |
| Content         | Reference chart, explainers, FAQ, trust block, `/tons-to-btu/`                                                                                                               |
| Nameplate guide | `/ac-tonnage-by-model-number/`: illustrated nameplate, explicit-capacity form, no automatic lookup                                                                           |
| Static pages    | about, methodology, privacy, terms, 404                                                                                                                                      |
| Platform        | SEO registry (metadata, sitemap, redirects, breadcrumbs, JSON-LD), headers, social images, CI, Cloudflare deploy                                                             |

### P1: extensions (M8–M12; each route published only when live and HVAC-reviewed)

kW and time-unit routes · ton-hours · power & cost (EER US/EU, COP, known watts) · room AC estimator
(ENERGY STAR table) + capacity ruler + load-report panel · offline PWA, QR "show customer", capacity
card export.

### Out of scope

- P2 model-number lookup (automatic decoding of model numbers).
- Ads and ad slots.
- Markets other than the US at launch (EU is built in the engine and locale layer, not routed).
- Sizing recommendations of any kind; Manual J; breaker or wire sizing.
- Units: horsepower, kcal/hr, fuel mass, CO₂, cooling-tower tons, Japanese tons.

## 5. Functional requirements (P0)

| ID  | Requirement                                                                                                                                                                   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Parse en-US numbers 0–10¹² with or without thousands separators; reject the cases listed in STANDARDS-CHEATSHEET §3 with human error copy.                                    |
| F2  | Normalize every capacity unit to BTU/hr and output TR and cooling kW at full precision.                                                                                       |
| F3  | Display at 2/4/6 decimals (default 4), trim whole numbers, "less than 0.0001 TR" for tiny values.                                                                             |
| F4  | Show size class per the ±10% rule: class, between, or outside.                                                                                                                |
| F5  | Result sentence: "Your {value} BTU AC is a **{class} ton** AC." plus exact numbers and a note that cooling kW is not electricity use.                                         |
| F6  | "Show the math" reveals the equation (e.g. `19,000 ÷ 12,000 = 1.5833`).                                                                                                       |
| F7  | Share state lives only in the URL fragment (`#v=24000&u=btuh&p=4`).                                                                                                           |
| F8  | Compare A and B; percentage unavailable when A = 0.                                                                                                                           |
| F9  | Batch up to 200 lines, keep order, show invalid rows with reason, export CSV (fixed columns, injection-safe).                                                                 |
| F10 | 20 numeric pages from one template + registry, each with answer, editable prefilled converter, worked example, neighbour comparison, room-fit explanation, links, breadcrumb. |
| F11 | Every route in one registry that drives metadata, sitemap, links, redirects, breadcrumbs and tests.                                                                           |
| F12 | Remember precision and theme per device; work fully without storage.                                                                                                          |

## 6. Non-functional requirements

| Area          | Target                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| Performance   | p75 LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1; Lighthouse ≥ 95 in all categories (mobile); homepage initial JS ≤ ~100 KB gz |
| Accessibility | WCAG 2.2 AA; axe zero violations on every route; 200% zoom and 360px with no horizontal scroll; full keyboard flow   |
| Privacy       | All calculation in the browser; cookieless analytics; no user values in analytics                                    |
| Security      | HSTS, nosniff, referrer policy, permissions policy, frame DENY, CSP; CSV injection protection                        |
| Hosting       | Static export on Cloudflare; no server runtime                                                                       |
| Offline       | After first visit (P1, M12)                                                                                          |
| Quality       | TypeScript strict; 100% line coverage in `src/engine`; acceptance table + property tests                             |

## 7. Success metrics

Counted with cookieless analytics (no values captured):

- Share of home sessions with a `valid_conversion`.
- `size_class_shown` per valid conversion.
- Usage of `preset_selected`, `compare_completed`, `batch_exported`.
- Organic landing share on numeric pages.
- Core Web Vitals pass rate (field data) and Lighthouse scores in CI.

Proposed: set numeric targets after four weeks of baseline data (owner to confirm).

## 8. Open decisions

| #   | Item                                                                                                        | Blocks                                                   |
| --- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | HVAC reviewer name and sign-off (size-class band and lists; P1 methods). `site.reviewer = null` until then. | Reviewer line in trust block; every P1 tool              |
| 2   | Actual release date for "Method updated".                                                                   | Trust block, methodology                                 |
| 3   | Organization logo file.                                                                                     | JSON-LD `Organization.logo`, header mark                 |
| 4   | Whether Cloudflare Zaraz custom events are acceptable (verified cookieless). Otherwise page views only.     | Custom analytics events                                  |
| 5   | Final status of the EU ecodesign/labelling revision.                                                        | Europe pages only                                        |
| 6   | Spec PDF (`docs/source/btu-to-tons-spec-v2.pdf`) not yet in the repo.                                       | FAQ copy (spec p.18) in M5; P1 page copy (spec pp.24–26) |
