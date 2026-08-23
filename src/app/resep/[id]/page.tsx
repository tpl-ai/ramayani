'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, meta, difficultyLevels, recipePhotoSrc } from '@/lib/recipes';
import { displayQuantity } from '@/lib/units';
import type { Recipe, IngredientLine, MethodStep } from '@/types/recipe';
import Header from '@/components/Header';

const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const FACT_ICON = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: '#cc0000', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

// A recipe_ref ingredient links to another recipe -- kept name-free (just
// "View recipe") since the ingredient's own name and the referenced
// recipe's title are two independently-edited fields that don't always
// agree (e.g. "Ayam Kare curry paste" vs. that recipe's own title "Chicken
// Curry Paste"), so repeating one next to the other read as a mismatch.
const RECIPE_LINK_BTN = {
  display: 'inline-block', marginTop: 6,
  padding: '4px 12px', fontFamily: HELVETICA, fontSize: 12, fontWeight: 500,
  color: '#cc0000', border: '1px solid #cc0000', borderRadius: 999,
  textDecoration: 'none',
} as const;

function ServesIcon() {
  return (
    <svg {...FACT_ICON}>
      <path d="M7 2v7a2 2 0 0 0 4 0V2M9 9v13M15 2c-1.5 1.5-2 3.5-2 6s.5 4.5 2 6M15 2v20" />
    </svg>
  );
}
function PrepTimeIcon() {
  return (
    <svg {...FACT_ICON}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2M10 2h4M12 2v2" />
    </svg>
  );
}
function DifficultyIcon() {
  return (
    <svg {...FACT_ICON}>
      <path d="M12 2c2 3-1 4-1 7a3 3 0 0 0 6 0c1.5 2 1 5-1 7a6 6 0 1 1-8-11c1-1 1.5-2 1-4 1 0 2.5.5 3 1Z" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg {...FACT_ICON}>
      <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z" />
    </svg>
  );
}

function FactItem({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      onClick={onClick}
      className={onClick ? 'print-hide' : undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: HELVETICA, fontSize: 15, fontWeight: 400, color: '#1a1a1a',
        background: 'none', border: 'none', padding: 0, margin: 0,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon}
      <span>{label}</span>
    </Tag>
  );
}

// ── helpers ───────────────────────────────────────────────────────

function tx(r: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = r[`${field}_en` as keyof Recipe] as string;
    return en || (r[`${field}_id` as keyof Recipe] as string) || '';
  }
  return (r[`${field}_id` as keyof Recipe] as string) || '';
}

// Ingredient/section names are transcribed as-typed (deliberately, so
// editors don't have to fix casing while entering recipes) and end up a
// mix of cases. Display-only sentence case keeps the site consistent
// without touching the stored data — only the first character changes,
// so acronyms like "MSG" and anything already capitalized are untouched.
function sentenceCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function ingredientSection(item: IngredientLine, lang: 'id' | 'en'): string {
  const value = lang === 'en' ? (item.section_en || item.section_id) : (item.section_id || item.section_en);
  return sentenceCase(value || '');
}

function methodStepText(step: MethodStep, lang: 'id' | 'en'): string {
  return lang === 'en' ? (step.step_en || step.step_id) : (step.step_id || step.step_en);
}

function methodSection(step: MethodStep, lang: 'id' | 'en'): string {
  const value = lang === 'en' ? (step.section_en || step.section_id) : (step.section_id || step.section_en);
  return sentenceCase(value || '');
}

function formatIngredient(item: IngredientLine, lang: 'id' | 'en', factor: number, unitSystem: 'metric' | 'imperial'): string {
  const name = lang === 'en' ? (item.name_en || item.name_id) : (item.name_id || item.name_en);
  const { amount, unit } = displayQuantity(item.amount, item.unit, factor, unitSystem);
  return [amount, unit, sentenceCase(name)].filter(Boolean).join(' ');
}

