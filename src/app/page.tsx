'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RecipeImage from '@/components/RecipeImage';
import { useLang } from '@/components/LanguageContext';
import { meta, allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import type { Recipe, CategoryWithStats } from '@/types/recipe';

function recipeName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}
function recipeHeadnote(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.headnote_en || r.headnote_id) : r.headnote_id;
}

function CategoryCard({ cat, lang }: { cat: CategoryWithStats; lang: 'id' | 'en' }) {
  const name = lang === 'id' ? cat.name_id : cat.name_en;
  const [imgError, setImgError] = useState(false);
  const showPhoto = !!cat.photo && !imgError;

  return (
    <Link href={`/${cat.key}`} className="cat-card">
      {showPhoto ? (
        <>
          <img
            src={`/images/${cat.photo}`}
            alt={name}
            className={`cat-card-img lazy-img`}
            loading="lazy"
            onLoad={e => (e.currentTarget.className = 'cat-card-img lazy-img lazy-loaded')}
            onError={() => setImgError(true)}
          />
          <div className="cat-gradient" />
          <div className="cat-card-info">
            <div className="cat-card-name">{name}</div>
            <div className="cat-card-count">
              {cat.count} {lang === 'id' ? 'resep' : 'recipes'}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="cat-card-nophoto">
            <span className="cat-card-nophoto-name">{name}</span>
          </div>
          <div className="cat-card-info">
            <div className="cat-card-count" style={{ color: 'rgba(255,240,208,0.6)' }}>
              {cat.count} {lang === 'id' ? 'resep' : 'recipes'}
            </div>
          </div>
        </>
      )}
    </Link>
  );
}

function SearchResultCard({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = !!recipe.photo && !imgError;
  const name = recipeName(recipe, lang);
  const headnote = recipeHeadnote(recipe, lang);

  return (
    <Link href={`/recipe/${recipe.id}`} className="recipe-list-card">
      {showPhoto ? (
        <img
          src={`/images/${recipe.photo}`}
          alt={name}
          className="list-card-photo lazy-img"
          loading="lazy"
          onLoad={e => (e.currentTarget.className = 'list-card-photo lazy-img lazy-loaded')}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="list-card-nophoto">
          <span className="list-card-letter">{recipe.name_id.charAt(0)}</span>
        </div>
      )}
      <div className="list-card-body">
        <div className="list-card-name">{name}</div>
        {headnote && <div className="list-card-headnote">{headnote}</div>}
        {recipe.status === 'coming_soon' && (
          <span className="card-badge badge-soon" style={{ marginTop: 4 }}>
            {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
          </span>
        )}
        {recipe.status === 'needs_method' && (
          <span className="card-badge badge-parts" style={{ marginTop: 4 }}>
            {lang === 'id' ? 'Sebagian' : 'Partial'}
          </span>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { lang, toggle } = useLang();
  const [query, setQuery] = useState('');

  const categories = useMemo(() => getCategoriesWithStats(), []);

  const searchResults = useMemo((): Recipe[] | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allRecipes.filter(r =>
      r.name_id.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <Header />

      {/* ── Hero ── */}
      <div className="hero-wrap">
        <img
          src="/images/menu-cover.jpg"
          alt="Ramayani restaurant menu cover"
          className="hero-img lazy-img"
          loading="eager"
          onLoad={e => (e.currentTarget.className = 'hero-img lazy-img lazy-loaded')}
        />
      </div>

      {/* ── Language Toggle ── */}
      <div className="lang-toggle-section">
        <div className="lang-pill" role="group" aria-label="Language selection">
          <button
            className={`lang-seg${lang === 'id' ? ' active' : ''}`}
            onClick={() => lang !== 'id' && toggle()}
            aria-pressed={lang === 'id'}
          >
            Bahasa Indonesia
          </button>
          <button
            className={`lang-seg${lang === 'en' ? ' active' : ''}`}
            onClick={() => lang !== 'en' && toggle()}
            aria-pressed={lang === 'en'}
          >
            English
          </button>
        </div>
      </div>

      {/* ── Founder Quote ── */}
      <section className="founder-section">
        <div className="founder-inner">
          <span className="quote-mark" aria-hidden="true">&ldquo;</span>
          <p className="quote-text">
            {lang === 'id' ? meta.welcome_id : meta.welcome_en}
          </p>
          <p className="quote-attr">— {meta.founder} &middot; Ramayani, {meta.location}</p>
        </div>
      </section>

      {/* ── Search ── */}
      <div className="search-section">
        <div className="search-inner">
          <div className="search-wrap">
            <span className="search-icon-wrap" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              className="search-input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={
                lang === 'id'
                  ? 'Cari resep dalam Bahasa Indonesia atau English…'
                  : 'Search recipes in Indonesian or English…'
              }
              aria-label={lang === 'id' ? 'Cari resep' : 'Search recipes'}
            />
            {query && (
              <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
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

      {/* ── Main content ── */}
      <main>
        {searchResults !== null ? (
          <div>
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
                  <SearchResultCard key={r.id} recipe={r} lang={lang} />
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
                <CategoryCard key={cat.key} cat={cat} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-overlay" />
        <div className="footer-content">
          <p className="footer-logo">Ramayani</p>
          <p className="footer-est">est. 1983 &middot; {meta.location} &middot; Closed 2019</p>
          <p className="footer-founder">— {meta.founder}</p>
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Ramayani &middot; All rights reserved
          </p>
        </div>
      </footer>
    </>
  );
}
