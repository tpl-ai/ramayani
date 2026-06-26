'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, categories, meta } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function tx(r: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = r[`${field}_en` as keyof Recipe] as string;
    const id = r[`${field}_id` as keyof Recipe] as string;
    return en || id || '';
  }
  return (r[`${field}_id` as keyof Recipe] as string) || '';
}

function ingList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') {
    return r.ingredients_en.length ? r.ingredients_en : r.ingredients_id;
  }
  return r.ingredients_id.length ? r.ingredients_id : r.ingredients_en;
}

function methodList(r: Recipe, lang: 'id' | 'en'): string[] {
  if (lang === 'en') {
    return r.method_en.length ? r.method_en : r.method_id;
  }
  return r.method_id.length ? r.method_id : r.method_en;
}

function Crumb({
  catName,
  catKey,
  recipeName,
  lang,
}: {
  catName: string;
  catKey: string;
  recipeName: string;
  lang: 'id' | 'en';
}) {
  return (
    <p className="cat-page-crumb" style={{ marginBottom: 20 }}>
      <Link href="/">{lang === 'id' ? 'Beranda' : 'Home'}</Link>
      <span className="cat-page-crumb-sep">›</span>
      <Link href={`/${catKey}`}>{catName}</Link>
      <span className="cat-page-crumb-sep">›</span>
      {recipeName}
    </p>
  );
}

function PageFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-overlay" aria-hidden="true" />
      <div className="footer-content" style={{ padding: '48px 24px 56px' }}>
        <p className="footer-name">Ramayani</p>
        <p className="footer-est">est. 1983 &middot; {meta.location}</p>
      </div>
    </footer>
  );
}

function IngredientsLeft({
  items,
  lang,
}: {
  items: string[];
  lang: 'id' | 'en';
}) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="recipe-section-label">
        {lang === 'id' ? 'Bahan-bahan / Ingredients' : 'Ingredients / Bahan-Bahan'}
      </p>
      <ul className="ing-list">
        {items.map((item, i) => (
          <li key={i} className="ing-item">{item}</li>
        ))}
      </ul>
    </>
  );
}

