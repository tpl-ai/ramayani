'use client';

import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, meta, difficultyLevels, recipePhotoSrc } from '@/lib/recipes';
import { displayQuantity } from '@/lib/units';
import type { Recipe, IngredientLine } from '@/types/recipe';
import Header from '@/components/Header';

const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif';
const FACT_ICON = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: '#cc0000', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

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

function ingList(r: Recipe, lang: 'id' | 'en'): IngredientLine[] {
  if (lang === 'en') return r.ingredients_en.length ? r.ingredients_en : r.ingredients_id;
  return r.ingredients_id.length ? r.ingredients_id : r.ingredients_en;
}

function methodList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') return r.method_en.length ? r.method_en : r.method_id;
  return r.method_id.length ? r.method_id : r.method_en;
}

function formatIngredient(item: IngredientLine, factor: number, unitSystem: 'metric' | 'imperial'): string {
  const { amount, unit } = displayQuantity(item.amount, item.unit, factor, unitSystem);
  return [amount, unit, item.name].filter(Boolean).join(' ');
}

// ── page ──────────────────────────────────────────────────────────

export default function ResepPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { lang: ctxLang } = useLang();
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');

  const [photoFailed, setPhotoFailed] = useState(false);
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [serves, setServes] = useState(4);
  const baseServes = useRef(4);

  useEffect(() => {
    if (localStorage.getItem('ramayani_units') === 'imperial') setUnitSystem('imperial');
  }, []);

  const setUnit = (u: 'metric' | 'imperial') => {
    setUnitSystem(u);
    localStorage.setItem('ramayani_units', u);
  };

  const recipe = getRecipeById(id);

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

  const recipeBase = typeof recipe.serves === 'number' ? recipe.serves : 4;
  if (baseServes.current === 4 && recipeBase !== 4) baseServes.current = recipeBase;

  const name      = tx(recipe, 'name', ctxLang);
  const headnote  = tx(recipe, 'headnote', ctxLang);
  const notes     = tx(recipe, 'notes', ctxLang);
  const showPhoto = !!recipe.photo && !photoFailed;
  const ings      = ingList(recipe, ctxLang);
  const steps     = methodList(recipe, ctxLang);
  const factor    = serves / baseServes.current;
  const isComingSoon = recipe.content_state === 'no_content';
  const processedIngs = ings.map(i => formatIngredient(i, factor, unitSystem));
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

                {typeof recipe.serves === 'number' && (
                  <div className="serves-row" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>
                    <span>{ctxLang === 'id' ? 'Porsi:' : 'Serves:'}</span>
                    <button
                      className="serves-btn"
                      onClick={() => setServes(s => Math.max(1, s - 1))}
                      disabled={serves <= 1}
                      aria-label="Fewer servings"
                      style={{ fontFamily: HELVETICA }}
                      onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.borderColor = '#cc0000'; e.currentTarget.style.color = '#cc0000'; } }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; }}
                    >
                      −
                    </button>
                    <span className="serves-num">{serves}</span>
                    <button
                      className="serves-btn"
                      onClick={() => setServes(s => s + 1)}
                      aria-label="More servings"
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
                    {processedIngs.map((item, i) => (
                      <li key={i} className="ing-item" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>{item}</li>
                    ))}
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
                    <div key={i} className="method-step">
                      <div className="step-num" style={{ fontFamily: HELVETICA, color: '#cc0000' }}>{i + 1}</div>
                      <div className="step-text" style={{ fontFamily: HELVETICA, color: '#1a1a1a' }}>{step}</div>
                    </div>
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