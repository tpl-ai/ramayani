'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import RecipeImage from '@/components/RecipeImage';
import { useLang } from '@/components/LanguageContext';
import { categories, getRecipesByCategory } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function recipeName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}
function recipeHeadnote(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.headnote_en || r.headnote_id) : r.headnote_id;
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
        <p className="cat-page-name">{catName}</p>
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
          <div className="recipe-list wrap">
            {recipes.map(r => (
              <Link key={r.id} href={`/recipe/${r.id}`} className="recipe-card">
                <RecipeImage
                  photo={r.photo}
                  alt={recipeName(r, lang)}
                  className="card-photo"
                  fallback={
                    <div className="card-no-photo">
                      <span className="card-no-photo-letter">{r.name_id.charAt(0)}</span>
                    </div>
                  }
                />
                <div className="card-body">
                  <div className="card-name">{recipeName(r, lang)}</div>
                  {recipeHeadnote(r, lang) && (
                    <div className="card-headnote">{recipeHeadnote(r, lang)}</div>
                  )}
                  {r.status === 'coming_soon' && (
                    <span className="card-badge badge-soon">
                      {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
                    </span>
                  )}
                  {r.status === 'needs_method' && (
                    <span className="card-badge badge-parts">
                      {lang === 'id' ? 'Sebagian' : 'Partial'}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
