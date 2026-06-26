import type { Recipe, CategoryInfo, RecipeMeta, CategoryWithStats } from '@/types/recipe';
import recipesJson from '../../recipes.json';

const data = recipesJson as {
  meta: RecipeMeta;
  categories: Record<string, CategoryInfo>;
  recipes: Recipe[];
};

export const meta: RecipeMeta = data.meta;
export const categories: Record<string, CategoryInfo> = data.categories;
export const allRecipes: Recipe[] = data.recipes;

export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}

export function getRecipesByCategory(category: string): Recipe[] {
  return allRecipes.filter(r => r.category === category);
}

export function getCategoriesWithStats(): CategoryWithStats[] {
  return Object.entries(categories)
    .map(([key, cat]) => {
      const recipes = allRecipes.filter(r => r.category === key);
      const photo = recipes.find(r => r.photo)?.photo ?? '';
      return { key, name_id: cat.id, name_en: cat.en, count: recipes.length, photo };
    })
    .filter(c => c.count > 0);
}

export function t(recipe: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = recipe[`${field}_en` as keyof Recipe] as string;
    const id = recipe[`${field}_id` as keyof Recipe] as string;
    return en || id || '';
  }
  return (recipe[`${field}_id` as keyof Recipe] as string) || '';
}
