'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLang } from '@/components/LanguageContext';
import { getRecipeById, categories } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function t(r: Recipe, field: 'name' | 'headnote' | 'notes', lang: 'id' | 'en'): string {
  if (lang === 'en') {
    const en = r[`${field}_en` as keyof Recipe] as string;
    const id = r[`${field}_id` as keyof Recipe] as string;
    return en || id || '';
  }
  return (r[`${field}_id` as keyof Recipe] as string) || '';
}

function RecipeBreadcrumb({
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
    <p className="recipe-crumb">
      <Link href="/">{lang === 'id' ? 'Beranda' : 'Home'}</Link>
      <span className="recipe-crumb-sep">›</span>
      <Link href={`/${catKey}`}>{catName}</Link>
      <span className="recipe-crumb-sep">›</span>
      {recipeName}
    </p>
  );
}

function HeroWithPhoto({
  photo,
  alt,
  onError,
}: {
  photo: string;
  alt: string;
  onError: () => void;
}) {
  return (
    <div className="recipe-hero-photo">
      <img
        src={`/images/${photo}`}
        alt={alt}
        className="lazy-img"
        loading="eager"
        onLoad={e => (e.currentTarget.className = 'lazy-img lazy-loaded')}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
    </div>
  );
}

function HeroTextOnly({
  name,
  headnote,
  catName,
  catKey,
  lang,
}: {
  name: string;
  headnote: string;
  catName: string;
  catKey: string;
  lang: 'id' | 'en';
}) {
  return (
    <div className="recipe-hero-text">
      <p className="recipe-hero-crumb">
        <Link href={`/${catKey}`} style={{ color: 'rgba(255,240,208,0.65)' }}>
          {catName}
        </Link>
      </p>
      <h1 className="recipe-hero-title-large">{name}</h1>
      {headnote && (
        <>
          <div className="recipe-hero-rule" />
          <blockquote className="recipe-hero-quote">&ldquo;{headnote}&rdquo;</blockquote>
        </>
      )}
    </div>
  );
}