// A row with recipe_ref calls for a quantity of another recipe (a paste, a
// stock) as a component. Rather than try to compute what fraction of that
// recipe's batch this specific row needs -- fragile, since it would require
// the row's own amount/unit to exactly match the referenced recipe's
// yield_unit -- the link just sends the reader to that recipe's own page
// pre-scaled to REF_LINK_SERVINGS servings, e.g. "the paste ingredients
// needed for 4 servings of curry". 1 serving alone is too fine-grained for
// a concentrated ingredient like a spice paste -- fractions of a teaspoon
// even with decimal precision -- so this lands on a normal small
// stovetop-batch quantity instead, the way a cookbook recipe would.
const REF_LINK_SERVINGS = 4;

function resolveInitialQty(recipe: Recipe | undefined, qtyParam: string | null): number {
  if (qtyParam) {
    const n = Number(qtyParam);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return recipe?.yield_amount ?? 4;
}

function singularizeUnit(unit: string): string {
  if (/(ch|sh|x)es$/.test(unit)) return unit.slice(0, -2);
  return unit.replace(/s$/, '');
}

// ── page ──────────────────────────────────────────────────────────

export default function ResepPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const searchParams = useSearchParams();
  const { lang: ctxLang } = useLang();
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');

  const [photoFailed, setPhotoFailed] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const recipe = getRecipeById(id);
  // Drives the yield/serving-size control below — independent of the
  // `serves` field, which is just descriptive text ("Serves 4-6"). Starts
  // at the recipe's own full batch (as scanned/written), not an arbitrary
  // default, so the reader sees the source-accurate quantities first and
  // scales down (or up) from there -- unless arrived at via a recipe_ref
  // link with a `?qty=` override (see resolveInitialQty above).
  const [qty, setQty] = useState(() => resolveInitialQty(recipe, searchParams.get('qty')));
  const baseQty = useRef(recipe?.yield_amount ?? 4);

  useEffect(() => {
    if (localStorage.getItem('ramayani_units') === 'imperial') setUnitSystem('imperial');
  }, []);

  // Reset the yield control when navigating client-side between recipes
  // (Previous/Next, or a recipe_ref link) rather than carrying the old
  // recipe's base/qty over.
  useEffect(() => {
    baseQty.current = recipe?.yield_amount ?? 4;
    setQty(resolveInitialQty(recipe, searchParams.get('qty')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setUnit = (u: 'metric' | 'imperial') => {
    setUnitSystem(u);
    localStorage.setItem('ramayani_units', u);
  };

  if (!recipe) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh', fontFamily: HELVETICA }}>
        <Header lang={lang} setLang={setLang} />
        <div style={{ padding: '16px 48px 0' }}>
          <a href="/recipes" style={{ fontSize: 13, color: '#999', textDecoration: 'none', fontFamily: HELVETICA }}>← All recipes</a>
        </div>
        <div className="empty-state">
          <p className="empty-title">Recipe not found</p>
          <p className="empty-text">
            {ctxLang === 'id' ? 'Resep tidak ditemukan.' : 'This recipe could not be found.'}
          </p>
          <Link href="/" style={{ color: '#cc0000', fontSize: 15, marginTop: 16, display: 'inline-block' }}>
            ← {ctxLang === 'id' ? 'Kembali' : 'Back home'}
          </Link>
        </div>
      </div>
    );
  }

  const name      = tx(recipe, 'name', ctxLang);
  const headnote  = tx(recipe, 'headnote', ctxLang);
  const notes     = tx(recipe, 'notes', ctxLang);
  const showPhoto = !!recipe.photo && !photoFailed;
  const ings      = recipe.ingredients;
  const steps = recipe.method
    .map((s) => ({ text: methodStepText(s, ctxLang), section: methodSection(s, ctxLang) }))
    .filter((s) => s.text);
  const factor    = qty / baseQty.current;
  const isComingSoon = recipe.content_state === 'no_content';
  const processedIngs = ings.map(i => formatIngredient(i, ctxLang, factor, unitSystem));
  const servesDisplay = typeof recipe.serves === 'string' && recipe.serves.trim() ? recipe.serves : null;

  const servesFact = typeof recipe.serves === 'number'
    ? `${ctxLang === 'id' ? 'Porsi' : 'Serves'} ${recipe.serves}`
    : servesDisplay
      ? `${ctxLang === 'id' ? 'Porsi' : 'Serves'} ${servesDisplay}`
      : null;
  const prepFact = recipe.prep_time_minutes
    ? `${ctxLang === 'id' ? 'Persiapan' : 'Prep'} ${recipe.prep_time_minutes} ${ctxLang === 'id' ? 'menit' : 'min'}`
    : null;
  const difficultyInfo = recipe.difficulty ? difficultyLevels[recipe.difficulty] : undefined;
  const difficultyFact = difficultyInfo ? (ctxLang === 'id' ? difficultyInfo.id : difficultyInfo.en) : null;

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: HELVETICA }}>
      <style jsx global>{`
        @media print {
          .print-hide { display: none !important; }
        }
      `}</style>

      <div className="print-hide">
        <Header lang={lang} setLang={setLang} />
      </div>

      <div className="recipe-container">
        {isComingSoon ? (
          <div style={{ maxWidth: 560 }}>
            {showPhoto && (
              <img
                ref={img => { if (img && img.complete) img.classList.add('loaded'); }}
                src={recipePhotoSrc(recipe.photo)}
                alt={name}
                className="recipe-photo-fixed img-fade"
                loading="eager"
                onLoad={e => e.currentTarget.classList.add('loaded')}
                onError={() => setPhotoFailed(true)}
              />
            )}
            <h1
              className={`recipe-title${showPhoto ? '' : ' recipe-title-nophoto'}`}
              style={{ fontFamily: HELVETICA, fontSize: 28, fontWeight: 600, color: '#1a1a1a' }}
            >
              {name}
            </h1>
            {headnote && <p className="recipe-headnote" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>{headnote}</p>}
            <p className="coming-soon-note" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
              {ctxLang === 'id' ? 'Resep segera hadir.' : 'Recipe coming soon.'}
            </p>
          </div>
        ) : (
          <>
            <div className="recipe-hero-row" style={!showPhoto ? { gridTemplateColumns: '1fr' } : undefined}>
              {showPhoto && (
                <div>
                  <img
                    ref={img => { if (img && img.complete) img.classList.add('loaded'); }}
                    src={recipePhotoSrc(recipe.photo)}
                    alt={name}
                    className="recipe-hero-photo img-fade"
                    loading="eager"
                    onLoad={e => e.currentTarget.classList.add('loaded')}
                    onError={() => setPhotoFailed(true)}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <h1 className="recipe-hero-title" style={{ fontFamily: HELVETICA, fontWeight: 350, color: '#1a1a1a', lineHeight: 1.15, margin: 0 }}>
                  {name}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', rowGap: 10, columnGap: 24, margin: '48px 0 20px' }}>
                  {servesFact && <FactItem icon={<ServesIcon />} label={servesFact} />}
                  {prepFact && <FactItem icon={<PrepTimeIcon />} label={prepFact} />}
                  {difficultyFact && <FactItem icon={<DifficultyIcon />} label={difficultyFact} />}
                  <FactItem
                    icon={<PrintIcon />}
                    label={ctxLang === 'id' ? 'Cetak resep' : 'Print recipe'}
                    onClick={() => window.print()}
                  />
                </div>
                <div className="recipe-rule" style={{ background: '#e8e8e8 ' }} />
              </div>
            </div>

            {(headnote || notes) && (
              <div className="recipe-description">
                {headnote && (
                  <p style={{ fontFamily: HELVETICA, fontSize: 24, lineHeight: 1.6, color: '#1a1a1a', marginBottom: notes ? 16 : 0 }}>
                    {headnote}
                  </p>
                )}
                {notes && (
                  <p style={{ fontFamily: HELVETICA, fontSize: 24, lineHeight: 1.6, color: '#1a1a1a' }}>{notes}</p>
                )}
              </div>
            )}

            <div className="recipe-layout">
              {/* Left: ingredients */}
              <div className="recipe-ingredients-col">
                <div className="col-heading-row">
                  <span className="col-head" style={{ fontFamily: HELVETICA, fontSize: 18, color: '#1a1a1a',textTransform: 'none' }}>
                    {ctxLang === 'id' ? 'Bahan-Bahan' : 'Ingredients'}
                  </span>
                  <div className="unit-toggle print-hide" role="group" aria-label="Unit system">
                    <button
                      className={`unit-btn${unitSystem === 'metric' ? ' active' : ''}`}
                      onClick={() => setUnit('metric')}
                      style={{ fontFamily: HELVETICA, color: unitSystem === 'metric' ? '#cc0000' : undefined }}
                    >
                      Metric
                    </button>
                    <span className="unit-sep" aria-hidden="true">|</span>
                    <button
                      className={`unit-btn${unitSystem === 'imperial' ? ' active' : ''}`}
                      onClick={() => setUnit('imperial')}
                      style={{ fontFamily: HELVETICA, color: unitSystem === 'imperial' ? '#cc0000' : undefined }}
                    >
                      Imperial
                    </button>
                  </div>
                </div>

                {recipe.yield_amount != null && (
                  <div className="serves-row" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
                    <span>{ctxLang === 'id' ? 'Jumlah:' : 'Makes:'}</span>
                    <button
                      className="serves-btn"
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Fewer"
                      style={{ fontFamily: HELVETICA }}
                      onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.borderColor = '#cc0000'; e.currentTarget.style.color = '#cc0000'; } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                    >
                      −
                    </button>
                    <span className="serves-num">
                      {qty}{recipe.yield_unit ? ` ${qty === 1 ? singularizeUnit(recipe.yield_unit) : recipe.yield_unit}` : ''}
                    </span>
                    <button
                      className="serves-btn"
                      onClick={() => setQty(q => q + 1)}
                      aria-label="More"
                      style={{ fontFamily: HELVETICA }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#cc0000'; e.currentTarget.style.color = '#cc0000'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                    >
                      +
                    </button>
                  </div>
                )}

                {ings.length > 0 ? (
                  <ul className="ing-list">
                    {processedIngs.map((item, i) => {
                      const refRecipe = ings[i].recipe_ref ? getRecipeById(ings[i].recipe_ref!) : undefined;
                      return (
                        <Fragment key={i}>
                          {ingredientSection(ings[i], ctxLang) && (
                            <li
                              className="ing-section-heading"
                              style={{ listStyle: 'none', fontFamily: HELVETICA, fontWeight: 700, fontSize: 14, color: '#333', marginTop: i > 0 ? 28 : 0, marginBottom: 6 }}
                            >
                              {ingredientSection(ings[i], ctxLang)}
                            </li>
                          )}
                          <li className="ing-item" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
                            {item}
                            {refRecipe && (
                              <div className="print-hide">
                                <Link href={`/resep/${refRecipe.id}?qty=${REF_LINK_SERVINGS}`} style={RECIPE_LINK_BTN}>
                                  {ctxLang === 'id' ? 'Lihat resep' : 'View recipe'}
                                </Link>
                              </div>
                            )}
                          </li>
                        </Fragment>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="ing-empty" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
                    {ctxLang === 'id' ? 'Bahan segera ditambahkan.' : 'Ingredients coming soon.'}
                  </p>
                )}
              </div>

              {/* Right: method */}
              <div className="recipe-method-col">
                <p className="col-head col-head-right" style={{ marginBottom: 16, fontFamily: HELVETICA, fontSize: 18, color: '#1a1a1a', textTransform: 'none' }}>
                  {ctxLang === 'id' ? 'Cara Membuat' : 'Method'}
                </p>
                {steps.length > 0 ? (
                  steps.map((step, i) => (
                    <Fragment key={i}>
                      {step.section && (
                        <div
                          className="method-section-heading"
                          style={{ fontFamily: HELVETICA, fontWeight: 700, fontSize: 14, color: '#333', marginTop: i > 0 ? 28 : 0, marginBottom: 6 }}
                        >
                          {step.section}
                        </div>
                      )}
                      <div className="method-step">
                        <div className="step-num" style={{ fontFamily: HELVETICA, color: '#cc0000' }}>{i + 1}</div>
                        <div className="step-text" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>{step.text}</div>
                      </div>
                    </Fragment>
                  ))
                ) : (
                  <p className="method-empty" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
                    {ctxLang === 'id'
                      ? 'Cara memasak untuk resep ini akan segera ditambahkan. Kami sedang mengumpulkannya dari Hertha.'
                      : 'The cooking method for this recipe is coming soon. We are working on collecting this from Hertha.'}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}