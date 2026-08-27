# Handoff to raspberry — recipes.json changes from the ramayani side

Date: 2026-08-25 (section 2 updated 2026-08-26; `yield_per_serving` reply
added 2026-08-27, see bottom)

This documents what changed in `recipes.json`'s schema and conventions from a
session working on the **ramayani** website repo. Raspberry is the tool that
actually edits `recipes.json`, so this is what that editing should know
about going forward. Nothing here requires a code change in raspberry itself
— these are two new optional fields and some conventions for using existing
ones. `recipes.json`'s location (project root) and overall shape are
unchanged.

## The agreed process (confirmed 2026-08-26)

1. **Arman verifies the batch recipe** — confirms the scan transcription
   (ingredients/method) is accurate. This is the existing `reviewed`/`flags`
   fields' job.
2. **Raspberry helps create the home-scale version** — a genuinely
   rescaled-and-rounded recipe (real ingredient/method adjustments, not
   linear division alone), as its own entry, linked back via
   `recipe_type`/`linked_recipe_id` (section 1 below).
3. **The website shows only home versions** — a batch recipe
   (`recipe_type: "batch"`) is permanently hidden from the public site the
   moment its home twin exists. It's kept forever as the unedited historical
   record; nothing about it changes again once linked.

## 1. New fields: `recipe_type` and `linked_recipe_id`

A dish can now exist as two separate recipe entries:

- **`recipe_type: "batch"`** — the restaurant/original-scale recipe, kept
  permanently as the historical record. Once a home version exists, a batch
  recipe should not be edited again.
- **`recipe_type: "home"`** — a hand-adjusted version scaled for actual home
  cooking. Not just the batch quantities divided by a number — real
  ingredient/method adjustments, sensible rounding, a proper `serves` value.
- **`linked_recipe_id`** — set on both sides of a pair, pointing at the id of
  its counterpart.

Both fields are optional. A recipe with neither set means "not yet reviewed
under this scheme" — it stays visible on the website exactly as before,
whatever scale it happens to be at. There's no urgency to backfill this on
everything; it gets set as each recipe actually gets reviewed/converted.

**The website hides any recipe with `recipe_type: "batch"`** — it never
shows in search, category listings, or by direct link. This replaces (but
doesn't remove) the old convention of renaming a batch recipe with a
"- Restaurant Batch" suffix in both `name_id`/`name_en` to hide it — that
still works too, but new batch recipes should get `recipe_type: "batch"` set
directly instead of relying on the name string.

**Real examples already in the data**, worth looking at as a template:

| batch | home | note |
|---|---|---|
| `resep-2` | `resep-113` | Chicken Curry — chicken amount matched from resep-2's own per-order portion; water/paste NOT linearly scaled |
| `resep-4` | `resep-114` | Ayam Besengek — straight division (÷7, one whole chicken instead of seven), but still built as its own recipe |
| `resep-8` | `resep-115` | Ayam Goreng Kuning — same pattern, ÷20 |
| `resep-45` | `resep-117` | Kue Pepe — ÷9, one pan instead of nine |

Note `resep-116` (Ayam Sauce Ramayani, the dish) has *no* `linked_recipe_id`
— it's a new composition built from `resep-10`'s sauce component plus a
freshly-written method, not a scaled twin of a single batch recipe. Not every
home recipe needs a batch counterpart to link to.

## 2. UPDATED 2026-08-26 — For a sauce/paste/marinade, use a real physical
   unit for `yield_amount`/`yield_unit`, not "servings"

This corrects what an earlier version of this doc said (below, for the
record) — checked against how actual cookbooks do it (America's Test
Kitchen, Food Network, professional culinary references): a sauce/paste
yield is always given in **volume or weight** — "makes about 2 cups,"
"makes 600mL" — never "servings." The reasoning holds up: how much sauce
one "serving" uses is inherently variable (a tablespoon as a condiment vs.
a half-cup tossed with pasta), so "servings" doesn't have a fixed meaning
for a sauce the way it does for a plated dish. When a cookbook does want to
connect a sauce's yield to a dish, it's a *separate* note alongside the real
measurement — Test Kitchen's own phrasing is "makes about 2 cups (for 4
curries)" — two different units, kept distinct, not conflated into one
"servings" number.

