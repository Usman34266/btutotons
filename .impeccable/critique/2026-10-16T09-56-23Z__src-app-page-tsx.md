---
target: homepage converter (M3)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:/Users/usmanghani/Gigs/SiteBank/btutotonscalculator/src/app/page.tsx"
target_fingerprint: "sha256:6cdb3c58e9a9e305235031072b7ac8fecf6632a3d11085cab54a961ec1005992"
target_path: /Users/usmanghani/Gigs/SiteBank/btutotonscalculator/src/app/page.tsx
timestamp: 2026-10-16T09-56-23Z
slug: src-app-page-tsx
---
Method: dual-agent (A: 53adfcdf-0080-448f-ba3b-e4f9a81af5bd · B: 18369e89-2683-4d38-a741-063a6777c045)

Target: src/app/page.tsx (homepage converter, M3 scope: header, H1, converter). Operate mode. Chart, explainers, compare/batch, FAQ, trust block, footer and header nav are later milestones and not scored as missing.

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                     |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Empty/error panel shows a bold "12,000 BTU/hr = 1 ton" + one full ice block where the answer sits |
| 2         | Match System / Real World       | 3         | Three tons numbers for one question (1.5 ton, 1.5833, "Exact: 1.58")                          |
| 3         | User Control and Freedom        | 3         | Flip/unit carry restores exact text; Reset sits in the other column from the field            |
| 4         | Consistency and Standards       | 3         | "Show the math" open state paints a near-black pill on the teal panel (dark)                  |
| 5         | Error Prevention                | 2         | A tons value typed in BTU/hr mode ("1.5") gives "less than 0.01 tons" with no hint            |
| 6         | Recognition Rather Than Recall  | 3         | Placeholder, hint, quick values; label-reading guide comes in M6                              |
| 7         | Flexibility and Efficiency      | 3         | Enter converts, fragment share, remembered precision, 7 units                                 |
| 8         | Aesthetic and Minimalist Design | 2         | 12-item result stack; "12,000 BTU/hr = 1 ton" appears three times                             |
| 9         | Error Recovery                  | 3         | Exact human messages under the field; stale "1 ton" headline stays during the error            |
| 10        | Help and Documentation          | 3         | Popover per unit + Show the math                                                              |
| **Total** |                                 | **28/40** | **Good**                                                                                      |

## Design Specificity Verdict

LLM: the copy and behaviour are authored for this product ("Sold as a 1.5 ton AC", "between sizes", the Cooling capacity chip, "cooling kW" everywhere). The visual shell is category-interchangeable: white two-column card, pale result pane, outline buttons. The ice blocks are the only product-specific visual and read as unchecked checkboxes; partial and full blocks look alike in dark mode.

Deterministic scan: `impeccable detect` on src/app/page.tsx + src/components: 0 findings. Browser overlay in 5 states (desktop empty, desktop result + math, mobile result, mobile dark error, tons fragment): "No anti-patterns found." The site CSP blocks the injected detector (script-src and no wasm-unsafe-eval); it ran only in a test browser context with CSP bypassed. The detector catches pattern-level slop, not the semantic hierarchy issues below.

## Priority Issues

1. [P1] The biggest number is not the owner's answer, and "Exact" contradicts it. Sentence says 1.5 ton (18px), the 60px number says 1.5833, the size line says "Exact: 1.58 tons" (fixed 2 decimals). Fix: keep copy; decide whether "Exact" follows the chosen precision; consider a calmer big number when a size class exists. Command: clarify, typeset.
2. [P1] Empty and error panels look like a result; the empty panel pushes quick values off a phone screen. The invalid state keeps the bold rule + full ice block; `min-h-[26rem]` reserves ~400px of blank panel on mobile. Fix: invalid state shows only the prompt; empty state leads with the prompt; drop the min-height below md. Command: clarify, adapt.
3. [P2] Ice blocks look like checkboxes and explain little; partial vs full indistinguishable in dark. Fix: clear water line for the fraction, higher-contrast fill, place nearer the number. Command: bolder, layout.
4. [P2] Tons typed in BTU/hr mode passes silently. Fix: non-blocking nudge toward Tons → BTU/hr below a threshold; needs owner-approved copy and threshold. Command: harden.
5. [P2] Result panel is one undifferentiated stack; the "not electricity use" note is the quietest text, two elements from the kW row. Fix: group answer / details (note directly under kW) / explanation / tools. Command: distill, layout.

## Persona Red Flags

Jordan: three tons figures at once; the empty-state block looks tappable; "refrigeration tons" grey box in tons mode looks like a disabled dropdown; error state's bold "1 ton" reads as an answer.
Sam: live region speaks the size fact twice and never the precise value; precision group uses a hard-coded id (`precision-label`) that will collide when two converters render; direction-tabs comment says pressed-button semantics but the control exposes radios.
Casey: empty state at 360px puts quick values ~925px down; Reset alone on its own row; good: fragment state survives interruptions, all targets ≥ 44px.

## Minor Observations

- Ghost buttons on the result panel hover/expand to `bg-muted` (= --bg): black pill in dark, grey patch in light.
- Size-line info icon drifts to the far right when the line wraps on mobile.
- Quick-value "BTU/hr" sublabels are 12px muted text.
- Desktop left column is mostly empty under the quick values when a result is open.
- "Your numbers" shows only the tons equation.
- Header logo and H1 repeat "BTU to Tons" 40px apart (brand name is mandated).

## Questions to Consider

- If 80% of users want "what size is it?", should "1.5 ton" be the visual peak and 1.5833 the technician's second line?
- Does the empty result panel need to exist on mobile before the first keystroke?
- If the ice blocks disappeared, would anyone notice? Make them the visual beside the number, or cut them.
