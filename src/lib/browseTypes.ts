// The homepage's 4 "browse by type" tiles (Curries & Soups, Fried &
// Grilled, Vegetarian, Sweets) are an editorial grouping that cuts across
// recipes.json's real protein/course categories, so -- same reasoning as
// FAVORITE_RECIPE_IDS in app/page.tsx -- each one is a curated id list
// rather than a derived filter. Shared between the homepage (tile photo +
// label) and /recipes?type=... (the actual filtered grid) so the two
// never drift apart.
export const BROWSE_TYPES: Record<string, { label_en: string; label_id: string; recipeIds: string[] }> = {
  'curries-soups': {
    label_en: 'Curries & Soups',
    label_id: 'Kari & Sop',
    recipeIds: ['cs-soto-ayam', 'resep-113', 'resep-149', 'resep-163', 'resep-167', 'resep-182'],
  },
  'fried-grilled': {
    label_en: 'Fried & Grilled',
    label_id: 'Goreng & Bakar',
    recipeIds: ['resep-7', 'cs-ayam-satay', 'resep-170', 'resep-172', 'resep-160', 'resep-175'],
  },
  'vegetarian': {
    label_en: 'Vegetarian',
    label_id: 'Vegetarian',
    recipeIds: ['resep-174', 'resep-34', 'resep-176', 'cs-sambal-goreng-tahu-buncis', 'cs-sambal-goreng-tempe', 'resep-127', 'resep-41'],
  },
  'sweets': {
    label_en: 'Sweets',
    label_id: 'Manis',
    recipeIds: ['cs-ice-cendol', 'resep-157', 'cs-ice-cincao', 'cs-ice-teller', 'cs-ice-doger', 'resep-158', 'resep-189', 'resep-46'],
  },
}