function IngredientsSection({ id: ings_id, en: ings_en, lang }: { id: string[]; en: string[]; lang: 'id' | 'en' }) {
  const hasId = ings_id.length > 0;
  const hasEn = ings_en.length > 0;
  if (!hasId && !hasEn) return null;
  const maxLen = Math.max(ings_id.length, ings_en.length);

  return (
    <>
      <p className="body-heading">{lang === 'id' ? 'Bahan-bahan' : 'Ingredients'}</p>
      <table className="ing-table">
        <thead>
          <tr>
            <th>Bahasa Indonesia</th>
            <th>English</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxLen }, (_, i) => (
            <tr key={i}>
              <td>{ings_id[i] ?? ''}</td>
              <td className="right">{ings_en[i] ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function MethodSection({ id: steps_id, en: steps_en, lang }: { id: string[]; en: string[]; lang: 'id' | 'en' }) {
  const hasId = steps_id.length > 0;
  const hasEn = steps_en.length > 0;
  if (!hasId && !hasEn) return null;
  const maxLen = Math.max(steps_id.length, steps_en.length);

  return (
    <>
      <p className="body-heading">{lang === 'id' ? 'Cara Memasak' : 'Method'}</p>
      <div className="method-steps">
        {Array.from({ length: maxLen }, (_, i) => (
          <div key={i} className="method-step">
            <span className="step-num">{i + 1}</span>
            <div className="step-content">
              {steps_id[i] && <p className="step-id">{steps_id[i]}</p>}
              {steps_en[i] && <p className="step-en">{steps_en[i]}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PageFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-overlay" />
      <div className="footer-content" style={{ padding: '40px 20px 48px' }}>
        <p className="footer-logo" style={{ fontSize: 28 }}>Ramayani</p>
        <p className="footer-est">est. 1983 &middot; Los Angeles, California</p>
      </div>
    </footer>
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

  const name     = t(recipe, 'name', lang);
  const headnote = t(recipe, 'headnote', lang);
  const notes    = t(recipe, 'notes', lang);
  const catInfo  = categories[recipe.category];
  const catName  = catInfo ? (lang === 'id' ? catInfo.id : catInfo.en) : recipe.category;
  const showPhoto = !!recipe.photo && !photoFailed;
  const backHref  = `/${recipe.category}`;

  const hasIngredients = recipe.ingredients_id.length > 0 || recipe.ingredients_en.length > 0;
  const hasMethod      = recipe.method_id.length > 0 || recipe.method_en.length > 0;

  /* ── Coming soon ── */
  if (recipe.status === 'coming_soon') {
    return (
      <>
        <Header showBack backHref={backHref} />
        {showPhoto ? (
          <HeroWithPhoto photo={recipe.photo} alt={name} onError={() => setPhotoFailed(true)} />
        ) : (
          <HeroTextOnly name={name} headnote={headnote} catName={catName} catKey={recipe.category} lang={lang} />
        )}
        {showPhoto && headnote && (
          <div className="recipe-info">
            <RecipeBreadcrumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
            <h1 className="recipe-title">{name}</h1>
            <p className="recipe-headnote">{headnote}</p>
            <hr className="recipe-rule" />
          </div>
        )}
        <div className="coming-soon-ribbon">
          <p>
            {lang === 'id'
              ? 'Resep ini segera hadir — kami masih menyempurnakannya.'
              : 'Recipe coming soon — we are still perfecting this one.'}
          </p>
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
        {showPhoto ? (
          <HeroWithPhoto photo={recipe.photo} alt={name} onError={() => setPhotoFailed(true)} />
        ) : (
          <HeroTextOnly name={name} headnote={headnote} catName={catName} catKey={recipe.category} lang={lang} />
        )}
        <div className="recipe-info">
          <RecipeBreadcrumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
          <h1 className="recipe-title">{name}</h1>
          {headnote && <p className="recipe-headnote">{headnote}</p>}
          <hr className="recipe-rule" />
        </div>
        <div className="recipe-body">
          {hasIngredients && (
            <IngredientsSection
              id={recipe.ingredients_id}
              en={recipe.ingredients_en}
              lang={lang}
            />
          )}
          <div className="needs-method-notice">
            <p>
              {lang === 'id'
                ? 'Cara memasak untuk resep ini akan segera ditambahkan.'
                : 'The cooking method for this recipe is coming soon.'}
            </p>
          </div>
          {notes && (
            <div className="notes-box">
              <p className="notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
              <p className="notes-text">{notes}</p>
            </div>
          )}
        </div>
        <PageFooter />
      </>
    );
  }

  /* ── Complete / flagged ── */
  return (
    <>
      <Header showBack backHref={backHref} />
      {showPhoto ? (
        <HeroWithPhoto photo={recipe.photo} alt={name} onError={() => setPhotoFailed(true)} />
      ) : (
        <HeroTextOnly name={name} headnote={headnote} catName={catName} catKey={recipe.category} lang={lang} />
      )}
      <div className="recipe-info">
        <RecipeBreadcrumb catName={catName} catKey={recipe.category} recipeName={name} lang={lang} />
        <h1 className="recipe-title">{name}</h1>
        {headnote && <p className="recipe-headnote">{headnote}</p>}
        <hr className="recipe-rule" />
      </div>
      <div className="recipe-body">
        {hasIngredients && (
          <IngredientsSection
            id={recipe.ingredients_id}
            en={recipe.ingredients_en}
            lang={lang}
          />
        )}
        {hasMethod && (
          <MethodSection
            id={recipe.method_id}
            en={recipe.method_en}
            lang={lang}
          />
        )}
        {!hasIngredients && !hasMethod && (
          <div className="empty-notice">
            <p>
              {lang === 'id'
                ? 'Resep lengkap akan segera ditambahkan. Pantau terus!'
                : 'The full recipe will be added soon. Check back later!'}
            </p>
          </div>
        )}
        {notes && (
          <div className="notes-box">
            <p className="notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
            <p className="notes-text">{notes}</p>
          </div>
        )}
      </div>
      <PageFooter />
    </>
  );
}
