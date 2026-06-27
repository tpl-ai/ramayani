'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLang } from '@/components/LanguageContext';
import { allRecipes, getCategoriesWithStats } from '@/lib/recipes';
import { storyMeta, storySections } from '@/lib/story';
import type { Recipe } from '@/types/recipe';
import type { StorySection, PressItem } from '@/types/story';

// ── recipe helpers ─────────────────────────────────────────────────

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

// ── story helpers ──────────────────────────────────────────────────

function bodyParas(text: string): string[] {
  return text.split(/\n\n+/).map(p => p.trim()).filter(p => p && !p.startsWith('['));
}

// ── sub-components ─────────────────────────────────────────────────

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

function PressItemCard({ item, lang }: { item: PressItem; lang: 'id' | 'en' }) {
  const [err1, setErr1] = useState(false);
  const [err2, setErr2] = useState(false);
  const note = lang === 'en' ? (item.note_en ?? null) : (item.note_id ?? null);
  return (
    <div className="press-card">
      {item.image && !err1 && (
        <img
          src={`/images/${item.image}`}
          alt={`${item.publication} ${item.year}`}
          className="press-clipping-img img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr1(true)}
        />
      )}
      {item.image2 && !err2 && (
        <img
          src={`/images/${item.image2}`}
          alt={`${item.publication} ${item.year} (2)`}
          className="press-clipping-img img-fade"
          loading="lazy"
          onLoad={e => e.currentTarget.classList.add('loaded')}
          onError={() => setErr2(true)}
          style={{ marginTop: 8 }}
        />
      )}
      <p className="press-pub">
        {item.publication} <span className="press-meta">&middot; {item.year}</span>
      </p>
      {note && <p className="press-note">{note}</p>}
    </div>
  );
}

function StorySectionBlock({
  section,
  lang,
  isFirst,
}: {
  section: StorySection;
  lang: 'id' | 'en';
  isFirst: boolean;
}) {
  const title = lang === 'en' ? (section.title_en || '') : (section.title_id || '');
  const caption = lang === 'en'
    ? (section.image_caption_en || '')
    : (section.image_caption_id || '');

  if (section.type === 'press') {
    return (
      <div className="story-section-item">
        {!isFirst && <div className="story-between-rule" />}
        {title && (
          <div className="story-heading-row">
            <h2 className="story-heading">{title}</h2>
            <div className="story-rule-line" aria-hidden="true" />
          </div>
        )}
        <div className="press-grid">
          {(section.items || []).map((item, i) => (
            <PressItemCard key={i} item={item} lang={lang} />
          ))}
        </div>
      </div>
    );
  }

  const body = lang === 'en' ? (section.body_en || '') : (section.body_id || '');
  const paras = bodyParas(body);
  const hasImage = typeof section.image === 'string' && section.image.length > 0;

  const bodyContent = (
    <div className="story-body">
      {paras.length === 0
        ? <p className="story-placeholder">Story coming soon — Hertha is telling us this one.</p>
        : paras.map((p, i) => <p key={i}>{p}</p>)
      }
    </div>
  );

  return (
    <div className="story-section-item">
      {!isFirst && <div className="story-between-rule" />}
      {title && (
        <div className="story-heading-row">
          <h2 className="story-heading">{title}</h2>
          <div className="story-rule-line" aria-hidden="true" />
        </div>
      )}
      {hasImage ? (
        <div className="story-with-image">
          <SectionImage src={section.image!} caption={caption} />
          <div>{bodyContent}</div>
        </div>
      ) : bodyContent}
    </div>
  );
}

function StatusDot({ status }: { status: RowStatus }) {
  const base: React.CSSProperties = {
    display: 'inline-block',
    width: 7,
    height: 7,
    flexShrink: 0,
    marginRight: 10,
  };
  if (status === 'complete') {
    return <span style={{ ...base, borderRadius: '50%', background: '#7a1515' }} />;
  }
  if (status === 'needs_method') {
    return <span style={{ ...base, borderRadius: '50%', border: '1.5px solid #e8a020', background: 'transparent' }} />;
  }
  return <span style={{ ...base, width: 17 }} />;
}