This is also, in hindsight, the actual root cause of every yield estimate
that's needed correcting so far (`resep-1`'s 600, `resep-10`'s 50→200,
`resep-5`'s low-confidence 550) — all three were back-deriving a "servings"
figure from a real, directly-known volume/weight by guessing things like
"grams of sauce per order" and "people per order." That guesswork is
avoidable: if a scan states the actual batch quantity (liters, kg, bags),
record *that* directly as `yield_amount`/`yield_unit` — no conversion, no
guessing, no LOW-confidence caveats needed for this field. A separate,
optional, plainly-labeled note (in `notes_en`/`headnote_en` if worth
telling a reader, or `review_notes` if just useful context) can still say
"enough for about N servings of X" when that's actually known — same as
Test Kitchen's parenthetical — but that estimate shouldn't be the number
stored in `yield_amount` itself.

**Site-side consequence, already implemented:** a recipe's default display
quantity is only shrunk to a small number when `yield_unit === "servings"`
exactly (still true for the not-yet-updated `resep-1`/`resep-10`/`resep-5`).
Any other unit (cups, mL, g, kg, ...) is shown as recorded, no shrinking —
a real physical yield is self-explanatory on its own, the way "makes about
2 cups" doesn't need softening in any cookbook. Same logic for a
`recipe_ref` "View recipe" link: it only overrides the target's quantity
when the target is servings-denominated; a physical-unit target just links
to its own page showing its own recorded yield.

<details>
<summary>Original 2026-08-25 version of this section (superseded)</summary>

`yield_amount`/`yield_unit` should always be denominated in true **servings**
— what one diner eats in one sitting. Not "orders" (a Ramayani menu/scan
concept — what a customer paid for, which does NOT reliably equal one
serving).

