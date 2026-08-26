import { getRecipeById, toClientRecipe, difficultyLevels } from '@/lib/recipes';
import { REF_LINK_SERVINGS } from '@/lib/recipeConstants';
import type { Recipe } from '@/types/recipe';
import ResepView from './ResepView';

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

  // Each recipe_ref ingredient links to that recipe's own page. Only
  // force a `?qty=` override when the target's yield is denominated in
  // the ambiguous "servings" unit -- that's the case where "servings of
  // curry" needs translating into "servings of the referenced paste" via
  // REF_LINK_SERVINGS. A target with a real physical yield_unit doesn't
  // need translating -- its own page already shows its own honest yield
  // (see resolveInitialQty), the way a cookbook's paste recipe just
  // states "makes about 2 cups" on its own page rather than being
  // reframed in terms of the dish that sent you there.
  const refLinkQty: Record<string, number | null> = {};
  if (recipe) {
    for (const ing of recipe.ingredients) {
      const refId = ing.recipe_ref;
      if (refId && !(refId in refLinkQty)) {
        const target = getRecipeById(refId);
        if (target) refLinkQty[refId] = target.yield_unit === 'servings' ? REF_LINK_SERVINGS : null;
      }
    }
  }

  const difficultyInfo = recipe?.difficulty ? difficultyLevels[recipe.difficulty] : undefined;

  return (
    <ResepView
      recipe={recipe ? toClientRecipe(recipe) : null}
      initialQty={initialQty}
      refLinkQty={refLinkQty}
      difficultyInfo={difficultyInfo}
    />
  );
}
