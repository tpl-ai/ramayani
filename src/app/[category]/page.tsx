'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import { useLang } from '@/components/LanguageContext';
import { categories, getRecipesByCategory, meta } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function rName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}

function RecipeRow({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [err, setErr] = useState(false);
  const name = rName(recipe, lang);
  const showThumb = !!recipe.photo && !err;

  return (
    <Link href={`/recipe/${recipe.id}`} className="recipe-row">
      {showThumb && (
        <img
          src={`/images/${recipe.photo}`}
          alt={name}
          className="row-thumb img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      )}
      <div className="row-info">
        <span className="row-name">{name}</span>
        {recipe.status === 'coming_soon' && (
          <span className="row-badge">
            {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
          </span>
        )}
      </div>
      <span className="row-chevron" aria-hidden="true">&#8250;</span>
    </Link>
  );
}

export default function CategoryPage() {
  const params = useParams();
  const catKey = Array.isArray(params.category) ? params.category[0] : params.category;
  const { lang } = useLang();

  const catInfo = categories[catKey];
  const recipes = getRecipesByCategory(catKey);

  if (!catInfo) {
    return (
      <>
        <Header showBack />
        <div className="empty-state">
          <p className="empty-title">Category not found</p>
        </div>
      </>
    );
  }

  const catName = lang === 'id' ? catInfo.id : catInfo.en;
  const subtitle = lang === 'id'
    ? `${recipes.length} resep dari dapur Ramayani`
    : `${recipes.length} recipes from the Ramayani kitchen`;

  return (
    <>
      <Header showBack backHref="/" />

      <div className="cat-page-head">
        <p className="cat-page-crumb">
          <Link href="/">{lang === 'id' ? 'Beranda' : 'Home'}</Link>
          <span className="cat-page-crumb-sep">›</span>
          {catName}
        </p>
        <h1 className="cat-page-title">{catName}</h1>
        <p className="cat-page-sub">{subtitle}</p>
        <div className="cat-page-rule" />
      </div>

      <main>
        {recipes.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">
              {lang === 'id' ? 'Belum ada resep' : 'No recipes yet'}
            </p>
          </div>
        ) : (
          <div className="recipe-list">
            {recipes.map(r => (
              <RecipeRow key={r.id} recipe={r} lang={lang} />
            ))}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-overlay" aria-hidden="true" />
        <div className="footer-content" style={{ padding: '48px 24px 56px' }}>
          <p className="footer-name">Ramayani</p>
          <p className="footer-est">est. 1983 &middot; {meta.location}</p>
        </div>
      </footer>
    </>
  );
}
