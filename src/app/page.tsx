'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RecipeImage from '@/components/RecipeImage';
import { useLang } from '@/components/LanguageContext';
import { meta, allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

const CAT_EMOJI: Record<string, string> = {
  ayam:          '🍗',
  seafood:       '🦐',
  daging:        '🥩',
  sambal_saus:   '🌶️',
  nasi_mie:      '🍜',
  sayuran_salad: '🥗',
  appetizer:     '🥟',
  desserts:      '🍮',
  bumbu_dasar:   '🫙',
  other:         '🍽️',
  drinks:        '🥤',
  desserts_drinks:'🧊',
};

function recipeName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}
function recipeHeadnote(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.headnote_en || r.headnote_id) : r.headnote_id;
}

function RecipeCardThumbnail({ photo, name }: { photo: string; name: string }) {
  return (
    <RecipeImage
      photo={photo}
      alt={name}
      className="card-photo"
      fallback={
        <div className="card-no-photo">
          <span className="card-no-photo-letter">{name.charAt(0)}</span>
        </div>
      }
    />
  );
}

function CategoryThumbnail({ photo, name, emoji }: { photo: string; name: string; emoji: string }) {
  return (
    <RecipeImage
      photo={photo}
      alt={name}
      className="cat-photo"
      fallback={<div className="cat-photo-placeholder">{emoji}</div>}
    />
  );
}

export default function HomePage() {
  const { lang } = useLang();
  const [query, setQuery] = useState('');

  const categories = useMemo(() => getCategoriesWithStats(), []);

  const searchResults = useMemo((): Recipe[] | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allRecipes.filter(r => {
      return r.name_id.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q);
    });
  }, [query]);

  return (
    <>
      <Header />

      <div className="home-hero">
        <h1 className="hero-title">Ramayani</h1>
        <p className="hero-subtitle">
          {lang === 'id' ? meta.subtitle_id : meta.subtitle_en}
        </p>
        <p className="hero-welcome">
          {lang === 'id' ? meta.welcome_id : meta.welcome_en}
        </p>
        <p className="hero-attribution">— {meta.founder}</p>
      </div>

      <div className="search-bar">
        <div className="search-bar-inner">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari resep…' : 'Search recipes…'}
              aria-label={lang === 'id' ? 'Cari resep' : 'Search recipes'}
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear">
                ✕
              </button>
            )}
          </div>
          {searchResults !== null && (
            <p className="search-count">
              {searchResults.length}{' '}
              {lang === 'id' ? 'resep ditemukan' : 'recipes found'}
            </p>
          )}
        </div>
      </div>

      <main>
        {searchResults !== null ? (
          <div className="wrap">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">
                  {lang === 'id' ? 'Tidak ditemukan' : 'No results'}
                </p>
                <p className="empty-text">
                  {lang === 'id'
                    ? `Tidak ada resep untuk "${query}"`
                    : `No recipes found for "${query}"`}
                </p>
              </div>
            ) : (
              <div className="recipe-list">
                {searchResults.map(r => (
                  <Link key={r.id} href={`/recipe/${r.id}`} className="recipe-card">
                    <RecipeCardThumbnail photo={r.photo} name={r.name_id} />
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
          </div>
        ) : (
          <div className="section">
            <p className="section-label wrap">
              {lang === 'id' ? 'Kategori' : 'Categories'}
            </p>
            <div className="cat-grid wrap">
              {categories.map(cat => (
                <Link key={cat.key} href={`/${cat.key}`} className="cat-card">
                  <CategoryThumbnail
                    photo={cat.photo}
                    name={cat.name_id}
                    emoji={CAT_EMOJI[cat.key] || '🍽️'}
                  />
                  <div className="cat-info">
                    <div className="cat-name">
                      {lang === 'id' ? cat.name_id : cat.name_en}
                    </div>
                    <div className="cat-count">
                      {cat.count} {lang === 'id' ? 'resep' : 'recipes'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p className="footer-name">Ramayani</p>
        <p className="footer-meta">
          {meta.restaurant_years} &middot; {meta.location}
        </p>
      </footer>
    </>
  );
}