function IndexRow({ recipe, lang }: { recipe: Recipe; lang: 'id' | 'en' }) {
  const [err, setErr] = useState(false);
  const name = rName(recipe, lang);
  const status = rowStatus(recipe);
  const showThumb = !!recipe.photo && !err;
  const isActive = status !== 'coming_soon';

  const inner = (
    <>
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
      <StatusDot status={status} />
      <span className="index-row-name" style={status === 'coming_soon' ? { color: '#aaaaaa' } : {}}>
        {name}
      </span>
      {isActive && <span className="index-chevron" aria-hidden="true">&#8250;</span>}
    </>
  );

  if (!isActive) {
    return <div className="index-row index-row-inactive">{inner}</div>;
  }

  return (
    <Link href={`/recipe/${recipe.id}`} className="index-row">
      {inner}
    </Link>
  );
}

// ── category ordering ──────────────────────────────────────────────

const CATEGORY_ORDER = [
  'ayam', 'daging', 'seafood', 'nasi_mie', 'sayuran_salad', 'sambal_saus',
  'appetizer', 'desserts', 'bumbu_dasar', 'other', 'desserts_drinks', 'drinks',
];

// ── main ───────────────────────────────────────────────────────────

export default function HomePage() {
  const { lang, toggle } = useLang();
  const [query, setQuery] = useState('');
  const cats = useMemo(() => getCategoriesWithStats(), []);

  const searchResults = useMemo((): Recipe[] | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return allRecipes.filter(
      r => r.name_id.toLowerCase().includes(q) || r.name_en.toLowerCase().includes(q)
    );
  }, [query]);

  const { pageBlocks, beforeSections, afterSections } = useMemo(() => {
    const catMap = new Map(cats.map(c => [c.key, c]));
    const ordered: typeof cats = [];
    for (const key of CATEGORY_ORDER) {
      if (catMap.has(key)) ordered.push(catMap.get(key)!);
    }
    for (const c of cats) {
      if (!ordered.find(o => o.key === c.key)) ordered.push(c);
    }

    const catsWithRecipes = ordered
      .map(cat => ({
        cat,
        recipes: sortRecipes(allRecipes.filter(r => r.category === cat.key)),
      }))
      .filter(({ recipes }) => recipes.length > 0);

    const beforeSections = storySections.filter(s => s.position === 'before_recipes');
    const afterSections  = storySections.filter(s => s.position === 'after_recipes');
    const betweenMap = new Map(
      storySections
        .filter(s => s.position === 'between_categories' && s.after_category)
        .map(s => [s.after_category!, s])
    );

    type Block =
      | { kind: 'category'; cat: (typeof cats)[0]; recipes: Recipe[] }
      | { kind: 'story'; section: StorySection };

    const pageBlocks: Block[] = [];
    for (const { cat, recipes } of catsWithRecipes) {
      pageBlocks.push({ kind: 'category', cat, recipes });
      const between = betweenMap.get(cat.key);
      if (between) pageBlocks.push({ kind: 'story', section: between });
    }

    return { pageBlocks, beforeSections, afterSections };
  }, [cats]);

  return (
    <>
      {/* ── COOKBOOK OPENING ─────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 48px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888888', marginBottom: 24 }}>
          {lang === 'id' ? 'Resep-Resep Ibu' : "My Mother's Recipes"}
        </p>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 400, color: '#7a1515', letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: 1, marginBottom: 20 }}>
          RAMAYANI
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: '#1c1c1c', marginBottom: 8 }}>
          {lang === 'id' ? storyMeta.subtitle_id : storyMeta.subtitle_en}
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 13, color: '#888888', letterSpacing: '0.04em', marginBottom: 40 }}>
          {lang === 'id' ? storyMeta.tagline_id : storyMeta.tagline_en}
        </p>
        <div style={{ width: 40, height: 2, background: '#7a1515', margin: '0 auto 40px' }} />
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.65, color: '#1c1c1c', maxWidth: 540, margin: '0 auto 16px' }}>
          &ldquo;{lang === 'id' ? storyMeta.founder_quote_id : storyMeta.founder_quote_en}&rdquo;
        </p>
        <p style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888888', marginBottom: 40 }}>
          &mdash;&nbsp;{storyMeta.founder_id}&nbsp;&middot;&nbsp;Los Angeles&nbsp;&middot;&nbsp;1983–2019
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => { if (lang !== 'id') toggle(); }}
            style={{ fontFamily: 'var(--sans)', fontSize: 15, color: lang === 'id' ? '#7a1515' : '#aaaaaa', fontWeight: lang === 'id' ? 500 : 400, minHeight: 44, padding: '0 2px' }}
          >ID</button>
          <span style={{ color: '#aaaaaa', userSelect: 'none' }}>|</span>
          <button
            onClick={() => { if (lang !== 'en') toggle(); }}
            style={{ fontFamily: 'var(--sans)', fontSize: 15, color: lang === 'en' ? '#7a1515' : '#aaaaaa', fontWeight: lang === 'en' ? 500 : 400, minHeight: 44, padding: '0 2px' }}
          >EN</button>
        </div>
      </div>
      <div style={{ height: 3, background: '#7a1515' }} />

      {/* ── BEFORE-RECIPES STORY ──────────────────────────────────── */}
      <div className="story-wrap">
        {beforeSections.map((section, i) => (
          <StorySectionBlock key={section.id} section={section} lang={lang} isFirst={i === 0} />
        ))}
      </div>

      {/* ── SEARCH ────────────────────────────────────────────────── */}
      <div className="home-search">
        <div className="home-search-inner">
          <input
            className="home-search-input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'id' ? 'Cari resep...' : 'Search recipes...'}
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

      {/* ── RECIPE INDEX ──────────────────────────────────────────── */}
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
          <>
            {/* Legend */}
            <div className="index-legend-wrap">
              <div className="index-legend">
                <span className="legend-item">
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#7a1515', marginRight: 7, flexShrink: 0, verticalAlign: 'middle' }} />
                  {lang === 'id' ? 'Resep lengkap' : 'Full recipe'}
                </span>
                <span className="legend-item">
                  <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', border: '1.5px solid #e8a020', background: 'transparent', marginRight: 7, flexShrink: 0, verticalAlign: 'middle' }} />
                  {lang === 'id' ? 'Bahan saja' : 'Ingredients only'}
                </span>
                <span className="legend-item" style={{ opacity: 0.45 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, marginRight: 7, flexShrink: 0 }} />
                  {lang === 'id' ? 'Segera hadir' : 'Coming soon'}
                </span>
              </div>
            </div>

            {/* Category blocks, woven with between-categories story sections */}
            {pageBlocks.map((block) =>
              block.kind === 'category' ? (
                <div key={block.cat.key} id={block.cat.key} style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '32px var(--pad) 0' }}>
                  <div className="index-cat-head">
                    <h2 className="index-cat-title">
                      {lang === 'id' ? block.cat.name_id : block.cat.name_en}
                    </h2>
                    <div className="index-cat-rule" aria-hidden="true" />
                  </div>
                  {block.recipes.map(r => <IndexRow key={r.id} recipe={r} lang={lang} />)}
                </div>
              ) : (
                <div key={block.section.id} className="story-wrap">
                  <StorySectionBlock section={block.section} lang={lang} isFirst={true} />
                </div>
              )
            )}

            {/* Write to Hertha */}
            <div className="write-link-row">
              <Link href="/write-to-hertha" className="write-link-text">
                {lang === 'id'
                  ? 'Sudah memasak salah satu hidangan ini? Tulis kepada Hertha →'
                  : 'Did you cook one of these dishes? Write to Hertha →'}
              </Link>
            </div>
            <div style={{ height: 48 }} />
          </>
        )}
      </main>

      {/* ── AFTER-RECIPES SECTIONS ────────────────────────────────── */}
      {afterSections.length > 0 && (
        <div className="story-wrap">
          {afterSections.map((section, i) => (
            <StorySectionBlock key={section.id} section={section} lang={lang} isFirst={i === 0} />
          ))}
        </div>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="site-footer">
        <p className="footer-copy">&copy; Hertha Tan &middot; Ramayani &middot; Los Angeles</p>
      </footer>
    </>
  );
}
