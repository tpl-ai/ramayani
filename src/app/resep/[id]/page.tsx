'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, meta } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

// ── helpers ───────────────────────────────────────────────────────

function tx(r: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = r[`${field}_en` as keyof Recipe] as string;
    return en || (r[`${field}_id` as keyof Recipe] as string) || '';
  }
  return (r[`${field}_id` as keyof Recipe] as string) || '';
}

function ingList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') return r.ingredients_en.length ? r.ingredients_en : r.ingredients_id;
  return r.ingredients_id.length ? r.ingredients_id : r.ingredients_en;
}

function methodList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') return r.method_en.length ? r.method_en : r.method_id;
  return r.method_id.length ? r.method_id : r.method_en;
}

function processIng(text: string, factor: number, imperial: boolean): string {
  let out = text;
  if (factor !== 1) {
    out = out.replace(/(?<!\d)(\d+(?:\.\d+)?)(?!\d)/g, (m) => {
      const n = parseFloat(m);
      if (!n) return m;
      const s = n * factor;
      return s === Math.round(s) ? String(Math.round(s)) : String(Math.round(s * 10) / 10);
    });
  }
  if (imperial) {
    out = out
      .replace(/(\d+(?:\.\d+)?)\s*kg\b/gi, (_, n) => `${Math.round(parseFloat(n) * 2.20462 * 10) / 10} lbs`)
      .replace(/(\d+(?:\.\d+)?)\s*g\b/gi,  (_, n) => `${Math.round(parseFloat(n) / 28.35 * 10) / 10} oz`)
      .replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, (_, n) => {
        const ml = parseFloat(n);
        if (ml >= 59) return `${Math.round(ml / 236.6 * 4) / 4} cups`;
        if (ml >= 15) return `${Math.round(ml / 14.79 * 2) / 2} tbsp`;
        return `${Math.round(ml / 4.93)} tsp`;
      })
      .replace(/(\d+(?:\.\d+)?)\s*liter/gi, (_, n) => `${Math.round(parseFloat(n) * 4.227 * 4) / 4} cups`);
  }
  return out;
}

// ── page ──────────────────────────────────────────────────────────

