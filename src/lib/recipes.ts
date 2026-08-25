import type { Recipe, CategoryInfo, DifficultyInfo, RecipeMeta, CategoryWithStats } from '@/types/recipe';
import recipesJson from '../../recipes.json';

const data = recipesJson as {
  meta: RecipeMeta;
  categories: Record<string, CategoryInfo>;
  difficulty_levels: Record<string, DifficultyInfo>;
  recipes: Recipe[];
};

export const meta: RecipeMeta = data.meta;
export const categories: Record<string, CategoryInfo> = data.categories;
export const difficultyLevels: Record<string, DifficultyInfo> = data.difficulty_levels;

// A "- Restaurant Batch" (or similar) suffix in either language's title
// marks a recipe as an internal/historical record -- e.g. the original
// restaurant-scale version once a cookbook-scale version of the same dish
// exists as its own recipe. Filtered out here, at the single source every
// other export in this file derives from, so it's never listed, searched,
// or directly reachable on the public site -- it stays fully visible and
// editable in the raspberry admin tool, which reads recipes.json directly
// and never imports this file.
function isPublic(recipe: Recipe): boolean {
  const marker = 'restaurant batch';
  return !recipe.name_id.toLowerCase().includes(marker) && !recipe.name_en.toLowerCase().includes(marker);
}

export const allRecipes: Recipe[] = data.recipes.filter(isPublic);

export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}

/**
 * recipe.photo is either a bare filename served from /public/images (the
 * original convention) or a full URL from Vercel Blob (written by the
 * admin tool's photo upload). Absolute URLs are used as-is; anything else
 * is resolved against /images/.
 */
export function recipePhotoSrc(photo: string): string {
  return /^https?:\/\//.test(photo) ? photo : `/images/${photo}`;
}

export function getRecipesByCategory(category: string): Recipe[] {
  return allRecipes.filter(r => r.category === category);
}

// Display order for category tabs/tiles, independent of recipes.json's key
// order (which reflects edit history in the admin tool, not intended
// display order). Categories not listed here (e.g. a brand-new one added
// in the admin tool before this list is updated) sort after all listed
// ones rather than disappearing.
const CATEGORY_ORDER = [
  'ayam', 'daging', 'seafood', 'nasi_mie', 'sayuran_salad',
  'appetizer', 'desserts_drinks', 'sambal_saus', 'bumbu_dasar', 'other',
];

export function getCategoriesWithStats(): CategoryWithStats[] {
  return Object.entries(categories)
    .map(([key, cat]) => {
      const recipes = allRecipes.filter(r => r.category === key);
      const photo = recipes.find(r => r.photo)?.photo ?? '';
      return { key, name_id: cat.id, name_en: cat.en, count: recipes.length, photo };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.key);
      const bi = CATEGORY_ORDER.indexOf(b.key);
      return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
    });
}

export function t(recipe: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = recipe[`${field}_en` as keyof Recipe] as string;
    const id = recipe[`${field}_id` as keyof Recipe] as string;
    return en || id || '';
  }
  return (recipe[`${field}_id` as keyof Recipe] as string) || '';
}