'use client';

import { useState } from 'react';
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

function HeroWithPhoto({
  photo,
  name,
  headnote,
  catName,
  onImgError,
}: {
  photo: string;
  name: string;
  headnote: string;
  catName: string;
  onImgError: () => void;
}) {
  return (
    <div className="recipe-photo-wrap">
      <img
        src={`/images/${photo}`}
        alt={name}
        className="recipe-photo"
        onError={onImgError}
      />
      <div className="recipe-header-overlay">
        <p className="recipe-crumb">{catName}</p>
        <h1 className="recipe-photo-title">{name}</h1>
        {headnote && <p className="recipe-photo-headnote">{headnote}</p>}
      </div>
    </div>
  );
}

function HeroTextOnly({
  name,
  headnote,
  catName,
}: {
  name: string;
  headnote: string;
  catName: string;
}) {
  return (
    <div className="recipe-text-hero">
      <p className="recipe-text-crumb">{catName}</p>
      <h1 className="recipe-text-title">{name}</h1>
      {headnote && <blockquote className="recipe-text-quote">&ldquo;{headnote}&rdquo;</blockquote>}
    </div>
  );
}

function IngredientsSection({
  id: ings_id,
  en: ings_en,
  lang,
}: {
  id: string[];
  en: string[];
  lang: 'id' | 'en';
}) {
  const hasId = ings_id.length > 0;
  const hasEn = ings_en.length > 0;
  if (!hasId && !hasEn) return null;

  const maxLen = Math.max(ings_id.length, ings_en.length);

  return (
    <div className="body-section">
      <table className="ing-table">
        <thead>
          <tr>
            <th>Bahasa Indonesia</th>
            <th className="right">English</th>
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
    </div>
  );
}

function MethodSection({
  id: steps_id,
  en: steps_en,
}: {
  id: string[];
  en: string[];
}) {
  const hasId = steps_id.length > 0;
  const hasEn = steps_en.length > 0;
  if (!hasId && !hasEn) return null;

  const maxLen = Math.max(steps_id.length, steps_en.length);

  return (
    <div className="body-section">
      <div className="method-grid">
        <div className="method-col-head">Bahasa Indonesia</div>
        <div className="method-col-head right">English</div>
        {Array.from({ length: maxLen }, (_, i) => (
          <>
            <div key={`id-${i}`} className="method-step">
              <span className="step-num">{i + 1}.</span>
              <span className="step-text">{steps_id[i] ?? ''}</span>
            </div>
            <div key={`en-${i}`} className="method-step right">
              <span className="step-num">{i + 1}.</span>
              <span className="step-text">{steps_en[i] ?? ''}</span>
            </div>
          </>
        ))}
      </div>
    </div>
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

  const backHref = `/${recipe.category}`;

  // coming_soon: photo + headnote + banner only
  if (recipe.status === 'coming_soon') {
    return (
      <>
        <Header showBack backHref={backHref} />
        {showPhoto ? (
          <HeroWithPhoto
            photo={recipe.photo}
            name={name}
            headnote={headnote}
            catName={catName}
            onImgError={() => setPhotoFailed(true)}
          />
        ) : (
          <HeroTextOnly name={name} headnote={headnote} catName={catName} />
        )}
        <div className="coming-soon-banner">
          <p>
            {lang === 'id'
              ? '🍽️ Resep ini akan segera hadir — pantau terus!'
              : '🍽️ This recipe is coming soon — check back soon!'}
          </p>
        </div>
      </>
    );
  }

  // needs_method: photo, headnote, ingredients, no-method notice
  if (recipe.status === 'needs_method') {
    return (
      <>
        <Header showBack backHref={backHref} />
        {showPhoto ? (
          <HeroWithPhoto
            photo={recipe.photo}
            name={name}
            headnote={headnote}
            catName={catName}
            onImgError={() => setPhotoFailed(true)}
          />
        ) : (
          <HeroTextOnly name={name} headnote={headnote} catName={catName} />
        )}
        <div className="recipe-body">
          {(recipe.ingredients_id.length > 0 || recipe.ingredients_en.length > 0) && (
            <>
              <div className="body-heading">
                {lang === 'id' ? 'Bahan-bahan' : 'Ingredients'}
              </div>
              <IngredientsSection
                id={recipe.ingredients_id}
                en={recipe.ingredients_en}
                lang={lang}
              />
            </>
          )}
          <div className="needs-method-notice">
            <p>
              {lang === 'id'
                ? '✍️ Cara memasak akan segera ditambahkan. Pantau terus!'
                : '✍️ The cooking method will be added soon. Check back later!'}
            </p>
          </div>
          {notes && (
            <div className="notes-box">
              <p className="notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
              <p className="notes-text">{notes}</p>
            </div>
          )}
        </div>
      </>
    );
  }

  // complete / flagged: full recipe
  return (
    <>
      <Header showBack backHref={backHref} />
      {showPhoto ? (
        <HeroWithPhoto
          photo={recipe.photo}
          name={name}
          headnote={headnote}
          catName={catName}
          onImgError={() => setPhotoFailed(true)}
        />
      ) : (
        <HeroTextOnly name={name} headnote={headnote} catName={catName} />
      )}
      <div className="recipe-body">
        {(recipe.ingredients_id.length > 0 || recipe.ingredients_en.length > 0) && (
          <>
            <div className="body-heading">
              {lang === 'id' ? 'Bahan-bahan' : 'Ingredients'}
            </div>
            <IngredientsSection
              id={recipe.ingredients_id}
              en={recipe.ingredients_en}
              lang={lang}
            />
          </>
        )}
        {(recipe.method_id.length > 0 || recipe.method_en.length > 0) && (
          <>
            <div className="body-section body-heading">
              {lang === 'id' ? 'Cara Memasak' : 'Method'}
            </div>
            <MethodSection id={recipe.method_id} en={recipe.method_en} />
          </>
        )}
        {notes && (
          <div className="notes-box">
            <p className="notes-label">{lang === 'id' ? 'Catatan' : 'Notes'}</p>
            <p className="notes-text">{notes}</p>
          </div>
        )}
        {recipe.ingredients_id.length === 0 &&
          recipe.ingredients_en.length === 0 &&
          recipe.method_id.length === 0 &&
          recipe.method_en.length === 0 && (
            <div className="needs-method-notice" style={{ marginTop: 28 }}>
              <p>
                {lang === 'id'
                  ? '✍️ Resep lengkap akan segera ditambahkan. Pantau terus!'
                  : '✍️ The full recipe will be added soon. Check back later!'}
              </p>
            </div>
          )}
      </div>
    </>
  );
}