function MethodRight({
  steps,
  lang,
}: {
  steps: string[];
  lang: 'id' | 'en';
}) {
  if (steps.length === 0) return null;
  return (
    <>
      <p className="recipe-section-label">
        {lang === 'id' ? 'Cara Membuat / Method' : 'Method / Cara Membuat'}
      </p>
      <div className="method-steps">
        {steps.map((step, i) => (
          <div key={i} className="method-step">
            <div className="step-num">{i + 1}</div>
            <div className="step-text">{step}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function RecipePage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { lang } = useLang();
  const [photoFailed, setPhotoFailed] = useState(false);

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <>
        <Header showBack />
        <div className="empty-state">
          <p className="empty-title">Recipe not found</p>
          <p className="empty-text">
            {lang === 'id' ? 'Resep tidak ditemukan.' : 'This recipe could not be found.'}
          </p>
        </div>
      </>
    );
  }

  const name       = tx(recipe, 'name', lang);
  const headnote   = tx(recipe, 'headnote', lang);
  const notes      = tx(recipe, 'notes', lang);
  const catInfo    = categories[recipe.category];
  const catName    = catInfo ? (lang === 'id' ? catInfo.id : catInfo.en) : recipe.category;
  const showPhoto  = !!recipe.photo && !photoFailed;
  const backHref   = `/${recipe.category}`;
  const ings       = ingList(recipe, lang);
  const steps      = methodList(recipe, lang);
  const hasContent = ings.length > 0 || steps.length > 0;

  /* ── Coming soon ── */
  if (recipe.status === 'coming_soon') {
    return (
      <>
        <Header showBack backHref={backHref} />
        <div className="recipe-container">
          <Crumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
          <div className="recipe-layout">
            <div className="recipe-left">
              {showPhoto && (
                <img
                  src={`/images/${recipe.photo}`}
                  alt={name}
                  className="recipe-photo img-fade"
                  loading="eager"
                  onLoad={e => e.currentTarget.classList.add('loaded')}
                  onError={() => setPhotoFailed(true)}
                />
              )}
              <h1 className={showPhoto ? 'recipe-title' : 'recipe-title-large'}>{name}</h1>
              {headnote && <p className="recipe-headnote">{headnote}</p>}
              <p className="coming-soon-line">
                {lang === 'id'
                  ? 'Resep lengkap untuk hidangan ini segera hadir.'
                  : 'The full recipe for this dish is coming soon.'}
              </p>
            </div>
          </div>
        </div>
        <PageFooter />
      </>
    );
  }

  /* ── Needs method ── */
  if (recipe.status === 'needs_method') {
    return (
      <>
        <Header showBack backHref={backHref} />
        <div className="recipe-container">
          <Crumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
          <div className="recipe-layout">
            {/* Left: photo + name + headnote + ingredients */}
            <div className="recipe-left">
              {showPhoto && (
                <img
                  src={`/images/${recipe.photo}`}
                  alt={name}
                  className="recipe-photo img-fade"
                  loading="eager"
                  onLoad={e => e.currentTarget.classList.add('loaded')}
                  onError={() => setPhotoFailed(true)}
                />
              )}
              <h1 className={showPhoto ? 'recipe-title' : 'recipe-title-large'}>{name}</h1>
              {headnote && <p className="recipe-headnote">{headnote}</p>}
              {ings.length > 0 && <hr className="recipe-rule" />}
              <IngredientsLeft items={ings} lang={lang} />
            </div>
            {/* Right: coming soon notice */}
            <div className="recipe-right">
              <p className="recipe-section-label">
                {lang === 'id' ? 'Cara Membuat / Method' : 'Method / Cara Membuat'}
              </p>
              <p className="needs-method-line">
                {lang === 'id'
                  ? 'Cara memasak untuk resep ini segera ditambahkan.'
                  : 'The cooking method for this recipe is coming soon.'}
              </p>
              {notes && (
                <div className="recipe-notes" style={{ marginTop: 40 }}>
                  <p className="recipe-notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
                  <p className="recipe-notes-text">{notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <PageFooter />
      </>
    );
  }

  /* ── Complete / flagged ── */
  return (
    <>
      <Header showBack backHref={backHref} />
      <div className="recipe-container">
        <Crumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
        <div className="recipe-layout">
          {/* Left column: photo + name + headnote + ingredients */}
          <div className="recipe-left">
            {showPhoto && (
              <img
                src={`/images/${recipe.photo}`}
                alt={name}
                className="recipe-photo img-fade"
                loading="eager"
                onLoad={e => e.currentTarget.classList.add('loaded')}
                onError={() => setPhotoFailed(true)}
              />
            )}
            <h1 className={showPhoto ? 'recipe-title' : 'recipe-title-large'}>{name}</h1>
            {headnote && <p className="recipe-headnote">{headnote}</p>}
            {ings.length > 0 && <hr className="recipe-rule" />}
            <IngredientsLeft items={ings} lang={lang} />
            {!hasContent && (
              <p className="partial-ingredients-note">
                {lang === 'id'
                  ? 'Resep lengkap akan segera ditambahkan.'
                  : 'The full recipe will be added soon.'}
              </p>
            )}
          </div>

          {/* Right column: method */}
          <div className="recipe-right">
            {steps.length > 0 ? (
              <MethodRight steps={steps} lang={lang} />
            ) : (
              <p className="partial-ingredients-note">
                {lang === 'id'
                  ? 'Cara memasak akan segera ditambahkan.'
                  : 'The cooking method will be added soon.'}
              </p>
            )}
            {notes && (
              <div className="recipe-notes">
                <p className="recipe-notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
                <p className="recipe-notes-text">{notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <PageFooter />
    </>
  );
}