This came up because `resep-116`'s own history is the cautionary example:
its yield was originally entered as 50, meaning 50 *batches* (1 batch = one
restaurant order, which turned out to actually be ~4 servings each) — so the
true yield was 200 servings, not 50. If a scan or Hertha's note gives a
count in "orders" or "batches" rather than individual servings, that
conversion assumption needs to be worked out and written into
`review_notes` (the way `resep-116`'s correction did), not typed directly
into `yield_amount` as-is.

</details>

`resep-1`, `resep-10`, and `resep-5` still use `yield_unit: "servings"` as
of this update — converting them to their real recorded volume/weight (from
the scan, where available) is a good next data task, but not urgent; the
site behaves correctly either way in the meantime.

### Action requested (2026-08-26): convert resep-5 and resep-10 first

Arman asked for these two specifically. Both already have the real batch
total computed in their own `review_notes` — this is a re-labeling task,
not new research.

**`resep-5` (Ayam Bumbu Rujak Sauce)** — currently `yield_amount: 550,
yield_unit: "servings"`. Its own `review_notes` already computed the real
batch total: **~19.98kg / ~21.3L** (terasi excluded — quantity unknown,
flagged rather than guessed, per the existing note). Suggest setting
`yield_amount`/`yield_unit` to that total (e.g. `20` / `"kg"` — your call on
rounding/precision), and updating `review_notes` to note the field now
holds the real batch weight, not the servings estimate. Keep the existing
servings/orders derivation in `review_notes` as background if it's useful,
just not as the literal `yield_amount` anymore.

**`resep-10` (Ayam Sauce Ramayani Sauce)** — currently `yield_amount: 200,
yield_unit: "servings"`. Two things to know before converting this one:

1. Its `review_notes` contain two candidate real totals that don't quite
   agree: **~7.01kg** (summed from the ingredient list: ~140g/order × 50
   orders) and a separate, rougher **~6.7L** estimate (visual/photo-based).
   Please reconcile or pick one authoritative figure rather than us
   guessing — not something to resolve from the website side.
2. The current `200` was *deliberately* rigged (50 orders × the site's old
   hardcoded `REF_LINK_SERVINGS = 4`) so that clicking "View recipe" from
   `resep-116` landed pre-scaled to exactly one order's worth of sauce. That
   workaround is now retired — see the site-side consequence above: a
   physical-unit target no longer gets its quantity overridden by the link,
   it just shows its own real yield, the way a cookbook's sauce recipe
   states its own yield rather than being reframed around whichever dish
   linked to it. So there's no need to reverse-engineer a number that makes
   the link "come out even" anymore — just record the real batch weight.

**Heads-up on the resulting behavior change** (intentional, not a
regression): today, clicking "View recipe" on `resep-116`'s sauce
ingredient lands on `resep-10` pre-scaled to "one order's worth." After
converting `resep-10` to a real unit, that same link will instead land on
`resep-10` showing its own full recorded yield (e.g. "7 kg"). A reader
would then use the site's own [-]/[+] stepper, or the amount `resep-116`'s
own ingredient line states it needs, to figure out how much to actually
make — same as flipping to a sauce's own page in a physical cookbook.

**Done** — raspberry converted both `resep-5` (now 20kg) and `resep-10` as
requested. Confirmed live on the site.

### Next task (2026-08-26): home-scale versions for Ayam Bumbu Rujak

Now that `resep-5`'s real batch weight is recorded, the next step is the
actual home conversion — two recipes needed, not one:

**1. Sauce home version**, linked to `resep-5` as its batch original.
Target **"makes about 4 cups"** — a real proportional rescale of every
ingredient down to that amount (with sensible rounding), not a relabel of
the batch quantities. This becomes the recipe a "View recipe" link lands
on.

**2. Dish home version** — the actual chicken-with-rujak-sauce recipe.
**This dish doesn't exist as a recipe yet at any scale** — unlike Ayam
Sauce Ramayani, which has both `resep-10` (sauce) and `resep-116` (dish) as
separate entries, only the sauce (`resep-5`) exists for Bumbu Rujak. Please
check whether a batch-scale version of this dish exists in the scans (the
way `resep-7` supplied real per-order chicken-piece data that `resep-116`
was built from). If it does, treat it the same as `resep-4`→`resep-114` etc.
If it doesn't, this dish may need composing more like `resep-116` was —
from real technique/ratio knowledge (Arman/Hertha) rather than a scan
transcription.

The dish's home version should reference the sauce home version via
`recipe_ref`, with an ingredient line like *"1 cup Ayam Bumbu Rujak Sauce"*
(however much less than 4 cups one order actually needs) — same pattern as
`resep-113`'s curry-paste ingredient line pointing at `resep-1`. Once both
exist, clicking that link will correctly land on the sauce's own "4 cups"
page with no override, matching section 2's behavior above.

**Done** — `resep-118` (Ayam Bumbu Rujak Sauce, home, ~4 cups) exists,
linked to `resep-5`. `resep-119` (the dish) was created and then removed
again by raspberry's own judgment (*"remove unsourced dish"* — no batch
version existed in the scans to base it on, unlike `resep-116`). Fine as
the record stands; the sauce conversion is what mattered here.

### Next task (2026-08-27): a home-scale version of `resep-10` too

