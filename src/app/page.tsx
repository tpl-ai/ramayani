'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LanguageContext';
import { meta, allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function rName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}

function IndexRow({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [err, setErr] = useState(false);
  const name = rName(recipe, lang);
  const showThumb = !!recipe.photo && !err;

  return (
    <Link href={`/recipe/${recipe.id}`} className="index-row">
      {showThumb ? (
        <img
          src={`/images/${recipe.photo}`}
          alt=""
          aria-hidden="true"
          className="index-thumb img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      ) : (
        <div style={{ width: 40, height: 40, flexShrink: 0 }} />
      )}
      <span className="index-row-name">{name}</span>
      {recipe.status === 'coming_soon' && (
        <span className="index-row-dot" aria-label="coming soon">·</span>
      )}
    </Link>
  );
}

export default function HomePage() {
  const { lang, toggle } = useLang();
  const [query, setQuery] = useState('');
  const cats = useMemo(() => getCategoriesWithStats(), []);

  const setId = () => { if (lang !== 'id') toggle(); };
  const setEn = () => { if (lang !== 'en') toggle(); };

  const searchResults = useMemo((): Recipe[] | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allRecipes.filter(
      r => r.name_id.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q)
    );
  }, [query]);

  const recipesByCategory = useMemo(
    () => cats.map(cat => ({ cat, recipes: allRecipes.filter(r => r.category === cat.key) })),
    [cats]
  );

  return (
    <>
      {/* Book cover */}
      <section className="cover">
        <div className="cover-img-wrap">
          <img
            src="/images/rijsttafel.jpg"
            alt="Ramayani rijsttafel"
            className="cover-img img-fade"
            loading="eager"
            onLoad={e => e.currentTarget.classList.add('loaded')}
          />
        </div>
        <h1 className="cover-title">Ramayani</h1>
        <p className="cover-subtitle">
          {lang === 'id' ? meta.subtitle_id : meta.subtitle_en}
        </p>
        <p className="cover-location">
          {meta.location}&nbsp;&middot;&nbsp;{meta.restaurant_years}
        </p>
        <div className="cover-lang" role="group" aria-label="Language">
          <button className={`cover-lang-btn${lang === 'id' ? ' active' : ''}`} onClick={setId}>
            Bahasa Indonesia
          </button>
          <span className="cover-lang-sep" aria-hidden="true">|</span>
          <button className={`cover-lang-btn${lang === 'en' ? ' active' : ''}`} onClick={setEn}>
            English
          </button>
        </div>
      </section>

      {/* Search */}
      <div className="index-search">
        <div className="index-search-inner">
          <input
            className="index-search-input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari resep…' : 'Search recipes…'}
            aria-label={lang === 'id' ? 'Cari resep' : 'Search recipes'}
          />
          <span className="index-search-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {query && (
            <button className="index-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Recipe index */}
      <main>
        {searchResults !== null ? (
          <>
            <p className="search-results-count">
              {searchResults.length} {lang === 'id' ? 'resep ditemukan' : 'recipes found'}
            </p>
            <div className="index-body">
              {searchResults.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-title">
                    {lang === 'id' ? 'Tidak ada hasil' : 'No results'}
                  </p>
                </div>
              ) : (
                searchResults.map(r => <IndexRow key={r.id} recipe={r} lang={lang} />)
              )}
            </div>
          </>
        ) : (
          <div className="index-body">
            {recipesByCategory.map(({ cat, recipes }) =>
              recipes.length === 0 ? null : (
                <div key={cat.key} id={cat.key} className="index-category">
                  <div className="index-cat-head">
                    <h2 className="index-cat-title">
                      {lang === 'id' ? cat.name_id : cat.name_en}
                    </h2>
                    <div className="index-cat-rule" aria-hidden="true" />
                  </div>
                  {recipes.map(r => <IndexRow key={r.id} recipe={r} lang={lang} />)}
                </div>
              )
            )}
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p className="footer-name">Ramayani</p>
        <p className="footer-est">est. 1983 &middot; {meta.location}</p>
      </footer>
    </>
  );
}
