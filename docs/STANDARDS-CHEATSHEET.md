# Standards cheatsheet

The only allowed source of constants, formulas, units and limits besides the build prompt.
If a fact is not here, do not use it. Ask, then add it here with a source.

Code: `src/engine/constants.ts` (versioned by `ENGINE_VERSION`).

---

## 1. Constants

| Name             | Value                           | Exact?                                         | Source                |
| ---------------- | ------------------------------- | ---------------------------------------------- | --------------------- |
| `BTUH_PER_TON`   | 12,000 BTU/hr                   | Exact (definition of the US refrigeration ton) | Build prompt §2, §8.1 |
| `W_PER_BTUH`     | 0.2930710701722222 W per BTU/hr | Derived from 1 BTU_IT = 1,055.05585262 J       | NIST SP 811 App. B.8  |
| `FT2_PER_M2`     | 10.7639104167                   | From 1 ft² = 0.09290304 m² (exact)             | NIST SP 811 App. B.8  |
| `BTU_WH_PER_W_W` | 3.412141633                     | EER(US) = COP × this                           | Build prompt §8.1     |
| `W_PER_HP`       | 745.69987158227022 W per hp     | Mechanical hp = 550 ft·lbf/s (D112)            | NIST SP 811 App. B.8  |

- Use the **International Table BTU** only (not thermochemical, not 39/59/60 °F BTU).
- "Ton" means the **US refrigeration ton** only. Never weight, never refrigerant charge.

### Derived values (for tests and copy checks)

| Quantity           | Value                                          |
| ------------------ | ---------------------------------------------- |
| 1 TR in cooling kW | 3.5168528420667 kW                             |
| 1.5 TR             | 18,000 BTU/hr = 5.2752792631 kW                |
| 2 TR               | 24,000 BTU/hr = 7.0337056841 kW                |
| 19,000 BTU/hr      | 1.583333… TR = 5.5683503 kW                    |
| 1 TR               | 200 BTU/min = 3.3333333333333 BTU/s            |
| 1 TR, as ice       | the cooling of melting 2,000 lb of ice per day |

---

## 2. Units (registry: `src/engine/units.ts`, base = BTU/hr)

| id        | Label              | Kind     | toBase (→ BTU/hr)                |
| --------- | ------------------ | -------- | -------------------------------- |
| `btuh`    | BTU/hr             | capacity | x                                |
| `tr`      | refrigeration tons | capacity | x × 12,000                       |
| `kw`      | cooling kW         | capacity | x × 1,000 ÷ W_PER_BTUH           |
| `w`       | cooling W          | capacity | x ÷ W_PER_BTUH                   |
| `kbtuh`   | kBTU/hr (MBH)      | capacity | x × 1,000                        |
| `mmbtuh`  | MMBTU/hr           | capacity | x × 1,000,000                    |
| `btumin`  | BTU/min            | capacity | x × 60                           |
| `btus`    | BTU/s              | capacity | x × 3,600                        |
| `hp`      | horsepower (mech.) | capacity | x × W_PER_HP ÷ W_PER_BTUH (D112) |
| `btu`     | BTU (energy)       | energy   | energy tools only                |
| `tonhour` | ton-hours          | energy   | x × 12,000 BTU                   |

Quantity kinds: `capacity` (heat removal rate), `energy` (heat over time), `electrical` (power drawn).
They never mix. The type system makes mixing a compile error.

### Core formulas

```
TR          = BTU/hr ÷ 12,000
BTU/hr      = TR × 12,000
cooling kW  = BTU/hr × W_PER_BTUH ÷ 1,000
```

### Labelling rules

- Bare **"BTU" is energy.** Capacity fields are always labelled **"BTU/hr"**, even where a page H1
  says "BTU" to match search language. The first sentence of such a page adds "per hour".
- **"Tons"** always means refrigeration tons.
- A bare **"MMBTU"** never silently becomes MMBTU/hr.
- **Cooling kW is cooling capacity, not electricity use.**
- **Not supported:** kcal/hr, fuel mass, CO₂, cooling-tower tons, Japanese tons.

