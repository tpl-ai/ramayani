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
  method_id: string[];
  method_en: string[];
  notes_id: string;
  notes_en: string;
  serves?: string | number;
  featured_order?: number | null;
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