Same situation as `resep-5`, one step behind: `resep-10` (Ayam Sauce
Ramayani Sauce) got converted to a real batch weight (6.7 L) per the
request above, but — unlike `resep-5`→`resep-118` — **nobody's created its
home-scale twin yet**. It's still the only version, so the website
correctly (per section 2's rule) shows its full 6.7 L batch by default,
which isn't what a visitor wants to see.

Target the same convention already set for its sibling: **"makes about 4
cups (about 4 orders, at 1 cup per order)"** — matches `resep-118`'s
framing and the "standardize sauce-per-order to 1 cup" convention already
applied to `resep-116`. Real proportional rescale + rounding, not a
relabel, same as every other conversion here.

**One thing this one needs that `resep-5` didn't**: `resep-116` (the dish)
already exists and its ingredient list already has a `recipe_ref` pointing
directly at `resep-10`. Once `resep-10` is archived (`recipe_type: "batch"`,
linked to the new home recipe), that `recipe_ref` needs updating to point
at the *new* home-scale sauce id instead — otherwise `resep-116`'s "View
recipe" link would point at a now-hidden page. Same fix as was already
done between `resep-119`→`resep-118` before `resep-119` was removed, just
for `resep-116` this time.

**Done (2026-08-27)** — `resep-120` (Ayam Sauce Ramayani Sauce, home,
~4 cups) exists, linked to `resep-10`; `resep-10` is archived
(`recipe_type: "batch"`, `linked_recipe_id: "resep-120"`); `resep-116`'s
sauce ingredient `recipe_ref` repointed from `resep-10` to `resep-120`
(amount stays "1 cup", already on the standardized convention). No method
existed on `resep-10` to begin with (still flagged for Hertha), so
`resep-120` inherits that same gap rather than inventing one — everything
else (ingredients rescaled ~1/7.08, oil's two canting-based rows merged
into one, same photo reused) follows the process agreed for this task, now
written up as a general playbook for any future batch-sauce conversion.

## 3. Please keep review/TODO commentary out of `notes_en`/`notes_id`/`headnote_en`/`headnote_id`

These four fields are rendered directly on the public website — verified,
not assumed. Internal commentary belongs in `review_notes` only (never shown
publicly) or the `flags` array.

We found ~44 of 112 public recipes (as of 2026-08-25) with things like *"FLAG:
Berkas 1, Hal. 9 & 11... please confirm method with mother"* sitting in
`notes_en`, visible to any visitor. Arman is cleaning these up recipe by
recipe as he reviews them, so no bulk fix was applied from this side — just
flagging the pattern so new entries don't repeat it. The rule going forward:
if it's a note to self about what still needs checking, it goes in
`review_notes`; if it's something a reader should see, it goes in
`notes_en`/`headnote_en`; if there's nothing worth telling a reader, leave it
empty.

## 4. Not related to raspberry, but context in case it comes up

The ramayani site itself was refactored this session so that
`recipes.json`'s full content (including `review_notes`/`flags`/`reviewed`,
which aren't even in the TypeScript `Recipe` type, and every recipe
regardless of `content_state` or visibility) no longer gets bundled into the
JavaScript sent to visitors' browsers — it used to, which meant the internal
notes above were technically extractable by anyone opening browser dev
tools, not just visible in the rendered page. This was a website-side fix
(moving data-fetching to Next.js Server Components); it doesn't change
`recipes.json`'s shape or how raspberry should write to it.

## 5. Reply to `HANDOFF_TO_RAMAYANI.md`: `yield_per_serving` is live (2026-08-27)

Read `HANDOFF_TO_RAMAYANI.md` and `docs/yield-scaling.md`, verified
`resep-10`/`resep-120`/`resep-116` in the live data match what both docs
describe before implementing anything. Shipped:

- `yield_per_serving?: number` added to the `Recipe` type, whitelisted
  through `toClientRecipe` (it's a plain number, no privacy concern, but
  everything sent to the client is an explicit whitelist, not a type cast
  — see section 4 above / the earlier data-leak fix — so new fields don't
  reach the browser by accident).
- Recipe page now shows `servings = qty / yield_per_serving`, rendered
  next to the yield stepper: *"Makes: [-] 4 cups [+] (≈4 servings)"*.
- Only shown when `yield_per_serving` is actually set (so `resep-1`,
  still `yield_unit: "servings"`, correctly shows nothing extra — no
  divide-by-the-wrong-thing risk).
- `REF_LINK_SERVINGS`/the `recipe_ref` link override logic — untouched,
  as asked. Confirmed by reading `page.tsx` before changing anything: it
  already only fires for `yield_unit === "servings"` exactly, so this was
  already independent, not something this change could have entangled by
  accident.

**Verified live** (temporarily, locally, `yield_per_serving: 1` on
`resep-120`, never committed since that's raspberry's field to set):
confirmed the display renders correctly, confirmed it updates dynamically
as the `[-]`/`[+]` stepper changes (not frozen at the original
`yield_amount`), confirmed the EN/ID toggle switches "servings"/"porsi"
correctly, confirmed `resep-1` is unaffected. Test value reverted before
committing.

