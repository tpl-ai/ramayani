'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLang } from '@/components/LanguageContext';
import { categories, getRecipesByCategory } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function recipeName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}
function recipeHeadnote(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.headnote_en || r.headnote_id) : r.headnote_id;
}

function RecipeCard({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = !!recipe.photo && !imgError;
  const name = recipeName(recipe, lang);
  const headnote = recipeHeadnote(recipe, lang);

  return (
    <Link href={`/recipe/${recipe.id}`} className="recipe-card">
      {showPhoto ? (
        <div className="card-photo-wrap">
          <img
            src={`/images/${recipe.photo}`}
            alt={name}
            className="lazy-img"
            loading="lazy"
            onLoad={e => (e.currentTarget.className = 'lazy-img lazy-loaded')}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="card-no-photo">
          <span className="card-no-photo-letter">{recipe.name_id.charAt(0)}</span>
        </div>
      )}
      <div className="card-body">
        <div className="card-name">{name}</div>
        {headnote && <div className="card-headnote">{headnote}</div>}
        {recipe.status === 'coming_soon' && (
          <span className="card-badge badge-soon">
            {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
          </span>
        )}
        {recipe.status === 'needs_method' && (
          <span className="card-badge badge-parts">
            {lang === 'id' ? 'Sebagian' : 'Partial'}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const categoryKey = Array.isArray(params.category) ? params.category[0] : params.category;
  const { lang } = useLang();

  const categoryInfo = categories[categoryKey];
  const recipes = getRecipesByCategory(categoryKey);

  if (!categoryInfo) {
    return (
      <>
        <Header showBack />
        <div className="empty-state">
          <p className="empty-title">Category not found</p>
        </div>
      </>
    );
  }

  const catName = lang === 'id' ? categoryInfo.id : categoryInfo.en;

  return (
    <>
      <Header showBack backHref="/" />

      <div className="cat-page-header">
        <p className="cat-breadcrumb">
          <Link href="/">{lang === 'id' ? 'Beranda' : 'Home'}</Link>
          <span className="cat-breadcrumb-sep">›</span>
          {catName}
        </p>
        <h1 className="cat-page-name">{catName}</h1>
        <p className="cat-page-count">
          {recipes.length} {lang === 'id' ? 'resep' : 'recipes'}
        </p>
      </div>

      <main>
        {recipes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">
              {lang === 'id' ? 'Belum ada resep' : 'No recipes yet'}
            </p>
          </div>
        ) : (
          <div className="recipe-grid">
            {recipes.map(r => (
              <RecipeCard key={r.id} recipe={r} lang={lang} />
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-overlay" />
        <div className="footer-content" style={{ padding: '40px 20px 48px' }}>
          <p className="footer-logo" style={{ fontSize: 28 }}>Ramayani</p>
          <p className="footer-est">est. 1983 &middot; Los Angeles, California</p>
        </div>
      </footer>
    </>
  );
}
