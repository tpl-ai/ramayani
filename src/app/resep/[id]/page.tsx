import { getRecipeById, toClientRecipe, difficultyLevels, getFilterCategories } from '@/lib/recipes';
import { REF_LINK_SERVINGS } from '@/lib/recipeConstants';
import { parseAmount } from '@/lib/units';
import type { Recipe } from '@/types/recipe';
import ResepView from './ResepView';

// "1 cup" vs "cups", "kg" vs "kg" -- good enough for the handful of real
// units in use; not a general unit-conversion table (there isn't one --
// see docs/yield-scaling.md on why cross-unit bridging was deliberately
// never built).
function unitsMatch(a: string, b: string): boolean {
  const norm = (u: string) => u.trim().toLowerCase().replace(/s$/, '');
  return !!a && !!b && norm(a) === norm(b);
}

function resolveInitialQty(recipe: Recipe | undefined, qtyParam: string | undefined): number {
  if (qtyParam) {
    const n = Number(qtyParam);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // "servings" is an ambiguous, back-derived proxy unit for a sauce/paste
  // component -- its yield_amount in that case is an estimate of how many
  // servings of some OTHER dish the batch supports (guessed from
  // portion-per-order conventions), not a directly measured quantity, so
  // the raw number (which can run into the hundreds) isn't something to
  // show a reader by default. A real physical unit (cups, mL, g, kg...)
  // is self-explanatory by comparison, the way any cookbook's "makes
  // about 2 cups" already is -- shown as recorded, no softening needed.
  if (recipe?.yield_amount != null && recipe.yield_unit === 'servings') return REF_LINK_SERVINGS;
  return recipe?.yield_amount ?? 4;
}

// Server Component: reads the full dataset (via lib/recipes.ts) and does
// everything that requires it -- looking up the recipe, resolving which
// of its recipe_ref ingredients point at other real public recipes,
// resolving the difficulty label -- then hands ResepView only this one
// recipe's whitelisted content (toClientRecipe strips admin-only fields
// like review_notes/flags/reviewed) plus a couple of small derived
// values. No other recipe, and no internal field, reaches the client
// bundle for this page.
export default function ResepPage({ params, searchParams }: {
  params: { id: string };
  searchParams: { qty?: string };
}) {
  const recipe = getRecipeById(params.id);
  const initialQty = resolveInitialQty(recipe, searchParams.qty);

  // Each recipe_ref ingredient links to that recipe's own page, pre-scaled
  // to what THIS row actually needs where that's knowable:
  //  - target yield is the ambiguous "servings" unit (only resep-1 today)
  //    -- REF_LINK_SERVINGS, unchanged, same as always.
  //  - target yield is a real physical unit AND this row's own unit
  //    matches it (by convention, a recipe_ref row is written in the
  //    target's yield_unit -- e.g. resep-116's "1 cup" matches resep-120's
  //    yield_unit: "cups") -- parse the row's stated amount, but never go
  //    below the target's own yield_amount. A batch/paste/marinade
  //    recipe's yield_amount is now defined as the smallest sensible
  //    amount of that thing to prepare (the standing minimum-batch rule,
  //    see docs/yield-scaling.md) -- e.g. resep-113 needing "1 Tbsp" of
  //    curry paste would otherwise link to a page saying "make 1 Tbsp,"
  //    which isn't something anyone actually does (you batch-prepare a
  //    paste and use a spoonful). Capping at the target's own floor means
  //    a small per-row amount lands on that floor instead of an
  //    unrealistically tiny one; a large amount is unaffected (Math.max
  //    is a no-op once the row's own amount already clears the floor).
  //  - anything else (units don't match, amount doesn't parse -- a range,
  //    "to taste") -- no override, same fallback as before this change.
  const refLinkQty: Record<string, number | null> = {};
  if (recipe) {
    for (const ing of recipe.ingredients) {
      const refId = ing.recipe_ref;
      if (refId && !(refId in refLinkQty)) {
        const target = getRecipeById(refId);
        if (!target) continue;
        if (target.yield_unit === 'servings') {
          refLinkQty[refId] = REF_LINK_SERVINGS;
        } else if (target.yield_unit && unitsMatch(ing.unit, target.yield_unit)) {
          const parsed = parseAmount(ing.amount);
          refLinkQty[refId] = parsed && parsed.value > 0
            ? Math.max(parsed.value, target.yield_amount ?? parsed.value)
            : null;
        } else {
          refLinkQty[refId] = null;
        }
      }
    }
  }

  const difficultyInfo = recipe?.difficulty ? difficultyLevels[recipe.difficulty] : undefined;
  const categories = getFilterCategories();

  return (
    <ResepView
      recipe={recipe ? toClientRecipe(recipe) : null}
      initialQty={initialQty}
      refLinkQty={refLinkQty}
      difficultyInfo={difficultyInfo}
      categories={categories}
    />
  );
}