**The two open questions, decided:**
- **Rounding**: nearest whole number, minimum 1
  (`Math.max(1, Math.round(qty / yield_per_serving))`) — exactly the doc's
  own suggestion, no reason to deviate. Documented inline in the code
  comment, not just here.
- **Where else to display it**: recipe detail page only, *not* added to
  `RecipeSummary` (the shape used by `/recipes`, `/search`, and the
  homepage's card/list views). Reasoning: those surfaces were deliberately
  kept to a minimal shape earlier this session specifically so listing
  pages don't ship more than a name/photo/category need — adding a
  servings figure there would mean growing that shared summary payload on
  every listing page just to serve one field on cards, for a number
  that's arguably most useful at the point where someone's actually
  deciding how much to make (the stepper itself), not while skimming a
  list of names. Revisit if there's an actual product reason to show it
  earlier — not needed to ship this.

Go ahead and backfill `yield_per_serving: 1` on `resep-118`/`resep-120`
and add the input field to `RecipeEditor.tsx` whenever's convenient.

## 6. Reply: correction acknowledged, `recipe_ref` link pre-scaling shipped (2026-08-27)

Pulled `f33de38` (correction + follow-up spec), read both new sections
before doing anything.

**Item 1 (the 1 → 0.4 correction)** — no code change needed, as the doc
said; the site was already computing `servings = qty / yield_per_serving`
purely from the data, so the corrected value just flows through. Verified
live: `resep-120` at its full 4-cup batch now shows "≈10 servings" (was
"≈4" under the wrong value), matching the doc's own worked example
exactly.

**Item 2 (pre-scale `recipe_ref` links)** — shipped. `refLinkQty` in
`page.tsx` now checks, per ingredient row, in this order: target's
`yield_unit === "servings"` → `REF_LINK_SERVINGS` (unchanged, resep-1's
path is untouched, confirmed live it still gets `?qty=4`); else the row's
own `unit` matches the target's `yield_unit` (case-insensitive, trailing-s
stripped) → parse the row's `amount` via the existing `units.ts`
`parseAmount()` (reused, not a second parser, as suggested — it already
returns `null` for ranges/"to taste"/anything non-numeric, which is
exactly the safe fallback wanted) and use that as `?qty=`; else `null`, no
override, same as before this change.

Verified live end to end: `resep-116`'s "View recipe" link now reads
`/resep/resep-120?qty=1`, and that URL renders "Makes: 1 cup (≈3
servings)" — landing exactly where Arman described wanting to land,
instead of the full 4-cup batch he had to manually dial down from before.

No open questions on this one — the doc's edge cases (fraction parsing,
leave resep-1 alone, safe fallback on unit mismatch) were all specific
enough to just implement directly.

## 7. Reply: follow-up spec 3 (minimum-batch cap on recipe_ref links) shipped (2026-08-27)

Read the new section, verified `resep-1`/`121`/`113` in the live data
matched the spec's own example (`resep-1` archived, `recipe_type: "batch"`,
linked to `resep-121`; `resep-121` `yield_amount: 8, yield_unit: "tbsp"`;
`resep-113`'s paste row already repointed to `resep-121`) before touching
anything.

Change: in the branch that already does unit-matching (follow-up spec 1),
`refLinkQty[refId]` is now `Math.max(parsed.value, target.yield_amount ??
parsed.value)` instead of just `parsed.value` — never requests less than
the target's own defined minimum batch. The `yield_unit === "servings"` /
`REF_LINK_SERVINGS` branch is untouched (confirmed in the diff, not just
by inspection — that line didn't change).

Verified live, both cases the spec called out:
- `resep-113` → `resep-121`: link is now `?qty=8` (was `?qty=1`) — lands
  on "make 8 Tbsp of curry paste," a realistic batch, not "make 1 Tbsp."
- `resep-116` → `resep-120`: link is now `?qty=4` (was `?qty=1`) — the
  accepted side effect, not treated as a regression to work around, per
  the doc's own instruction.

No open questions on this one either — straightforward to implement once
the live data confirmed the premise.
