'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LanguageContext';
import { allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import { storyMeta, storySections } from '@/lib/story';
import type { Recipe } from '@/types/recipe';
import type { StorySection, StoryClipping } from '@/types/story';

// ── recipe helpers ──────────────────────────────────────────────────────────

function rName(r: Recipe, lang: 'id' | 'en') {
  return lang === 'en' ? (r.name_en || r.name_id) : r.name_id;
}

function hasMethod(r: Recipe) {
  return r.method_id.length > 0 || r.method_en.length > 0;
}

type RowStatus = 'complete' | 'needs_method' | 'coming_soon';
function rowStatus(r: Recipe): RowStatus {
  if (r.status === 'coming_soon') return 'coming_soon';
  if (r.status === 'flagged') return 'complete';
  return hasMethod(r) ? 'complete' : 'needs_method';
}

function sortRecipes(recipes: Recipe[]): Recipe[] {
  const group = (r: Recipe) => r.status === 'coming_soon' ? 2 : hasMethod(r) ? 0 : 1;
  return [...recipes].sort((a, b) => {
    const d = group(a) - group(b);
    if (d !== 0) return d;
    return (a.name_en || a.name_id).localeCompare(b.name_en || b.name_id);
  });
}

// ── story helpers ────────────────────────────────────────────────────────────

function isPlaceholder(text: string) {
  return text.trim().startsWith('[');
}

function bodyParas(text: string): string[] {
  return text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
}

// ── story sub-components ─────────────────────────────────────────────────────

function SectionImage({ src, caption }: { src: string; caption: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return null;
  return (
    <div className="story-img-wrap">
      <img
        src={`/images/${src}`}
        alt={caption || ''}
        className="story-img img-fade"
        loading="lazy"
        onLoad={e => e.currentTarget.classList.add('loaded')}
        onError={() => setErr(true)}
      />
      {caption && <p className="story-caption">{caption}</p>}
    </div>
  );
}

function ClippingCard({ c }: { c: StoryClipping }) {
  const [err, setErr] = useState(false);
  return (
    <div className="press-card">
      {c.image && !err && (
        <img
          src={`/images/${c.image}`}
          alt={`${c.publication} ${c.year}`}
          className="press-clipping-img img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      )}
      <div>
        <p className="press-pub">{c.publication}</p>
        <p className="press-meta">
          {c.year}{c.author ? ` · ${c.author}` : ''}{c.column ? ` · ${c.column}` : ''}
        </p>
        {c.quote_en && <p className="press-quote">&ldquo;{c.quote_en}&rdquo;</p>}
      </div>
    </div>
  );
}

function StorySectionItem({ section, lang, first }: { section: StorySection; lang: 'id' | 'en'; first: boolean }) {
  const heading = lang === 'en' ? section.heading_en : section.heading_id;
  const body    = lang === 'en' ? section.body_en    : section.body_id;
  const caption = lang === 'en' ? (section.image_caption_en || '') : (section.image_caption_id || '');

  const hasImage  = !!(section.image && section.image.trim());
  const paras     = bodyParas(body);
  const realParas = paras.filter(p => !isPlaceholder(p));
  const allPlaceholder = realParas.length === 0;

  const bodyContent = (
    <div className="story-body">
      {allPlaceholder
        ? <p className="story-placeholder">Story coming soon — Hertha is telling us this one.</p>
        : realParas.map((p, i) => <p key={i}>{p}</p>)
      }
    </div>
  );

  return (
    <div className="story-section-item">
      {!first && <div className="story-between-rule" />}
      <div className="story-heading-row">
        <h2 className="story-heading">{heading}</h2>
        <div className="story-rule-line" aria-hidden="true" />
      </div>
      {hasImage ? (
        <div className="story-with-image">
          <SectionImage src={section.image!} caption={caption} />
          <div>{bodyContent}</div>
        </div>
      ) : (
        bodyContent
      )}
      {section.press_clippings && section.press_clippings.length > 0 && (
        <div className="press-grid">
          {section.press_clippings.map((c, i) => <ClippingCard key={i} c={c} />)}
        </div>
      )}
    </div>
  );
}

// ── recipe index sub-components ───────────────────────────────────────────────

function IndexRow({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [err, setErr] = useState(false);
  const name   = rName(recipe, lang);
  const status = rowStatus(recipe);
  const showThumb = !!recipe.photo && !err;

  return (
    <Link href={`/recipe/${recipe.id}`} className="index-row">
      {showThumb && (
        <img
          src={`/images/${recipe.photo}`}
          alt=""
          aria-hidden="true"
          className="index-thumb img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr(true)}
        />
      )}
      <div className="index-row-body">
        <span className="index-row-name">{name}</span>
        {status === 'needs_method' && (
          <span className="index-status index-status-needs">
            · {lang === 'id' ? 'Cara memasak segera hadir' : 'Method coming soon'}
          </span>
        )}
        {status === 'coming_soon' && (
          <span className="index-status index-status-soon">
            · {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
          </span>
        )}
      </div>
      <span className="index-chevron" aria-hidden="true">&#8250;</span>
    </Link>
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

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

  const categoriesWithRecipes = useMemo(
    () => cats.map(cat => ({
      cat,
      recipes: sortRecipes(allRecipes.filter(r => r.category === cat.key)),
    })).filter(({ recipes }) => recipes.length > 0),
    [cats]
  );

  const quoteText = lang === 'en' ? storyMeta.page_subtitle_en : storyMeta.page_subtitle_id;

  return (
    <>
      {/* A. Cover — full viewport, background image, no text */}
      <div className="cover" aria-hidden="true">
        <div className="cover-bg" />
        <div className="cover-overlay" />
      </div>
      <div className="cover-rule" />

      {/* B. Restaurant name + language toggle */}
      <div className="name-section">
        <h1 className="name-title">Ramayani</h1>
        <p className="name-subtitle">
          {lang === 'id'
            ? 'Koleksi Resep Restoran Ramayani'
            : 'The Ramayani Restaurant Recipe Collection'}
        </p>
        <p className="name-location">Los Angeles &middot; est. 1983</p>
        <div className="home-lang" role="group" aria-label="Language">
          <button className={`home-lang-btn${lang === 'id' ? ' active' : ''}`} onClick={setId}>
            ID
          </button>
          <span className="home-lang-sep" aria-hidden="true">|</span>
          <button className={`home-lang-btn${lang === 'en' ? ' active' : ''}`} onClick={setEn}>
            EN
          </button>
        </div>
      </div>

      {/* C. Founder quote — from story.json meta */}
      <div className="founder">
        <div className="founder-inner">
          <span className="founder-mark" aria-hidden="true">&ldquo;</span>
          <p className="founder-text">{quoteText}</p>
          <p className="founder-attr">
            &mdash;&nbsp;Hertha Tan, Founder &middot; Ramayani, Los Angeles &middot; est.&nbsp;1983
          </p>
        </div>
      </div>

      {/* D. Story sections — inline from story.json */}
      <div className="story-wrap">
        {storySections.map((section, i) => (
          <StorySectionItem key={section.id} section={section} lang={lang} first={i === 0} />
        ))}
      </div>

      {/* E. Search */}
      <div className="home-search">
        <div className="home-search-inner">
          <input
            className="home-search-input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari resep... / Search recipes...' : 'Cari resep... / Search recipes...'}
            aria-label={lang === 'id' ? 'Cari resep' : 'Search recipes'}
          />
          <span className="home-search-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          {query && (
            <button className="home-search-clear" onClick={() => setQuery('')} aria-label="Clear search">✕</button>
          )}
        </div>
        {searchResults !== null && (
          <p className="search-count" style={{ maxWidth: 600, margin: '10px auto 0', paddingLeft: 2 }}>
            {searchResults.length} {lang === 'id' ? 'resep ditemukan' : 'recipes found'}
          </p>
        )}
      </div>

      {/* F. Recipe index */}
      <main>
        {searchResults !== null ? (
          <div className="recipe-index">
            {searchResults.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">{lang === 'id' ? 'Tidak ada hasil' : 'No results'}</p>
              </div>
            ) : (
              sortRecipes(searchResults).map(r => <IndexRow key={r.id} recipe={r} lang={lang} />)
            )}
          </div>
        ) : (
          <div className="recipe-index">
            {categoriesWithRecipes.map(({ cat, recipes }) => (
              <div key={cat.key} id={cat.key} className="index-category">
                <div className="index-cat-head">
                  <h2 className="index-cat-title">
                    {lang === 'id' ? cat.name_id : cat.name_en}
                  </h2>
                  <div className="index-cat-rule" aria-hidden="true" />
                </div>
                {recipes.map(r => <IndexRow key={r.id} recipe={r} lang={lang} />)}
              </div>
            ))}
            {/* G-link. Write to Hertha */}
            <div className="write-link-row">
              <Link href="/write-to-hertha" className="write-link-text">
                {lang === 'id'
                  ? 'Sudah memasak salah satu hidangan ini? Tulis kepada Hertha →'
                  : 'Did you cook one of these dishes? Write to Hertha →'}
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* G. Footer */}
      <footer className="site-footer">
        <p className="footer-copy">
          &copy; Hertha Tan &middot; Ramayani &middot; Los Angeles
        </p>
      </footer>
    </>
  );
}
