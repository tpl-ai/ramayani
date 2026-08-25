# Handoff to raspberry — recipes.json changes from the ramayani side

Date: 2026-08-25

This documents what changed in `recipes.json`'s schema and conventions from a
session working on the **ramayani** website repo. Raspberry is the tool that
actually edits `recipes.json`, so this is what that editing should know
about going forward. Nothing here requires a code change in raspberry itself
— these are two new optional fields and some conventions for using existing
ones. `recipes.json`'s location (project root) and overall shape are
unchanged.

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

## 2. "Serving" vs. "order" — please don't conflate these in `yield_amount`

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
