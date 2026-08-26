import { getRecipeById, toClientRecipe, difficultyLevels } from '@/lib/recipes';
import { REF_LINK_SERVINGS } from '@/lib/recipeConstants';
import type { Recipe } from '@/types/recipe';
import ResepView from './ResepView';

function resolveInitialQty(recipe: Recipe | undefined, qtyParam: string | undefined): number {
  if (qtyParam) {
    const n = Number(qtyParam);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // yield_amount is only ever set on a recipe written at restaurant/batch
  // scale -- a real home-scale recipe (recipe_type: 'home', or anything
  // not yet reviewed under that scheme) uses the descriptive `serves`
  // field instead and has no yield_amount at all. So any recipe with
  // yield_amount set lands at a small consumer-scale quantity by
  // default, same as arriving via a recipe_ref "View recipe" link,
  // rather than showing the full batch (which could be hundreds of
  // servings) to someone who found this page directly via search or a
  // bookmark. This is a display default, not a claim that the recipe has
  // been reviewed/converted -- an unreviewed batch recipe still shows
  // its interpolated (linearly-divided) quantities, not a hand-adjusted
  // home version.
  if (recipe?.yield_amount != null) return REF_LINK_SERVINGS;
  return 4;
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

  const validRefIds = recipe
    ? Array.from(new Set(
        recipe.ingredients
          .map(i => i.recipe_ref)
          .filter((id): id is string => !!id && !!getRecipeById(id))
      ))
    : [];

  const difficultyInfo = recipe?.difficulty ? difficultyLevels[recipe.difficulty] : undefined;

  return (
    <ResepView
      recipe={recipe ? toClientRecipe(recipe) : null}
      initialQty={initialQty}
      validRefIds={validRefIds}
      difficultyInfo={difficultyInfo}
    />
  );
}
