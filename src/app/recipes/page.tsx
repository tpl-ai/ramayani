'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';
import Header from '@/components/Header';
import Masonry from 'react-masonry-css'

const FILTER_CATS = [
  { id: 'all',           label_en: 'All',            label_id: 'Semua' },
  { id: 'ayam',          label_en: 'Chicken',        label_id: 'Ayam' },
  { id: 'daging',        label_en: 'Beef & Lamb',    label_id: 'Daging' },
  { id: 'seafood',       label_en: 'Seafood',        label_id: 'Seafood' },
  { id: 'nasi_mie',      label_en: 'Rice & Noodles', label_id: 'Nasi & Mie' },
  { id: 'sayuran_salad', label_en: 'Vegetables',     label_id: 'Sayuran' },
  { id: 'sambal_saus',   label_en: 'Sambal',         label_id: 'Sambal' },
  { id: 'sup',           label_en: 'Soups',          label_id: 'Sup' },
  { id: 'kue_dessert',   label_en: 'Desserts',       label_id: 'Dessert' },
];

function RecipeCard({ recipe, lang, onClick }: { recipe: Recipe; lang: 'EN' | 'ID'; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'ID' ? (recipe.name_id || recipe.name_en) : (recipe.name_en || recipe.name_id);
  const hasPhoto = !!recipe.photo && !err;

  return (
    <div
      onClick={recipe.status !== 'coming_soon' ? onClick : undefined}
      style={{
        cursor: recipe.status !== 'coming_soon' ? 'pointer' : 'default',
        opacity: recipe.status === 'coming_soon' ? 0.45 : 1,
      }}
    >
      <div style={{
        width: '100%',
        paddingBottom: hasPhoto?  '120%' : '120%',
        position: 'relative',
        overflow: 'hidden',
        background: '#e8e2da',
      }}>
        {hasPhoto && (
          <img
            src={`/images/${recipe.photo}`}
            alt={name}
            onError={() => setErr(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </div>
      <div style={{
        fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
        fontSize: 18,
        fontWeight: 400,
        color: '#1a1a1a',
        marginTop: 8,
        paddingBottom: 16,
      }}>
        {name}
      </div>
    </div>
  )
}

function RecipesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');
  const initialCat = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { complete: 0, flagged: 0, needs_method: 1, coming_soon: 2 };
    const filtered = allRecipes
      .filter(r => activeCategory === 'all' || r.category === activeCategory)
      .filter(r => {
        if (!search) return true;
        const n = ctxLang === 'id' ? r.name_id : (r.name_en || r.name_id);
        return n.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));

    return [...filtered].sort((a, b) => {
      const aHasPhoto = a.photo && a.photo.trim() !== '' ? 0 : 1;
      const bHasPhoto = b.photo && b.photo.trim() !== '' ? 0 : 1;
      return aHasPhoto - bHasPhoto;
    });
  }, [activeCategory, search, ctxLang]);

  const displayed = sorted.slice(0, visible);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <style jsx global>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -24px;
          width: auto;
          padding: 0 48px;
        }
        .my-masonry-grid_column {
          padding-left: 24px;
          background-clip: padding-box;
        }
        .my-masonry-grid_column > div {
          margin-bottom: 24px;
        }
      `}</style>

      <Header lang={lang} setLang={setLang} />

      {/* Search */}
      <div style={{ padding: '20px 32px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#f7f5f2', borderRadius: 50, padding: '11px 18px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisible(24); }}
            placeholder={ctxLang === 'id' ? 'Cari resep' : 'Search recipes'}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#1a1a1a', flex: 1, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#ccc', fontSize: 15, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>✕</button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ padding: '16px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
          {FILTER_CATS.map(cat => (
            <span
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setVisible(24); }}
              style={{
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                fontSize: 15, fontWeight: 400,
                cursor: 'pointer',
                marginRight: 32, paddingBottom: 4,
                color: activeCategory === cat.id ? '#cc0000' : '#1a1a1a',
                borderBottom: activeCategory === cat.id ? '1px solid #cc0000' : 'none',
              }}
            >
              {ctxLang === 'id' ? cat.label_id : cat.label_en}
            </span>
          ))}
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
        <Masonry
          breakpointCols={{ default: 4, 1024: 3, 640: 2 }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {displayed.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              lang={lang}
              onClick={() => router.push(`/resep/${r.id}`)}
            />
          ))}
        </Masonry>
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

export default function RecipesPage() {
  return (
    <Suspense fallback={null}>
      <RecipesContent />
    </Suspense>
  );
}
