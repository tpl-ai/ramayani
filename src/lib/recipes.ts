import type { Recipe, CategoryInfo, DifficultyInfo, RecipeMeta, CategoryWithStats, RecipeSummary, FilterCat } from '@/types/recipe';
import recipesJson from '../../recipes.json';

// This module imports the full recipes.json -- including admin-only
// fields like review_notes/flags/reviewed that aren't even in the Recipe
// type, and every recipe regardless of content_state or public/archived
// status. It must only ever be imported from server-side code (a Server
// Component, a Route Handler) -- never from a 'use client' file, or the
// whole dataset ships to every visitor's browser as part of the page's
// JS bundle. Client components receive data through toClientRecipe/
// toSummary below, which explicitly whitelist what's safe to send.

const data = recipesJson as {
  meta: RecipeMeta;
  categories: Record<string, CategoryInfo>;
  difficulty_levels: Record<string, DifficultyInfo>;
  recipes: Recipe[];
};

export const meta: RecipeMeta = data.meta;
export const categories: Record<string, CategoryInfo> = data.categories;
export const difficultyLevels: Record<string, DifficultyInfo> = data.difficulty_levels;

// A batch/restaurant-scale recipe (recipe_type: 'batch') is an internal
// historical record, kept permanently once a home-scale version exists as
// its own recipe (linked_recipe_id) -- never edited again, never shown on
// the public site. Filtered out here, at the single source every other
// export in this file derives from, so it's never listed, searched, or
// directly reachable on the public site -- it stays fully visible and
// editable in the raspberry admin tool, which reads recipes.json directly
// and never imports this file.
//
// The "- Restaurant Batch" name-suffix check is the original convention
// this replaces (still checked too, for the few recipes tagged that way
// before recipe_type existed) -- new batch recipes should get
// recipe_type: 'batch' set directly instead of relying on the name.
function isPublic(recipe: Recipe): boolean {
  if (recipe.recipe_type === 'batch') return false;
  const marker = 'restaurant batch';
  return !recipe.name_id.toLowerCase().includes(marker) && !recipe.name_en.toLowerCase().includes(marker);
}

export const allRecipes: Recipe[] = data.recipes.filter(isPublic);

export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}

export { recipePhotoSrc } from './photo';

export function getRecipesByCategory(category: string): Recipe[] {
  return allRecipes.filter(r => r.category === category);
}

// Explicit whitelist, not a type cast -- TypeScript types are erased at
// build time and don't stop a stray field from actually being present on
// the runtime object (this is exactly how review_notes leaked to the
// client before: Recipe never declared it, but the real JSON object
// still had it, and passing that object straight into a 'use client'
// component ships whatever properties it actually carries). Rebuilding a
// plain object field-by-field means a new admin-only field added to
// recipes.json later is excluded by default, not included by accident.
export function toClientRecipe(r: Recipe): Recipe {
  return {
    id: r.id,
    resep_num: r.resep_num,
    category: r.category,
    content_state: r.content_state,
    photo: r.photo,
    name_id: r.name_id,
    name_en: r.name_en,
    headnote_id: r.headnote_id,
    headnote_en: r.headnote_en,
    ingredients: r.ingredients,
    method: r.method,
    notes_id: r.notes_id,
    notes_en: r.notes_en,
    serves: r.serves,
    featured_order: r.featured_order,
    yield_amount: r.yield_amount,
    yield_unit: r.yield_unit,
    yield_per_serving: r.yield_per_serving,
    prep_time_minutes: r.prep_time_minutes,
    difficulty: r.difficulty,
    recipe_type: r.recipe_type,
    linked_recipe_id: r.linked_recipe_id,
  };
}

function toSummary(r: Recipe): RecipeSummary {
  return {
    id: r.id,
    category: r.category,
    content_state: r.content_state,
    photo: r.photo,
    name_id: r.name_id,
    name_en: r.name_en,
  };
}

// The full recipe list, shaped for a listing/card view (homepage
// favorites, /recipes grid, /search results) -- none of those views need
// ingredients, method, notes, or yield data, just enough to render a
// card and filter/search by name.
export function getAllRecipeSummaries(): RecipeSummary[] {
  return allRecipes.map(toSummary);
}

// Order-preserving, missing-id-dropping lookup for a curated id list (e.g.
// the homepage's hand-picked "Favorite recipes" row) -- summary-shaped for
// the same reason getAllRecipeSummaries is.
export function getRecipeSummariesByIds(ids: string[]): RecipeSummary[] {
  return ids
    .map(id => allRecipes.find(r => r.id === id))
    .filter((r): r is Recipe => !!r)
    .map(toSummary);
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

// The category-tab bar's data, including the "All" entry -- shared by
// /recipes and the recipe detail page rather than each building this
// array separately.
export function getFilterCategories(): FilterCat[] {
  return [
    { id: 'all', label_en: 'All', label_id: 'Semua' },
    ...getCategoriesWithStats().map(c => ({ id: c.key, label_en: c.name_en, label_id: c.name_id })),
  ];
}

export function t(recipe: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = recipe[`${field}_en` as keyof Recipe] as string;
    const id = recipe[`${field}_id` as keyof Recipe] as string;
    return en || id || '';
  }
  return (recipe[`${field}_id` as keyof Recipe] as string) || '';
}