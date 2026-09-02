import { getRecipeSummariesByIds, getFilterCategories } from '@/lib/recipes'
import { BROWSE_TYPES } from '@/lib/browseTypes'
import HomeView from './HomeView'

// Which recipes to feature is an editorial choice that doesn't live in
// recipes.json, so it has to be a curated id list -- but everything else
// (name, photo, whether it's clickable) is looked up live below instead of
// being duplicated here, so this list can't drift out of sync the way the
// old hardcoded name/photo/ready fields did (e.g. resep-2 was renamed to
// "Chicken Curry - Restaurant Batch" and hidden from the public site when
// resep-113 replaced it as the cookbook-scale version, silently 404-ing
// this card until the swap below).
//
// "Nasi Rames" was requested for this list too, but there's no recipe by
// that name in recipes.json yet -- add its id here once it exists.
const FAVORITE_RECIPE_IDS = [
  'resep-143', 'resep-174', 'cs-ayam-satay', 'resep-113', 'resep-116',
  'resep-164', 'cs-nasi-goreng', 'resep-34', 'resep-149', 'resep-167',
]

// A plain Server Component: runs only on Vercel, never in the browser. It
// reads the full recipes.json (via lib/recipes.ts) and hands HomeView only
// the small, whitelisted RecipeSummary shape for the featured ids --
// nothing else in the dataset (other recipes, review_notes/flags/reviewed,
// archived/no_content recipes) is ever included in the page's JS bundle.
export default function HomePage() {
  const favoriteRecipes = getRecipeSummariesByIds(FAVORITE_RECIPE_IDS)

  // Each browse-by-type tile's photo/label comes from BROWSE_TYPES (shared
  // with /recipes?type=... so the tile and its filtered grid never drift
  // apart) -- the tile just uses that type's first curated recipe as its
  // representative photo.
  const typeTiles = Object.entries(BROWSE_TYPES).map(([id, t]) => {
    const first = getRecipeSummariesByIds([t.recipeIds[0]])[0]
    return { id, label_en: t.label_en, label_id: t.label_id, photo: first?.photo ?? '' }
  })

  const categories = getFilterCategories()

  return <HomeView favoriteRecipes={favoriteRecipes} typeTiles={typeTiles} categories={categories} />
}