---

## 3. Input parsing (`src/engine/parse.ts`)

### en-US parser (all live routes)

- Accepts finite decimals from **0 to 10¹²** in the selected unit.
- Trim spaces, then match:
  `^\d{1,3}(,\d{3})+(\.\d+)?$|^\d+(\.\d+)?$`
- Accepts: `19000`, `1.5`, `19,000`, `1,200,000.5`.
- Rejects with codes:

| Input                                             | Code               |
| ------------------------------------------------- | ------------------ |
| blank                                             | `EMPTY`            |
| `-1`                                              | `NEGATIVE`         |
| `12abc`, `12,00` (malformed group)                | `NOT_A_NUMBER`     |
| `Infinity`, `NaN` (our mapping, see DECISIONS.md) | `NOT_A_NUMBER`     |
| `1,5`, `1.000,5` (see D028)                       | `DECIMAL_COMMA`    |
| `1e5`                                             | `SCIENTIFIC`       |
| > 10¹²                                            | `TOO_LARGE`        |
| 0 where zero is invalid (EER, COP, duration)      | `ZERO_NOT_ALLOWED` |

- Zero **capacity** is valid.

### eu-comma parser (built and tested, not routed at launch)

- `3,5` (decimal comma) and `12.000` (dot thousands) are valid.
- Never used by an en-US route.

---

## 4. Formatting (`src/engine/format.ts`)

- Full precision internally. Round only for display and export.
- Display precision: 2, 4 (default) or 6 decimals. Trim trailing zeros on whole numbers (`2`, not `2.0000`).
- A positive value smaller than the display step shows **"less than 0.0001 TR"** (step follows the chosen precision).
- `Intl.NumberFormat('en-US')` for display.
- CSV: up to 12 significant digits, no thousands separators.
- Pluralize: "1 refrigeration ton", "2 refrigeration tons".

---

## 5. AC size class (`src/engine/size-class.ts`, data in `src/registry/size-classes.ts`)

Labels an AC the user already has. **It never recommends a size.**

| Region                 | Classes                                                                              | Nominal              |
| ---------------------- | ------------------------------------------------------------------------------------ | -------------------- |
| US (live)              | 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 5 tons                                   | tons × 12,000 BTU/hr |
| EU (built, not routed) | 2.5 kW "9,000 BTU" · 3.5 kW "12,000 BTU" · 5.0 kW "18,000 BTU" · 7.0 kW "24,000 BTU" | nominal kW           |

Band: **0.10** (±10%, inclusive). _HVAC reviewer to confirm band and lists._

Rule:

1. For each class, `d = |BTU/hr − nominal| ÷ nominal`.
2. Candidates: classes with `d ≤ 0.10`.
3. One candidate → `{ type: 'class', tons }`.
4. Several → smallest `d` wins; exact tie → `{ type: 'between', lower, upper }`.
5. No candidate but between two classes → `{ type: 'between', lower, upper }`.
6. Below smallest − 10% or above largest + 10% → `{ type: 'outside' }` (exact tons only).

---

## 6. Compare and batch

- **Compare:** difference = B − A (BTU/hr, TR, kW). Percent = 100 × (B − A) ÷ A. A = 0 → percentage unavailable.
- **Batch:** max 200 non-blank lines. 201+ → limit message, no silent cut. One unit for the list.
  Keep row order; invalid rows keep their row number and reason; never drop rows.
- **CSV columns:** `row,input_value,input_unit,BTU_per_hour,refrigeration_tons,cooling_kW,size_class,status`.
- **CSV injection:** prefix cells starting with `=`, `+`, `-`, `@`, tab or carriage return with `'`.
  Quote cells containing commas, quotes or newlines.

---

## 7. P1 methods (not live until HVAC review is recorded in DECISIONS.md)

### Ton-hours (thermal energy, not electricity)

