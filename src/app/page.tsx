import { getRecipeSummariesByIds } from '@/lib/recipes'
import HomeView from './HomeView'

// Which recipes to feature is an editorial choice that doesn't live in
// recipes.json, so it has to be a curated id list -- but everything else
// (name, photo, whether it's clickable) is looked up live below instead of
// being duplicated here, so this list can't drift out of sync the way the
// old hardcoded name/photo/ready fields did (e.g. resep-2 was renamed to
// "Chicken Curry - Restaurant Batch" and hidden from the public site when
// resep-113 replaced it as the cookbook-scale version, silently 404-ing
// this card until the swap below).
const FAVORITE_RECIPE_IDS = [
  'resep-113', 'resep-29', 'resep-34', 'resep-40', 'resep-50', 'resep-10', 'cs-rendang',
]

// A plain Server Component: runs only on Vercel, never in the browser. It
// reads the full recipes.json (via lib/recipes.ts) and hands HomeView only
// the small, whitelisted RecipeSummary shape for the 7 featured ids --
// nothing else in the dataset (other recipes, review_notes/flags/reviewed,
// archived/no_content recipes) is ever included in the page's JS bundle.
export default function HomePage() {
  const favoriteRecipes = getRecipeSummariesByIds(FAVORITE_RECIPE_IDS)
  return <HomeView favoriteRecipes={favoriteRecipes} />
}
