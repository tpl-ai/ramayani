import { getAllRecipeSummaries, getFilterCategories } from '@/lib/recipes';
import RecipesView from './RecipesView';

// Server Component: reads the full dataset once, server-side, and hands
// RecipesView only the RecipeSummary shape for all public recipes (id,
// category, content_state, photo, names) plus the category-tab list --
// ingredients/method/notes/yield and every admin-only field stay out of
// the client bundle entirely, and never reach the browser for a page
// that only renders a grid of cards.
export default function RecipesPage({ searchParams }: { searchParams: { category?: string } }) {
  const recipes = getAllRecipeSummaries();
  const categories = getFilterCategories();
  const initialCategory = searchParams.category || 'all';

  return <RecipesView recipes={recipes} categories={categories} initialCategory={initialCategory} />;
}