```
ton-hours  = BTU ÷ 12,000
average TR = ton-hours ÷ hours        (hours > 0)
```

### Electrical input strategies

| Strategy      | Input                       | Formula                          |
| ------------- | --------------------------- | -------------------------------- |
| `eer-us`      | EER, EER2 or CEER in BTU/Wh | W = BTU/hr ÷ EER                 |
| `eer-eu`      | EER in W/W                  | W = BTU/hr ÷ (EER × 3.412141633) |
| `cop`         | COP in W/W                  | electrical kW = cooling kW ÷ COP |
| `known-watts` | watts                       | use directly                     |

- Efficiency must be > 0.
- **SEER / SEER2 are rejected as input**, with a short explanation (copy to be written and reviewed in M10).
- Never convert SEER2 to EU SEER, or the reverse.

### Energy and cost

```
kWh/day = electrical kW × hours   (0–24)
cost    = kWh × rate              (rate ≥ 0; currency default USD, editable)
```

### Room estimate (ENERGY STAR table, room/window ACs only, ~8 ft ceilings)

| Area (ft²)  | Base BTU/hr | Area (ft²)                 | Base BTU/hr |
| ----------- | ----------- | -------------------------- | ----------- |
| 100 to <150 | 5,000       | 550 to <700                | 14,000      |
| 150 to <250 | 6,000       | 700 to <1,000              | 18,000      |
| 250 to <300 | 7,000       | 1,000 to <1,200            | 21,000      |
| 300 to <350 | 8,000       | 1,200 to <1,400            | 23,000      |
| 350 to <400 | 9,000       | 1,400 to <1,500            | 24,000      |
| 400 to <450 | 10,000      | 1,500 to <2,000            | 30,000      |
| 450 to <550 | 12,000      | 2,000 to 2,500 (inclusive) | 34,000      |

Adjustment order (**our documented convention**):

1. base × sun factor (shaded 0.9 / normal 1.0 / sunny 1.1)
2. \+ 600 × max(people − 2, 0) (people = non-negative integer)
3. \+ 4,000 if kitchen

- m² input → ft² with `FT2_PER_M2`.
- Outside 100–2,500 ft², whole home, or ceiling not ~8 ft → **no estimate**; show the professional load-calculation guide.
- Never round up to a recommended central AC size. Attribution is not certification.

### Load-report panel

- Total cooling load (BTU/hr), optional sensible and latent.
- If both given: `|sensible + latent − total| ≤ max(1, 0.001 × total)`; otherwise "Check the values in your load report."
- Never say "correctly sized".

---

## 8. US vs EU differences

| Topic            | US (live)                                 | EU (built, not routed)                            |
| ---------------- | ----------------------------------------- | ------------------------------------------------- |
| Number format    | `19,000.5` (comma thousands, dot decimal) | `19.000,5` (dot thousands, comma decimal)         |
| Capacity label   | BTU/hr, tons                              | kW (marketed with a BTU label, e.g. "12,000 BTU") |
| Size classes     | 0.5–5 tons                                | 2.5 / 3.5 / 5.0 / 7.0 kW                          |
| EER unit         | BTU/Wh (EER, EER2, CEER)                  | W/W                                               |
| EER conversion   | EER(US) = EER(EU) × 3.412141633           |                                                   |
| Seasonal ratings | SEER / SEER2                              | EU SEER. **Never convert between them.**          |

Open: final status of the EU ecodesign/labelling revision (only matters when Europe pages start).

---

## 9. Unit tooltip copy (exact)

- **BTU/hr:** "How much heat an AC removes each hour. AC labels often drop the '/hr'."
- **Ton:** "12,000 BTU/hr. It comes from the cooling of melting a ton of ice per day — not the AC's weight."
- **Cooling kW:** "Cooling capacity in metric units. Not the electricity the AC uses."
- **EER (P1):** "Cooling per watt of electricity. US EER is BTU/Wh; European EER is W/W."
