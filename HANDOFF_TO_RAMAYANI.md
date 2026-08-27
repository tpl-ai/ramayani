# Handoff to ramayani — a `yield_per_serving` field for site display

Date: 2026-08-27 (correction + three follow-up specs added same day, see bottom)

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
  (`yield_amount: 4, yield_unit: "cups"`) got `yield_per_serving: 0.4` —
  meaning 0.4 cup (1 cup per order ÷ 2.5 people/order) = 1 real serving.
  **Careful here** — this was actually implemented wrong the first time:
  don't set this to "how much = 1 order," set it to "how much = 1 real
  serving." An order and a serving aren't the same thing (an order is
  shared between multiple people) — see the correction note near the
  bottom of this doc.
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

## Data already available (raspberry side backfilled these once this shipped)

- `resep-118` (Ayam Bumbu Rujak Sauce): `yield_amount: 4, yield_unit:
  "cups"` → `yield_per_serving: 0.4` (real correction — see the note near
  the bottom of this doc; not 1, despite the headnote saying "1 cup per
  order").
- `resep-120` (Ayam Sauce Ramayani Sauce): same — `yield_amount: 4,
  yield_unit: "cups"` → `yield_per_serving: 0.4`.
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

## Correction (2026-08-27): `yield_per_serving` is servings, not orders

This shipped fast and worked, but the first backfilled value was wrong.
Recorded here so nobody copies the mistake into the next sauce conversion.

`yield_per_serving: 1` on resep-118/resep-120 meant "1 cup = 1 serving" —
but 1 cup is 1 **order** of the dish, and an order is shared between 2-3
people (the standing convention already established when `resep-116`'s
`serves` field was corrected from "4" to "2-3" — an order isn't a serving).
Setting `yield_per_serving` to the "1 unit per order" figure straight out
of a headnote silently reintroduces the exact order/serving conflation
this whole yield-scaling effort already fixed once.

**Corrected value:** 0.4 (1 cup ÷ 2.5 people-per-order midpoint) on both
recipes → computed servings = 4 / 0.4 = **10**, not 4. Sanity check: 0.4
cup (~95ml) per serving lines up closely with the original ~90g (~0.36
cup) BBQ-wings-based per-serving estimate computed way earlier, before the
"1 cup per order" shorthand — two independent derivations landing near the
same number.

**Rule for next time:** `yield_per_serving` should answer "how much of
this yield does one *person* eat," not "how much is one order/portion of
the dish." If a headnote states an "X per order" figure and an order
serves N people, divide by N before using it as `yield_per_serving` — don't
copy the per-order figure directly into the field.

## Follow-up spec: pre-scale `recipe_ref` "View recipe" links to what's actually needed

Separate issue, raised the same day using the now-live `yield_per_serving`
feature. Arman's actual workflow: open resep-116 (Ayam Sauce Ramayani, the
dish), see its sauce ingredient line ("1 cup Ayam Sauce Ramayani sauce"),
click "View recipe" to go make the sauce — and lands on resep-120 showing
its full 4-cup batch, not the 1 cup actually needed. Has to notice the
original ingredient line said "1 cup" and manually dial the stepper down
from 4 to 1. Real friction, not hypothetical.

This is the intended behavior from the 2026-08-26 redesign (a physical-unit
target shows its own full recorded yield, "the way a cookbook's paste
recipe states its own yield" when you flip to its page) — but actual usage
says that convention is more confusing than helpful here.

**Proposed fix:** a `recipe_ref` ingredient row's `amount` is *already*
required, by long-standing convention (see `docs/yield-scaling.md`), to be
expressed in the *referenced* recipe's own `yield_unit` — resep-116's row
already says `amount: "1", unit: "cup"`, matching resep-120's
`yield_unit: "cups"`. So when building the "View recipe" href, read that
row's own stated `amount` and pass it as `?qty=` — e.g.
`/resep/resep-120?qty=1` — landing the reader exactly where they need to
be, instead of either the current "no override" (full batch) or the old
`REF_LINK_SERVINGS`-style flat default.

**Where this lives in the code (per `docs/yield-scaling.md`'s history):**
`page.tsx` builds `refLinkQty` — currently
`target.yield_unit === 'servings' ? REF_LINK_SERVINGS : null`. This would
become something like: if the row's own `unit` matches `target.yield_unit`
(case-insensitive, allow simple pluralization), parse the row's `amount`
and use that as `refLinkQty`; otherwise fall back to `null` (today's
behavior — no override, land on the full yield) rather than guessing.

**Scope/edge cases to think through while implementing:**
- Row `amount` isn't always a clean number (fractions like "¾", ranges).
  Whatever amount-parsing logic already exists for ingredient scaling
  (`units.ts`'s `parseAmount()` or similar) should be reusable here rather
  than writing a second parser.
- Keep the `yield_unit === "servings"` / `REF_LINK_SERVINGS` path exactly
  as-is for resep-1 — this fix is additive, for physical-unit targets only,
  not a replacement of the existing servings-target behavior.
- If the row's unit *doesn't* match the target's `yield_unit`, don't guess
  — fall back to no override, same as today, rather than a wrong number
  silently sending someone to make too much or too little sauce.

## Follow-up spec 2: scaled amounts display as raw decimals instead of fractions (and one of those decimals is a real math error, not just ugly)

Found 2026-08-27 while checking resep-121 (Chicken Curry Paste) live after
the link pre-scaling fix above shipped. Landing on
`/resep/resep-121?qty=1` (exactly 1 dish-portion, the smallest meaningful
view) showed:

```
0.5 Candlenuts
0.5 cloves Garlic
0.3 tsp Ginger, grated
0.3 tsp Turmeric, ground (or grated fresh turmeric root)
```

The *unscaled* page (`/resep/resep-121`, factor 1) shows the same
ingredients as `1½`, `½ clove`, `1 tsp`, `1 tsp` — clean fractions/whole
numbers, because `displayQuantity()` in `units.ts` has an explicit early
return for that case: `if (factor === 1 && ...) return { amount, unit }`
— the authored string is preserved untouched. The moment `factor` is
anything else, that path is skipped entirely and the number goes through
`formatAmount()` → `formatNumber()`:

```ts
function formatNumber(n: number): string {
  return String(Math.round(n * 10) / 10);
}
```

This **always** produces a decimal string — there's no equivalent of the
factor-1 path's fraction-preservation for the scaled case. This affects
every ingredient at every non-1 factor, on every recipe with a stepper —
not specific to resep-121.

**There's also a real correctness bug here, not just a display preference.**
`pickVolumeUnit()`'s tsp branch already buckets to the nearest ¼ tsp
(`Math.round((ml / 4.92892) * 4) / 4`) — e.g. resep-121's turmeric at 1
portion correctly computes to exactly `0.25`. But `formatNumber()` then
rounds *that already-correct value* to 1 decimal place again:
`Math.round(0.25 * 10) / 10 = 0.3` — **0.25 is being displayed as "0.3",
which is simply wrong**, not a rounding style choice. The same double-
rounding turns `0.75` into `0.8`. (`0.5` happens to survive intact, which
is why it wasn't obvious from the candlenuts/garlic case alone.)

**Proposed fix:** before falling back to a plain decimal, check whether
the value is close (small epsilon, e.g. ±0.03) to a common kitchen
fraction, and if so render it the same way authored amounts already are —
reuse the existing `UNICODE_FRACTIONS` table (already used for *parsing*
in `parseAmount()`) in reverse: given a decimal, find the nearest
half/third/quarter/eighth/fifth/sixth, and if within tolerance, output
`"{whole}{fractionChar}"` (e.g. `1½`, `¾`) instead of calling
`formatNumber()`. Fall back to the current decimal formatting only when
nothing matches closely enough — some values genuinely won't land on a
clean fraction (e.g. an odd manual stepper position), and a decimal is the
right answer there.

**Where this applies:** `formatAmount()` (used for unrecognized units —
count-based ingredients like "clove", "candlenuts" with no unit at all,
which skip `pickWeightUnit`/`pickVolumeUnit` entirely) and the final
`formatNumber(picked.amount)` call inside `displayQuantity()` (used for
recognized weight/volume units after bucketing). Both currently go through
the same lossy `formatNumber()` — a single shared helper fix (something
like `formatNumber()` gaining the fraction-snap behavior internally) would
cover both call sites at once.

**Scope note:** this is independent of both follow-up spec 1 above and the
`yield_per_serving` work — it's a pre-existing formatting behavior in
`units.ts` that predates all of this, just newly visible because
resep-121's ingredients now cluster around values (0.25, 0.5, 0.75) where
the distortion is obvious. Not urgent, but worth fixing since it's
web-wide (any recipe, any stepper interaction) and includes a genuine
correctness bug (0.25 → "0.3"), not only a cosmetic one.

## Follow-up spec 3: cap the recipe_ref auto-link at the target's own minimum batch, don't scale below it

Found 2026-08-27 following directly from follow-up spec 1 (which shipped
and works correctly for resep-116→resep-120). The same mechanism produces
a bad outcome for resep-113→resep-121: Ayam Kare needs "1 Tbsp" of curry
paste, so the link correctly computes `?qty=1` — landing on a page that
says "make 1 Tbsp of curry paste." Making 1 Tbsp of a ground/blended spice
paste from scratch (chop onion, garlic, candlenuts, blend, stir-fry) isn't
a realistic thing anyone would do — you always batch-prepare a paste like
this and use a spoonful at a time. Arman's diagnosis: "the scaling makes
sense until it falls to a quantity below a realistic amount."

**The fix, and why it needs no new field:** as of the batch-sizing work
done the same day (see `docs/yield-scaling.md`'s "standing minimum batch
size" rule), a batch/paste/marinade recipe's `yield_amount` is now defined
as *the smallest amount of that specific thing that's sensible to
prepare* (4oz/8Tbsp/½cup floor, or whatever a given recipe's own real
minimum is) — not just "whatever this batch happens to produce." That
means `yield_amount` already *is* the right floor to enforce. Change the
`refLinkQty` computation from spec 1:

```
qty = matched-unit-amount-from-the-row  // spec 1's existing logic
qty = Math.max(qty, target.yield_amount)  // NEW: never request less than the target's own minimum
```

Concretely: resep-113 needs 1 Tbsp of resep-121 (yield_amount 8) →
`max(1, 8) = 8` → link becomes `/resep/resep-121?qty=8` (or equivalently,
no override at all, since 8 is already resep-121's own default — either
implementation is fine, whichever is simpler in the existing code shape).

**Known, accepted side effect — please don't special-case around this:**
this also caps resep-116→resep-120 (the BBQ sauce). resep-116 needs "1
cup" of resep-120 (yield_amount 4 cups) → `max(1, 4) = 4` → that link will
now also land on the full 4-cup batch instead of the pre-scaled "1 cup" it
shows today. This is a deliberate consequence of applying one consistent
rule, not a bug to work around with a per-recipe-type flag. If 1 cup of
that sauce really is a sensible amount to make on its own, the right fix
is to reconsider resep-120's own `yield_amount` (lower it to match its
true minimum), not to add an exception to this link logic. Not asking for
that reconsideration in this handoff — just flagging so the "regression"
isn't mistaken for something broken.

**Scope:** this only touches the branch of `refLinkQty` that already does
unit-matching (spec 1's logic) — the `yield_unit === "servings"` /
`REF_LINK_SERVINGS` branch for resep-1 is untouched, same as spec 1 asked.
