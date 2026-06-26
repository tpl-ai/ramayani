'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RecipeImage from '@/components/RecipeImage';
import { useLang } from '@/components/LanguageContext';
import { meta, allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import type { Recipe, CategoryWithStats } from '@/types/recipe';

function rName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}
function rHead(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.headnote_en || r.headnote_id) : r.headnote_id;
}

function CatCard({ cat, lang }: { cat: CategoryWithStats; lang: 'id' | 'en' }) {
  const name = lang === 'id' ? cat.name_id : cat.name_en;
  const [err, setErr] = useState(false);

  return (
    <Link href={`/${cat.key}`} className="cat-card">
      {cat.photo && !err ? (
        <img
          src={`/images/${cat.photo}`}
          alt={name}
          className="cat-photo img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      ) : (
        <div className="cat-nophoto">
          <span className="cat-nophoto-name">{name}</span>
        </div>
      )}
      <div className="cat-info">
        <div className="cat-name">{name}</div>
        <div className="cat-count">
          {cat.count} {lang === 'id' ? 'resep' : 'recipes'}
        </div>
      </div>
    </Link>
  );
}

function SearchRow({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const name = rName(recipe, lang);
  const [err, setErr] = useState(false);
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

export default function HomePage() {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const categories = useMemo(() => getCategoriesWithStats(), []);

  const searchResults = useMemo((): Recipe[] | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allRecipes.filter(
      r => r.name_id.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q)
    );
  }, [query]);

  const welcomeText = lang === 'id' ? meta.welcome_id : meta.welcome_en;

  return (
    <>
      <Header />

      {/* Hero */}
      <div className="hero">
        <img
          src="/images/menu-cover.jpg"
          alt="Ramayani restaurant menu cover"
          className="hero-img"
          loading="eager"
        />
        <div className="hero-overlay" aria-hidden="true" />
      </div>
      <div className="hero-rule" />

      {/* Founder quote */}
      <section className="founder">
        <div className="founder-inner">
          <span className="founder-mark" aria-hidden="true">&ldquo;</span>
          <p className="founder-text">{welcomeText}</p>
          <p className="founder-attr">
            &mdash;&nbsp;HERTHA TAN, FOUNDER &middot; RAMAYANI, LOS ANGELES &middot; EST.&nbsp;1983
          </p>
        </div>
      </section>

      {/* Search */}
      <div className="search-section">
        <div className="search-inner">
          <div className="search-wrap">
            <input
              className="search-input"
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={lang === 'id' ? 'Cari resep…' : 'Search recipes…'}
              aria-label={lang === 'id' ? 'Cari resep' : 'Search recipes'}
            />
            <span className="search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
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

      {/* Main content */}
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
              <div className="recipe-list" style={{ paddingTop: 24 }}>
                {searchResults.map(r => (
                  <SearchRow key={r.id} recipe={r} lang={lang} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="section-head">
              <h2 className="section-head-title">
                {lang === 'id' ? 'Resep Kami' : 'Our Recipes'}
              </h2>
              <div className="section-head-rule" aria-hidden="true" />
            </div>
            <div className="cat-grid">
              {categories.map(cat => (
                <CatCard key={cat.key} cat={cat} lang={lang} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-overlay" aria-hidden="true" />
        <div className="footer-content">
          <p className="footer-name">Ramayani</p>
          <p className="footer-est">est. 1983 &middot; Los Angeles, California &middot; Closed 2019</p>
          <p className="footer-founder">Original recipes by Hertha Tan</p>
          <div className="footer-rule" aria-hidden="true" />
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} Ramayani. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
