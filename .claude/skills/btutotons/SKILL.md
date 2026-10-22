---
name: btutotons
description: Project rules for btutotons.com. Use when writing or reviewing any page, component, copy, unit label, engine code or route in this repo: Coolant design tokens, quantity-kind and unit-labelling rules, the never-say list, exact error and tooltip copy, copy tone, and static-export constraints.
---

# btutotons project rules

Pair with `docs/DESIGN.md` (full design system) and `docs/STANDARDS-CHEATSHEET.md` (facts).
If something you need is not in these files, **ask; do not invent it.**

## 1. Static-export constraints (override any other skill)

- `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }`.
- **Not allowed:** middleware/proxy, server actions, request-time route handlers, `cookies()`/`headers()`,
  `next.config` redirects/headers/rewrites, ISR, default `next/image` loader, Node runtime features,
  `cacheComponents`.
- Redirects → `src/registry/redirects.ts` → `public/_redirects`. Headers → `scripts/generate-headers.ts` → `public/_headers`.
- Dynamic routes need `generateStaticParams` and `dynamicParams = false`.
- `sitemap.ts` / `robots.ts` must emit static files. Browser APIs only inside effects or event handlers.
- SVG for visuals; plain `<img>` with width/height otherwise.

## 2. Quantity kinds

| Kind         | Meaning                                          | Chip               | Token        |
| ------------ | ------------------------------------------------ | ------------------ | ------------ |
| `capacity`   | Heat removed per hour (BTU/hr, tons, cooling kW) | "Cooling capacity" | `--accent`   |
| `electrical` | Power drawn from the wall (W, kW)                | "Electrical input" | `--electric` |
| `energy`     | Heat over time (BTU, ton-hours)                  | "Thermal energy"   | `--energy`   |

- Kinds never mix; the types make mixing a compile error.
- **Cooling kW is capacity, not electricity.** Always say "cooling kW".
- Ton-hours are thermal energy: "Thermal energy — not electricity use."

## 3. Unit labelling

- Capacity fields are always **"BTU/hr"**. A bare "BTU" is energy.
- Page H1s may say "BTU" to match search language; the first sentence then says "per hour".
- "Tons" = refrigeration tons. Never weight, never refrigerant charge.
- A bare "MMBTU" never silently becomes MMBTU/hr.
- Pluralize: "1 refrigeration ton", "2 refrigeration tons"; "1 ton equals", "2 tons equal".
- Horsepower = mechanical hp only, labelled as a unit equivalence, never motor sizing (D112).
- Unsupported, do not add: kcal/hr, fuel mass, CO₂, cooling-tower tons, Japanese tons.

## 4. Never say

- Any breaker or wire size derived from tons.
- "Manual J", "ASHRAE compliant", "certified", "approved by ENERGY STAR".
- "You need a X ton AC" / "Buy" / "correctly sized".
- Bare "BTU" as a capacity rating without "/hr" in labels.
- "First", "only", "best" claims about the tool.
- Fake ratings, review stars, or a reviewer name that hasn't actually reviewed.
- Converting SEER2 to EU SEER (or the reverse).
- "Uses X kW of electricity" when talking about cooling kW.

Also: a conversion is not a sizing recommendation. Size class labels an AC the user already has.

## 5. Copy tone

- Answer first. Plain English, about grade 7–8. Details behind "Show the math" / "Details".
- Say it like a person: "Your 19,000 BTU AC is a **1.5 ton** AC." Then exact numbers.
- Size class copy:
  - Class: "**Sold as a 1.5 ton AC.** Exact: 1.58 tons."
  - Between: "**Between the 1.5 and 2 ton sizes.** Exact: 1.75 tons."
  - Outside: exact tons only, no class sentence.
  - Tooltip: "ACs are named by nominal size. A 1.5 ton AC is 18,000 BTU/hr nominal; the rated capacity on the spec sheet can be a little higher or lower."
- Result note: "1 refrigeration ton = 12,000 BTU/hr. Cooling kW is cooling capacity, not electricity use."
- Compare note: "Capacity difference only. Efficiency, room suitability and actual performance are separate."

### Error copy (exact)

| Code             | Message                                                          |
| ---------------- | ---------------------------------------------------------------- |
| EMPTY            | Enter your AC's rating, like 18000.                              |
| NEGATIVE         | Capacity can't be negative.                                      |
| NOT_A_NUMBER     | Use numbers only, like 24000 or 24,000.                          |
| DECIMAL_COMMA    | Use a dot for decimals, like 1.5.                                |
| SCIENTIFIC       | Type the full number, like 1200000.                              |
| TOO_LARGE        | That's bigger than this tool supports (up to 1,000,000,000,000). |
| ZERO_NOT_ALLOWED | This value must be more than 0.                                  |

Errors sit under the field, linked with `aria-describedby`; the old result hides until input is valid.

### Tooltip copy (exact)

- BTU/hr: "How much heat an AC removes each hour. AC labels often drop the '/hr'."
- Ton: "12,000 BTU/hr. It comes from the cooling of melting a ton of ice per day — not the AC's weight."
- Cooling kW: "Cooling capacity in metric units. Not the electricity the AC uses."
- EER (P1): "Cooling per watt of electricity. US EER is BTU/Wh; European EER is W/W."

## 6. Coolant tokens

| Token           | Light   | Dark    |
| --------------- | ------- | ------- |
| `--bg`          | #F7F8FA | #0B0F14 |
| `--surface`     | #FFFFFF | #121821 |
| `--ink`         | #0E1726 | #E7ECF2 |
| `--muted`       | #5B6676 | #94A0B0 |
| `--border`      | #E3E7ED | #232C38 |
| `--accent`      | #0B6E99 | #5CC2EE |
| `--accent-soft` | #E6F3F9 | #0F2A38 |
| `--electric`    | #B45309 | #F5A524 |
| `--energy`      | #6D28D9 | #B59CF5 |
| `--danger`      | #B42318 | #F97066 |
| `--success`     | #1E7F4F | #4ADE80 |

- IBM Plex Sans / Mono; `tabular-nums` on every number. 16px minimum body, 44px targets.
- Spacing 4/8/12/16/24/32/48/64; radius 8 (controls) / 12 (cards); borders first, one shadow (converter card).
- Focus ring: 2px `--accent` + 2px offset.
- Motion: transform/opacity only, 150–200ms ease-out, static under `prefers-reduced-motion`, never delays the answer.
- No purple gradients, glassmorphism, emoji, count-up animations, nested card stacks, popups, ads.

## 7. Before you finish

- [ ] No calculation outside `src/engine`; engine imported only via `@/engine`.
- [ ] No hard-coded colors; tokens only.
- [ ] Copy checked against §4 and the exact copy in §5.
- [ ] No placeholder faked (`site.reviewer`, `site.releaseDate`, `site.logo` stay null until real).
- [ ] New route added to the registry with metadata and tests.
