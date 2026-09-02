import { getAllRecipeSummaries, getFilterCategories, getRecipeSummariesByIds } from '@/lib/recipes';
import { BROWSE_TYPES } from '@/lib/browseTypes';
import RecipesView from './RecipesView';

// Server Component: reads the full dataset once, server-side, and hands
// RecipesView only the RecipeSummary shape for all public recipes (id,
// category, content_state, photo, names) plus the category-tab list --
// ingredients/method/notes/yield and every admin-only field stay out of
// the client bundle entirely, and never reach the browser for a page
// that only renders a grid of cards.
//
// `type` (from the homepage's browse-by-type tiles, e.g. ?type=sweets) is
// a separate, curated filter -- see lib/browseTypes.ts -- resolved here
// server-side so the client never needs the full id-list config.
export default function RecipesPage({ searchParams }: { searchParams: { category?: string; type?: string } }) {
  const recipes = getAllRecipeSummaries();
  const categories = getFilterCategories();
  const initialCategory = searchParams.category || 'all';

  const browseType = searchParams.type && BROWSE_TYPES[searchParams.type] ? searchParams.type : null;
  const typeRecipes = browseType ? getRecipeSummariesByIds(BROWSE_TYPES[browseType].recipeIds) : [];
  const typeLabels = browseType ? BROWSE_TYPES[browseType] : null;

  return (
    <RecipesView
      recipes={recipes}
      categories={categories}
      initialCategory={initialCategory}
      initialType={browseType}
      typeRecipes={typeRecipes}
      typeLabels={typeLabels}
    />
  );
}