export default function ResepPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { lang, toggle } = useLang();

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
  const setId = () => { if (lang !== 'id') toggle(); };
  const setEn = () => { if (lang !== 'en') toggle(); };

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <div className="empty-state">
        <p className="empty-title">Recipe not found</p>
        <p className="empty-text">
          {lang === 'id' ? 'Resep tidak ditemukan.' : 'This recipe could not be found.'}
        </p>
        <Link href="/" style={{ color: '#e85d26', fontSize: 15, marginTop: 16, display: 'inline-block' }}>
          ← {lang === 'id' ? 'Kembali' : 'Back home'}
        </Link>
      </div>
    );
  }

  const recipeBase = typeof recipe.serves === 'number' ? recipe.serves : 4;
  if (baseServes.current === 4 && recipeBase !== 4) baseServes.current = recipeBase;

  const name      = tx(recipe, 'name', lang);
  const headnote  = tx(recipe, 'headnote', lang);
  const notes     = tx(recipe, 'notes', lang);
  const showPhoto = !!recipe.photo && !photoFailed;
  const ings      = ingList(recipe, lang);
  const steps     = methodList(recipe, lang);
  const factor    = serves / baseServes.current;
  const imperial  = unitSystem === 'imperial';
  const isComingSoon = recipe.status === 'coming_soon';
  const processedIngs = ings.map(i => processIng(i, factor, imperial));
  const servesDisplay = typeof recipe.serves === 'string' && recipe.serves.trim() ? recipe.serves : null;

  return (
    <>
      <nav className="recipe-topbar">
        <Link href="/" className="recipe-back">
          ← {lang === 'id' ? 'Kembali' : 'Back'}
        </Link>
        <div className="recipe-lang" role="group" aria-label="Language">
          <button className={`recipe-lang-btn${lang === 'id' ? ' active' : ''}`} onClick={setId}>ID</button>
          <span className="recipe-lang-sep" aria-hidden="true">|</span>
          <button className={`recipe-lang-btn${lang === 'en' ? ' active' : ''}`} onClick={setEn}>EN</button>
        </div>
      </nav>

      <div className="recipe-container">
        {isComingSoon ? (
          <div style={{ maxWidth: 560 }}>
            {showPhoto && (
              <img
                src={`/images/${recipe.photo}`}
                alt={name}
                className="recipe-photo-fixed img-fade"
                loading="eager"
                onLoad={e => e.currentTarget.classList.add('loaded')}
                onError={() => setPhotoFailed(true)}
              />
            )}
            <h1 className={`recipe-title${showPhoto ? '' : ' recipe-title-nophoto'}`}>{name}</h1>
            {headnote && <p className="recipe-headnote">{headnote}</p>}
            <p className="coming-soon-note">
              {lang === 'id' ? 'Resep segera hadir.' : 'Recipe coming soon.'}
            </p>
          </div>
        ) : (
          <>
            <div className="recipe-layout">
              {/* Left: photo + name + headnote + ingredients */}
              <div>
                {showPhoto && (
                  <img
                    src={`/images/${recipe.photo}`}
                    alt={name}
                    className="recipe-photo-fixed img-fade"
                    loading="eager"
                    onLoad={e => e.currentTarget.classList.add('loaded')}
                    onError={() => setPhotoFailed(true)}
                  />
                )}
                <h1 className={`recipe-title${showPhoto ? '' : ' recipe-title-nophoto'}`}>{name}</h1>
                {servesDisplay && (
                  <p className="recipe-meta">{lang === 'id' ? 'Porsi: ' : 'Serves: '}{servesDisplay}</p>
                )}
                {headnote && <p className="recipe-headnote">{headnote}</p>}
                <div className="recipe-rule" />

                <div className="col-heading-row">
                  <span className="col-head">
                    {lang === 'id' ? 'Bahan-Bahan' : 'Ingredients'}
                  </span>
                  <div className="unit-toggle" role="group" aria-label="Unit system">
                    <button className={`unit-btn${unitSystem === 'metric' ? ' active' : ''}`} onClick={() => setUnit('metric')}>
                      Metric
                    </button>
                    <span className="unit-sep" aria-hidden="true">|</span>
                    <button className={`unit-btn${unitSystem === 'imperial' ? ' active' : ''}`} onClick={() => setUnit('imperial')}>
                      Imperial
                    </button>
                  </div>
                </div>

                {typeof recipe.serves === 'number' && (
                  <div className="serves-row">
                    <span>{lang === 'id' ? 'Porsi:' : 'Serves:'}</span>
                    <button className="serves-btn" onClick={() => setServes(s => Math.max(1, s - 1))} disabled={serves <= 1} aria-label="Fewer servings">−</button>
                    <span className="serves-num">{serves}</span>
                    <button className="serves-btn" onClick={() => setServes(s => s + 1)} aria-label="More servings">+</button>
                  </div>
                )}

                {ings.length > 0 ? (
                  <ul className="ing-list">
                    {processedIngs.map((item, i) => (
                      <li key={i} className="ing-item">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ing-empty">
                    {lang === 'id' ? 'Bahan segera ditambahkan.' : 'Ingredients coming soon.'}
                  </p>
                )}
              </div>

              {/* Right: method */}
              <div>
                <p className="col-head col-head-right" style={{ marginBottom: 16 }}>
                  {lang === 'id' ? 'Cara Membuat' : 'Method'}
                </p>
                {steps.length > 0 ? (
                  steps.map((step, i) => (
                    <div key={i} className="method-step">
                      <div className="step-num">{i + 1}</div>
                      <div className="step-text">{step}</div>
                    </div>
                  ))
                ) : (
                  <p className="method-empty">
                    {lang === 'id'
                      ? 'Cara memasak untuk resep ini akan segera ditambahkan. Kami sedang mengumpulkannya dari Hertha.'
                      : 'The cooking method for this recipe is coming soon. We are working on collecting this from Hertha.'}
                  </p>
                )}
              </div>
            </div>

            {notes && (
              <div className="recipe-notes-full">
                <p className="recipe-notes-text">{notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="site-footer">
        <p className="footer-copy">&copy; Hertha Tan &middot; Ramayani &middot; Los Angeles</p>
      </footer>
    </>
  );
}
