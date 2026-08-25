// Client-safe constants shared between a recipe's server page (computing
// the initial serving quantity) and its client view (building the "View
// recipe" link href for a component ingredient) -- kept out of
// lib/recipes.ts so importing it doesn't pull the full recipes.json into
// a client bundle.

// A row with recipe_ref calls for a quantity of another recipe (a paste, a
// stock) as a component. Rather than try to compute what fraction of that
// recipe's batch this specific row needs -- fragile, since it would require
// the row's own amount/unit to exactly match the referenced recipe's
// yield_unit -- the link just sends the reader to that recipe's own page
// pre-scaled to REF_LINK_SERVINGS servings, e.g. "the paste ingredients
// needed for 4 servings of curry". 1 serving alone is too fine-grained for
// a concentrated ingredient like a spice paste -- fractions of a teaspoon
// even with decimal precision -- so this lands on a normal small
// stovetop-batch quantity instead, the way a cookbook recipe would.
export const REF_LINK_SERVINGS = 4;
