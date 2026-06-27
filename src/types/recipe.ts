export type RecipeStatus = 'complete' | 'needs_method' | 'coming_soon' | 'flagged';

export interface Recipe {
  id: string;
  resep_num: number | null;
  category: string;
  status: RecipeStatus;
  photo: string;
  name_id: string;
  name_en: string;
  headnote_id: string;
  headnote_en: string;
  ingredients_id: string[];
  ingredients_en: string[];
  method_id: string[];
  method_en: string[];
  notes_id: string;
  notes_en: string;
  serves?: string | number;
  featured_order?: number | null;
}

export interface CategoryInfo {
  id: string;
  en: string;
}

export interface RecipeMeta {
  title_id: string;
  title_en: string;
  subtitle_id: string;
  subtitle_en: string;
  welcome_id: string;
  welcome_en: string;
  founder: string;
  restaurant_years: string;
  location: string;
}

export interface CategoryWithStats {
  key: string;
  name_id: string;
  name_en: string;
  count: number;
  photo: string;
}
