# Handoff to ramayani — a `yield_per_serving` field for site display

Date: 2026-08-27

This is the reverse direction of `HANDOFF_TO_RASPBERRY.md` — a spec from the
raspberry side asking for a small site-code change on the ramayani side.
Arman asked for this after noticing that `serves` (free text, e.g. "2-3")
has no way to be scaled or reasoned about numerically, while `yield_amount`/
`yield_unit` (a real physical quantity, e.g. "4 cups") has no way to tell a
reader how many servings that actually represents.

## The problem

Two fields on `Recipe`, doing genuinely different jobs (confirmed against
current data — **zero** live recipes have both set):

- `serves` — free text, purely descriptive ("2-3", "6-8", "1 pan 20×20cm
  (≈20 slices)"). Never touches ingredient math. Used on home-scale dishes.
- `yield_amount`/`yield_unit` — a real number + unit, drives the site's
  actual `[-]`/`[+]` scaling stepper (`factor = qty / baseQty` in
  `ResepView.tsx`). Used on batch-scale/component recipes (sauces, pastes).

These aren't redundant — one is inert text, the other is live input to a
calculator — but there's a real gap: when `yield_unit` is a physical unit
like "cups" or "slices", nothing tells a reader how many servings that
yield represents. Right now that information exists only as prose buried
in a headnote (e.g. resep-120's headnote says "about 1 cup of sauce per
order" — a human has to read and interpret that sentence; the site can't
compute with it).

## The fix: `yield_per_serving`

A new optional field on `Recipe`:

```ts
yield_amount?: number;
yield_unit?: string;
yield_per_serving?: number;  // NEW — how much of yield_amount (in yield_unit) equals ONE serving
```

**Semantics:**
- Expressed in the *same* `yield_unit` as `yield_amount`. E.g. resep-120
  (`yield_amount: 4, yield_unit: "cups"`) would get `yield_per_serving: 1`
  — meaning 1 cup = 1 serving.
- Computed servings: `servings = yield_amount / yield_per_serving`.
- Only meaningful when `yield_unit` is a real physical unit. When
  `yield_unit === "servings"` already (currently only resep-1, the curry
  paste), this field should be omitted entirely — `servings` is just
  `yield_amount` directly, no conversion needed.
- No range/min-max needed. Arman's call: "servings" is already an
  inherently soft/subjective number in every cookbook ("serves 4" doesn't
  literally mean exactly 4 people) — a single computed number is honest
  enough, don't build range-tracking on top of an already-approximate
  concept.
- Round for display (nearest whole number, minimum 1) — implementation's
  choice, this doc doesn't prescribe the exact rounding function.

**Display:** wherever the site currently shows `yield_amount`/`yield_unit`
(the "Makes: [-] 4 cups [+]" stepper), show the computed servings
alongside it when `yield_per_serving` is present — e.g. "Makes about 4
cups (≈4 servings)". This replaces what's currently only expressible as
free-text headnote prose with something the site actually computes and
can render consistently (recipe page, and potentially a recipe card/list
view later, if useful).

## Not the same problem as `REF_LINK_SERVINGS` — don't conflate the two

`REF_LINK_SERVINGS = 4` (in `recipeConstants.ts`) is a *separate*,
mostly-already-solved concern. It only still matters for the one recipe
still denominated in the ambiguous `"servings"` `yield_unit` — resep-1
(curry paste, `yield_amount: 600, yield_unit: "servings"`). Every sauce
that's gone through the batch→home-scale conversion (resep-5→118,
resep-10→120 — see `docs/yield-scaling.md` on the raspberry side for that
playbook) already moved *off* `"servings"` onto a real physical unit, and
for those, `REF_LINK_SERVINGS` no longer applies at all (confirmed in
`page.tsx`: the override only fires when `target.yield_unit === 'servings'`
exactly). If/when resep-1 gets its own batch→home conversion using that
same playbook, `REF_LINK_SERVINGS` becomes fully dead code on its own —
`yield_per_serving` doesn't need to touch it, and implementing
`yield_per_serving` doesn't retire it by itself. Please don't bundle these
into one change; they're independent.

## Data already available (raspberry side will backfill these once this ships)

- `resep-118` (Ayam Bumbu Rujak Sauce): `yield_amount: 4, yield_unit:
  "cups"` → `yield_per_serving: 1` (1 cup/order, already stated in its own
  headnote).
- `resep-120` (Ayam Sauce Ramayani Sauce): same — `yield_amount: 4,
  yield_unit: "cups"` → `yield_per_serving: 1`.
- `resep-1` (curry paste): no value yet — still `yield_unit: "servings"`,
  out of scope for this change (see above).

## Scope note (raspberry side, not asking ramayani to do this)

raspberry's own admin editor (`RecipeEditor.tsx`) uses explicit per-field
inputs, not a generic JSON form — it'll need a small "Yield per serving"
input added next to the existing "Yield amount"/"Yield unit" fields so
this is actually editable. That's raspberry's own repo/UI; noting it here
for completeness, not asking ramayani to build it.

## Open questions for whoever implements this

- Exact rounding rule for the displayed servings number (whole number vs.
  one decimal for e.g. 4.5 → "about 4-5"? Arman said no ranges, so
  probably round to nearest whole, but worth a deliberate choice rather
  than whatever `Math.round` happens to do by default).
- Whether to show the computed servings anywhere besides the recipe detail
  page (a recipe card/list view, search results) — not required for this
  change, just worth deciding explicitly rather than by omission.
