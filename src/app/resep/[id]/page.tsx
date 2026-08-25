import { getRecipeById, toClientRecipe, isComponentRecipe, difficultyLevels } from '@/lib/recipes';
import { REF_LINK_SERVINGS } from '@/lib/recipeConstants';
import type { Recipe } from '@/types/recipe';
import ResepView from './ResepView';

function resolveInitialQty(recipe: Recipe | undefined, qtyParam: string | undefined, isComponent: boolean): number {
  if (qtyParam) {
    const n = Number(qtyParam);
    if (Number.isFinite(n) && n > 0) return n;
  }
  // A component recipe (a paste/sauce another recipe links to) lands at
  // consumer scale by default, same as arriving via that recipe's own
  // "View recipe" link -- its yield_amount is the full historical batch,
  // not a sane thing to show someone who found this page directly (e.g.
  // via search) rather than through a parent dish.
  if (isComponent) return REF_LINK_SERVINGS;
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
  const isComponent = recipe ? isComponentRecipe(recipe.id) : false;
  const initialQty = resolveInitialQty(recipe, searchParams.qty, isComponent);

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
