# Design system: "Coolant"

**Direction:** a precision instrument that feels calm and friendly. Engineering-datasheet clarity,
warm plain-language copy.

**Never:** purple gradients, glassmorphism, emoji, count-up animations, nested card stacks,
ad slots, popups, sticky overlays, autoplay.

**Rulebook order** (earlier wins): build prompt → WCAG 2.2 AA → GOV.UK Design System (form, hint and
error patterns) → Vercel Web Interface Guidelines (interaction details) → these tokens.

Code: `src/styles/tokens.css`, `typography.css`, `motion.css`, mapped into Tailwind v4 via `@theme`
in `src/app/globals.css`. **No hard-coded colors outside tokens.**

---

## 1. Color tokens

| Token           | Light   | Dark    | Use                    |
| --------------- | ------- | ------- | ---------------------- |
| `--bg`          | #F7F8FA | #0B0F14 | page                   |
| `--surface`     | #FFFFFF | #121821 | cards, inputs          |
| `--ink`         | #0E1726 | #E7ECF2 | primary text           |
| `--muted`       | #5B6676 | #94A0B0 | labels, hints          |
| `--border`      | #E3E7ED | #232C38 | dividers, inputs       |
| `--accent`      | #0B6E99 | #5CC2EE | actions, capacity chip |
| `--accent-soft` | #E6F3F9 | #0F2A38 | result panel           |
| `--electric`    | #B45309 | #F5A524 | electrical chip        |
| `--energy`      | #6D28D9 | #B59CF5 | energy chip            |
| `--danger`      | #B42318 | #F97066 | errors                 |
| `--success`     | #1E7F4F | #4ADE80 | copied state           |

- All text ≥ 4.5:1 contrast in both themes, on every surface it appears on (`--bg`, `--surface`,
  `--accent-soft`). Checked by an automated test in M2.
- **Meaning never relies on color alone.** Chips carry an icon and a text label; errors carry text.
- shadcn semantic variables (`--background`, `--primary`, …) are aliases of these tokens, not a second palette.
- Dark mode: `next-themes`, class strategy, system default, no flash.

## 2. Typography

- **IBM Plex Sans** (UI, variable weight) and **IBM Plex Mono** (formulas, batch table), via `next/font`, Latin subset.
- `font-variant-numeric: tabular-nums` on **every** number.

| Role          | Size                          | Weight | Line height |
| ------------- | ----------------------------- | ------ | ----------- |
| Result number | `clamp(2.5rem, 6vw, 3.75rem)` | 600    | 1.05        |
| H1            | 2.25–2.5rem                   | 650    | —           |
| H2            | 1.5rem                        | 600    | —           |
| Body          | 1rem (16px minimum)           | 400    | 1.55        |
| Label         | 0.875rem                      | 500    | —           |

## 3. Space, shape, layout

- 4px base scale: **4, 8, 12, 16, 24, 32, 48, 64**.
- Section gap 24px · card padding 16–24px · max width 1120px · 16px side gutter on mobile.
- Radius 8px (controls), 12px (cards).
- **Borders first.** Only the main converter card gets one soft shadow.
- Touch targets ≥ 44 × 44px.
- **Desktop converter:** two columns: input ~7/12, result ~5/12 on `--accent-soft`.
- **Below 768px:** one column: H1 → direction tabs → input → result → actions → quick values.
- The answer is visible in the first screen on a 360px phone, without scrolling.
- Reserve space for the result panel and size-class line (no layout shift while typing).

## 4. Signature elements

| Element                 | Spec                                                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quantity chips**      | Every result shows a labelled chip with an icon: "Cooling capacity" (accent), "Electrical input" (electric), "Thermal energy" (energy).                                                                                            |
| **Ice blocks**          | Small SVG beside the result. One block per ton; fractions are partial blocks. Max 6 drawn, then "+N". Caption: "1 ton = the cooling of melting 2,000 lb of ice per day." Gentle melt/form transition; static under reduced motion. |
| **Digit morph**         | Only changed digits roll, ~200ms. Number readable instantly. Tabular digits.                                                                                                                                                       |
| **Direction flip**      | View Transitions API swaps input and result when direction changes (progressive enhancement).                                                                                                                                      |
| **Capacity ruler** (P1) | Horizontal scale with bands "Window/room units", "Mini-splits", "Residential central", "Light commercial"; marker slides to the value. Label: "Common capacity examples — not a sizing recommendation."                            |
| **Unit tooltips**       | "?" beside BTU/hr, ton, cooling kW (and EER in P1). Popovers: reachable by keyboard and touch, Escape closes. Copy: `STANDARDS-CHEATSHEET.md` §9.                                                                                  |

## 5. Motion rules

1. Motion never delays the answer.
2. Every animation explains something.
3. `prefers-reduced-motion` gets static versions.
4. Animate only `transform` and `opacity`.
5. 150–200ms, ease-out.
6. Server HTML shows the final state.

## 6. Component states

Every interactive component defines: **default, hover, focus-visible, active, disabled, error,
loading** (if async), **empty**.

- Focus ring: 2px `--accent` + 2px offset. Always visible on keyboard focus.
- All states are shown on `/dev/components` (M2; excluded from the export).

### Form pattern (GOV.UK)

- Real `<label>` above the field, hint text under the label, error under the field.
- Error linked with `aria-describedby`; the old result hides until input is valid again.
- Numeric input: `inputMode="decimal"`, placeholder "e.g. 18000", accepts `19,000`.
- Enter converts. Results announced with `aria-live="polite"`, debounced, valid input only. Focus never jumps.

## 7. Copy tone

- **Answer first.** Plain English at about a grade 7–8 reading level. Details sit behind "Show the math" and "Details".
- **Say it like a person:** "Your 19,000 BTU AC is a **1.5 ton** AC." Then the exact numbers.
- Explain every unit where it appears (tooltips).
- Human error messages, never "Invalid input" (exact copy in the build prompt §10.6).
- **Never mislead.** A conversion is not a sizing recommendation. Cooling kW is not electricity use.
  Tonnage never determines breaker size.
- The never-say list lives in `.claude/skills/btutotons/SKILL.md` and is part of every copy review.
