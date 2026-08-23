/**
 * Written by the raspberry admin tool. "full" means real transcribed
 * content exists (name, ingredients, method) — not that every field is
 * finished; translation/enrichment gaps are tracked separately and don't
 * affect this.
 */
export type ContentState = 'no_content' | 'partial' | 'full';

export interface IngredientLine {
  // Shared across languages, like unit.
  amount: string;
  // Shared across languages, not translated — a can is a can regardless of
  // whether the label reads "kaleng" or "can".
  unit: string;
  name_id: string;
  name_en: string;
  // If present, this row begins a new named sub-group (e.g. "Diblender" /
  // "To be blended"); everything after it belongs to that group until the
  // next row with a `section_id`/`section_en` value.
  section_id?: string;
  section_en?: string;
  // If present, this row's amount/unit is a quantity of another recipe (a
  // component like a paste or stock) — the id of that Recipe. Its
  // amount/unit is expressed in the same unit as the referenced recipe's
  // `yield_unit`.
  recipe_ref?: string;
}

export interface MethodStep {
  step_id: string;
  step_en: string;
  // Same convention as IngredientLine.section_id/section_en.
  section_id?: string;
  section_en?: string;
}

export interface Recipe {
  id: string;
  resep_num: number | null;
  category: string;
  content_state: ContentState;
  photo: string;
  name_id: string;
  name_en: string;
  headnote_id: string;
  headnote_en: string;
  ingredients: IngredientLine[];
  method: MethodStep[];
  notes_id: string;
  notes_en: string;
  serves?: string | number;
  featured_order?: number | null;
  // Set only on recipes written at restaurant/batch scale — what the
  // ingredients/method actually produce (e.g. 20kg of paste, 84 orders of
  // curry). Drives the serving-size control and lets other recipes
  // reference this one as a component (see IngredientLine.recipe_ref).
  yield_amount?: number;
  yield_unit?: string;
  prep_time_minutes?: number;
  difficulty?: string;
}

export interface CategoryInfo {
  id: string;
  en: string;
}

export interface DifficultyInfo {
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
