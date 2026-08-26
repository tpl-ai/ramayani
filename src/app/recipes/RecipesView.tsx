'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { recipePhotoSrc } from '@/lib/photo';
import type { RecipeSummary } from '@/types/recipe';
import Header from '@/components/Header';

function RecipeCard({ recipe, lang, onClick }: { recipe: RecipeSummary; lang: 'en' | 'id'; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'id' ? (recipe.name_id || recipe.name_en) : (recipe.name_en || recipe.name_id);
  const hasPhoto = !!recipe.photo && !err;

  return (
    <div
      onClick={recipe.content_state !== 'no_content' ? onClick : undefined}
      style={{
        cursor: recipe.content_state !== 'no_content' ? 'pointer' : 'default',
        opacity: recipe.content_state === 'no_content' ? 0.45 : 1,
      }}
    >
      <div style={{
        width: '100%',
        paddingBottom: '130%',
        position: 'relative',
        overflow: 'hidden',
        background: '#e8e2da',
      }}>
        {hasPhoto && (
          <img
            src={recipePhotoSrc(recipe.photo)}
            alt={name}
            onError={() => setErr(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
            }}
          />
        )}
      </div>
      <div style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        fontSize: 20, fontWeight: 400, color: '#1a1a1a', lineHeight: 1.2,
        marginTop: 8, paddingBottom: 16,
      }}>
        {name}
      </div>
    </div>
  )
}

interface FilterCat { id: string; label_en: string; label_id: string }

export default function RecipesView({ recipes, categories, initialCategory }: {
  recipes: RecipeSummary[];
  categories: FilterCat[];
  initialCategory: string;
}) {
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [visible, setVisible] = useState(24);
  const [filterOpen, setFilterOpen] = useState(false);

  const activeCat = categories.find(c => c.id === activeCategory);
  const activeCatLabel = activeCat ? (ctxLang === 'id' ? activeCat.label_id : activeCat.label_en) : (ctxLang === 'id' ? 'Semua' : 'All');

  const sorted = useMemo(() => {
    const order: Record<string, number> = { full: 0, partial: 1, no_content: 2 };
    const filtered = recipes
      .filter(r => activeCategory === 'all' || r.category === activeCategory)
      .sort((a, b) => (order[a.content_state] ?? 2) - (order[b.content_state] ?? 2));

    return [...filtered].sort((a, b) => {
      const aHasPhoto = a.photo && a.photo.trim() !== '' ? 0 : 1;
      const bHasPhoto = b.photo && b.photo.trim() !== '' ? 0 : 1;
      return aHasPhoto - bHasPhoto;
    });
  }, [recipes, activeCategory]);

  const displayed = sorted.slice(0, visible);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <Header />

      {/* Category filter */}
      <div className="recipes-filter-row" style={{ padding: '20px 32px 16px' }}>
        {/* Desktop/tablet — inline scrollable row, 768px+ */}
        <div className="categories-inline-row" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
          {categories.map(cat => (
            <span
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setVisible(24); }}
              style={{
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: 15, fontWeight: 400,
                cursor: 'pointer',
                flexShrink: 0, whiteSpace: 'nowrap',
                marginRight: 32, paddingBottom: 4,
                color: activeCategory === cat.id ? '#cc0000' : '#1a1a1a',
                borderBottom: activeCategory === cat.id ? '1px solid #cc0000' : 'none',
              }}
            >
              {ctxLang === 'id' ? cat.label_id : cat.label_en}
            </span>
          ))}
        </div>

        {/* Mobile — compact filter pill + dropdown picker, below 768px */}
        <div className="categories-mobile-filter" style={{ position: 'relative' }}>
          <button
            onClick={() => setFilterOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
              fontSize: 14, fontWeight: 500, color: '#1a1a1a',
              background: '#fff', border: '1px solid #e0e0e0', borderRadius: 50,
              padding: '9px 16px 9px 14px', cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cc0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            {ctxLang === 'id' ? 'Saring' : 'Filter'}: {activeCatLabel}
          </button>

          {filterOpen && (
            <>
              <div onClick={() => setFilterOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, minWidth: 220,
                background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                zIndex: 91, padding: 6,
              }}>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setVisible(24); setFilterOpen(false); }}
                    style={{
                      padding: '10px 14px', cursor: 'pointer',
                      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                      fontSize: 15, fontWeight: 400,
                      color: activeCategory === cat.id ? '#cc0000' : '#1a1a1a',
                      background: activeCategory === cat.id ? '#faf5f5' : 'transparent',
                    }}
                  >
                    {ctxLang === 'id' ? cat.label_id : cat.label_en}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <span style={{
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          fontSize: 15, color: '#aaa', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {sorted.length} {ctxLang === 'id' ? 'resep' : 'recipes'}
        </span>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {ctxLang === 'id' ? 'Tidak ada resep yang cocok.' : 'No recipes match.'}
        </p>
      ) : (
        <div className="recipes-grid" style={{
          display: 'grid',
          gap: 24,
          padding: '0 48px',
        }}>
          {displayed.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              lang={ctxLang}
              onClick={() => router.push(`/resep/${r.id}`)}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {sorted.length > visible && (
        <div style={{ textAlign: 'center', padding: '32px 32px 0' }}>
          <button
            onClick={() => setVisible(v => v + 24)}
            style={{
              fontSize: 15, fontWeight: 500, color: '#1a1a1a',
              border: '1.5px solid #e0e0e0', borderRadius: 50,
              padding: '11px 28px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {ctxLang === 'id' ? 'Lihat lebih banyak' : 'Load more'}
          </button>
        </div>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
