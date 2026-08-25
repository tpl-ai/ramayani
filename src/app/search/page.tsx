import { getAllRecipeSummaries } from '@/lib/recipes';
import SearchView from './SearchView';

// Server Component: filters/searches happen client-side against this
// summary list for instant-as-you-type results, but the list itself is
// the RecipeSummary shape (id, category, content_state, photo, names) --
// no ingredients/method/notes/yield or admin-only fields ever reach the
// client bundle.
export default function SearchPage() {
  const recipes = getAllRecipeSummaries();
  return <SearchView recipes={recipes} />;
}
