# NEXRANK — Mobile UX Redesign

**Date:** 2026-09-04
**Scope:** `index.html`, `styles.css`, `app.js` (presentation + interaction only)
**Out of scope:** pricing logic and rates, admin panel, Google Apps Script backend, `build-sites.mjs`

---

## 1. Problem

The site works but is hard to use on a phone. Four concrete causes, all verified.

### 1.1 The CSS is four stacked patch layers

`styles.css` contains **four separate `@media(max-width:680px)` blocks** — lines 11, 16, 46 and 75 — added over time as labelled passes: `/* Mobile-first readability and touch layer */`, `/* Pro responsive pass */`, `/* Final legibility and press feedback */`. Each overrides the one before instead of editing it. Every later pass shrank type to win back space.

Result: declared mobile font sizes bottom out at **8px** (`.proof-strip small`), with `9px` and `10px` used widely (`.invoice-row`, `.step-head p`, `.service-button`, `.picker-heading small`). Spacing values are arbitrary — `9px`, `11px`, `13px`, `21px`, `22px` — with no scale.

### 1.2 Rank selection asks for three decisions through four mechanisms

To state "I am Epic V with 2 stars" the user must operate:

1. `.journey-point` buttons — pick which endpoint to edit
2. `.rank-picker` — a 10-cell grid of ranks
3. `.star-goal-bar` — bare `<input type="number">` for absolute-star ranks
4. `.precision-panel` — hidden behind `#precisionToggle`, containing a `<select>` for Division and an `<input type="range">` for stars

Rank, division and stars are three independent axes exposed through four different interaction models, one of which is hidden behind a toggle the user must discover.

### 1.3 Price is invisible while choosing

On a 375px viewport `.invoice` begins at **y=1267px**. The user configures the entire order without seeing the price move. `.mobile-checkout` shows a total but no breakdown and no reason for the number.

### 1.4 No mobile navigation

`.header nav, .header .button-small { display: none }` at `max-width:680px`, with no replacement. The header carries only the logo and the language toggle.

### 1.5 Defects

- **[`app.js:27`](../../../app.js) `rankLabel()`** returns `` `${r.name} ${division} · ${s.stars}★` ``. In an RTL paragraph the trailing `★` is a neutral character that reorders to the visual start, rendering **`★Mythic · 0`**.
- **[`app.js:17`](../../../app.js) `egp()`** hardcodes `Intl.NumberFormat('ar-EG')`, emitting Arabic-Indic digits (`٢٬٠٠٠`) in **both** languages, while `<input>` values render Latin (`0`) — mixed numeral systems in one view.
- Touch targets below 44px: `#currentStars` / `#targetStars` ranges (40px), `#targetAbsoluteStars` (30px), `.admin-link` (11px).

---

## 2. Competitive reference

Inspected KingBoost's live MLBB order form (DOM, 2026-09-04):

- Rank and division are **collapsed into one 26-step scale** (`Warrior III` … `Mythic`) driven by a dual-handle `noUiSlider`. There is no division control.
- Stars are a **coarse two-option choice** (`3-5 Stars` free / `0-2 Stars` +€0.08), not a precise value.
- **Every option card carries its own price delta** (`Piloted — FREE`, `Selfplay — €1.01`, `Express — €0.20`).
- Total and purchase button are permanently visible.

Adoption decisions:

| Their pattern | Decision | Reason |
| --- | --- | --- |
| Flatten rank + division to one axis | **Adopt** | Removes an entire decision and control from the flow |
| Dual-handle range slider | **Reject** | Hitting 1 of ~40 steps with a thumb on a 375px screen is imprecise; range inputs are the weakest mobile control |
| Coarse star buckets | **Reject** | Stars drive price here; precise selection is achievable at the same tap cost |
| Price delta on every option | **Adopt** | Directly answers "where does the price come from" |

---

## 3. Design

### 3.1 Rank selection — one axis, one interaction model

Replace all four mechanisms with a single flattened scale.

**Data.** Derive a flat `steps[]` array from the existing `ranks[]` in `app.js`. Each step is one selectable position: `Warrior III`, `Warrior II`, … `Epic V`, … `Legend I`, then Mythic-family ranks. `absolutePosition()` already computes this ordering; the array reuses it rather than introducing a parallel source of truth.

**Control.** A horizontal **snap-scroll rail of chips**, one chip per step:

- `scroll-snap-type: x mandatory`, each chip `scroll-snap-align: center`
- Every chip ≥ 44×44px with the rank icon and label
- Selected chip is scrolled into view via `scrollIntoView({ block: 'nearest', inline: 'center' })`
- Flanking `−` / `+` stepper buttons move one step for fine adjustment
- Partial chips remain visible at both edges so the rail reads as scrollable

**Endpoints.** A segmented control switches the rail between `رانكك الحالي` and `هدفك`. Both endpoint values stay visible above the rail at all times.

**Stars.** For division ranks (Warrior–Legend), five tappable star targets, ≥44px each. For absolute-star ranks (Mythic and above), a `− value +` stepper — no bare number input.

**Removed:** `.precision-panel`, `#precisionToggle`, `.star-goal-bar`, `.rank-picker` grid, both `<select>` division dropdowns, both `<input type="range">`.

