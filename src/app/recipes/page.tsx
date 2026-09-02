import { getAllRecipeSummaries, getFilterCategories, getBrowseTypeList, getRecipeSummariesByBrowseType } from '@/lib/recipes';
import RecipesView from './RecipesView';

// Server Component: reads the full dataset once, server-side, and hands
// RecipesView only the RecipeSummary shape for all public recipes (id,
// category, content_state, photo, names) plus the category-tab list --
// ingredients/method/notes/yield and every admin-only field stay out of
// the client bundle entirely, and never reach the browser for a page
// that only renders a grid of cards.
//
// `type` (from the homepage's browse-by-type tiles, e.g. ?type=sweets) is
// recipe.browse_type -- a second, admin-editable field, resolved here
// server-side same as `category` is.
export default function RecipesPage({ searchParams }: { searchParams: { category?: string; type?: string } }) {
  const recipes = getAllRecipeSummaries();
  const categories = getFilterCategories();
  const groupItems = getBrowseTypeList();
  const initialCategory = searchParams.category || 'all';

  const browseType = searchParams.type && groupItems.some(g => g.id === searchParams.type) ? searchParams.type : null;
  const typeRecipes = browseType ? getRecipeSummariesByBrowseType(browseType) : [];
  const typeLabels = browseType ? groupItems.find(g => g.id === browseType) ?? null : null;

  return (
    <RecipesView
      recipes={recipes}
      categories={categories}
      groupItems={groupItems}
      initialCategory={initialCategory}
      initialType={browseType}
      typeRecipes={typeRecipes}
      typeLabels={typeLabels}
    />
  );
}
