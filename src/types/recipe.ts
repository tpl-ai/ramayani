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
  // How much of yield_amount (in the same yield_unit) equals one serving
  // -- e.g. yield_amount: 4, yield_unit: "cups", yield_per_serving: 1
  // means 1 cup is a serving. Only meaningful when yield_unit is a real
  // physical unit (not the ambiguous "servings" unit itself, where the
  // amount already IS the serving count with nothing to divide). Lets
  // the site compute and display an approximate servings count instead
  // of that only existing as unstructured headnote prose ("about 1 cup
  // per order"). See HANDOFF_TO_RAMAYANI.md / docs/yield-scaling.md for
  // the full spec and history.
  yield_per_serving?: number;
  prep_time_minutes?: number;
  difficulty?: string;
  // A dish can exist as two separate recipes: the restaurant/batch
  // original (kept permanently as the historical record, never edited
  // again once a home version exists) and a home-scale version derived
  // from it (its own hand-adjusted ingredients/method/serves, not just
  // the batch numbers divided down -- see resep-113 through resep-117
  // for real examples). 'batch' is excluded from the public site
  // (isPublic in lib/recipes.ts); 'home' is what visitors see.
  // linked_recipe_id points at the other half of the pair, when one
  // exists. Most recipes have neither field set yet -- absence doesn't
  // mean "batch" or "home", it means not yet classified under this
  // scheme, and stays visible as-is in the meantime.
  recipe_type?: 'batch' | 'home';
  linked_recipe_id?: string;
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

// The minimal shape a listing/card view needs (homepage favorites,
// /recipes grid, /search results) -- deliberately excludes ingredients,
// method, notes, and everything else, so pages that only render a grid of
// cards don't pull full recipe content (or the JSON's admin-only fields
// like review_notes/flags/reviewed) into the client bundle just to show a
// photo and a name.
export interface RecipeSummary {
  id: string;
  category: string;
  content_state: ContentState;
  photo: string;
  name_id: string;
  name_en: string;
}

// The category-tab bar's shape -- used on both /recipes (filters its own
// grid) and the recipe detail page (navigates to /recipes?category=X).
export interface FilterCat {
  id: string;
  label_en: string;
  label_id: string;
}