**Result:** stating a rank costs 1–3 taps, with no hidden panel and one interaction model throughout.

### 3.2 Price transparency

Every option renders its own delta inline, in the same visual slot:

- `Pilot — السعر الأساسي` / `Self Play — +70%`
- `هيرو محدد — +15%` / `تنفيذ سريع — +25%`

The rank rail shows a live `تحتاج N نجمة` readout that updates as the endpoints move, so the relationship between distance and price is visible before the invoice is ever opened.

### 3.3 Mobile invoice — sticky bar plus sheet

**Collapsed bar** (fixed, respects `env(safe-area-inset-bottom)`):
`الإجمالي` · total · star count · chevron · confirm button.

**Expanded sheet** — opens on tapping the bar:
per-rank breakdown rows (`Epic: 8 نجوم × 35 ج.م`), extras, promo field, payment methods, confirm button.

The total animates on change (a short scale-and-color pulse) to bind the choice to the number. Implemented with `transform`/`opacity` only, and suppressed under `prefers-reduced-motion`.

Desktop keeps the existing `<aside class="invoice">` side column unchanged.

### 3.4 Header

Logo, language toggle, and a direct WhatsApp button. Sticky, 56px, `backdrop-filter` over a translucent ground. No nav links, no drawer — the page has three sections and the primary CTA lives in the sticky bar.

### 3.5 CSS rebuild

Delete lines 10–81 of `styles.css` (all four patch layers plus the 900/380/360px blocks) and rewrite as one mobile-first system.

**Tokens** on `:root`:

- Type scale: `--fs-xs: .8125rem` (13px floor) through `--fs-3xl`, headings via `clamp()`
- Spacing scale: `--s1: 4px` … `--s7: 48px`, replacing all arbitrary values
- Existing palette preserved unchanged: `--bg`, `--panel*`, `--acid`, `--purple`, `--gold`, `--line`

**Rules:**

- Base mobile styles first; `min-width` queries add desktop layout. One breakpoint set, no overrides of overrides.
- `min-height: 44px` on every interactive element, enforced by a shared selector list rather than per-component.
- `font-variant-numeric: tabular-nums` on all prices, star counts and totals so digits do not jitter as values change.
- Shadows tinted toward `--bg` hue rather than pure black.
- Visible `:focus-visible` ring on every control.
- `:active { transform: scale(.97) }` on every tappable surface, with a `150–200ms` transition.

**Type floor: 13px.** No mobile font size below `--fs-xs`.

### 3.6 Defect fixes

- `rankLabel()` — return the star glyph inside an isolating wrapper so bidi reordering cannot move it. Emit `<bdi>` in DOM contexts, or use `⁨`/`⁩` isolates for plain-text contexts (order payloads, WhatsApp text).
- `egp()` — format with `'ar-EG-u-nu-latn'` for Arabic and `'en-US'` for English, producing Latin digits in both. This matches `<input>` rendering and gamer convention for ranks and star counts. `neededStars` at `app.js:106` uses the same helper.
- All touch targets raised to 44px by the shared rule in §3.5.

### 3.7 Motion and feel

- Staggered entry on the rank rail chips on first paint (`animation-delay` cascade), `transform`/`opacity` only
- Chip selection transitions border and glow rather than snapping
- Sheet opens with a spring-weighted translate, not a linear slide
- The existing WebGL background stays disabled on mobile (`app.js:118`); the static radial gradient plus grain overlay remain
- Every animation gated behind `@media (prefers-reduced-motion: no-preference)`

---

## 4. Verification

1. **Layout:** at 320px, 375px and 414px — no horizontal overflow (`scrollWidth === clientWidth`), invoice reachable without scrolling, no computed `font-size` below 13px, no interactive element below 44px. Measured via JS in the browser, since the preview pane cannot be screenshotted reliably in this session.
2. **Flow:** state `Epic V + 2★ → Mythic 50★` and confirm the resulting total matches the pre-change total for the same input — the rebuild must not alter pricing.
3. **Bidi and numerals:** `rankLabel()` renders `Mythic · 0★` with the star trailing, in both `dir=rtl` and `dir=ltr`; digits are Latin in both languages everywhere.
4. **Language toggle:** switch AR↔EN and confirm layout mirrors without overflow and all `data-i18n` nodes update.
5. **Accessibility:** `accessibility-scan` on the running page; keyboard reachability of the rail, sheet and dialog; focus trap in the sheet.
6. **Desktop regression:** the ≥900px layout is visually unchanged apart from the token-driven type and spacing.

---

## 5. Risks

- **Rail vs. slider on very long journeys.** Warrior III → Mythical Immortal spans many steps; scrolling the rail end to end is long. Mitigated by the segmented endpoint control (each endpoint is set independently, so no single drag covers the whole range) and by the `−`/`+` steppers. If it still reads as long in testing, add rank-family jump anchors above the rail.
- **Flattening changes `state` shape.** `state.current` / `state.target` currently hold `{rank, division, stars}`. The rail needs a step index. Keep `{rank, division, stars}` as the canonical state and derive the index, so `rankInvoice()`, `bandsBetween()` and `absolutePosition()` are untouched.
- **CSS rebuild is broad.** Mitigated by keeping `index.html` structure stable where possible, and by the desktop regression check in §4.6.
