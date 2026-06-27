'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

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

function RecipeCard({ recipe, lang, onClick }: { recipe: Recipe; lang: 'id' | 'en'; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'id' ? recipe.name_id : (recipe.name_en || recipe.name_id);
  const isReady = recipe.status === 'complete' || recipe.status === 'flagged' || recipe.status === 'needs_method';
  const hasPhoto = !!recipe.photo && !err;

  return (
    <div
      onClick={recipe.status !== 'coming_soon' ? onClick : undefined}
      style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #f2f2f2',
        cursor: recipe.status !== 'coming_soon' ? 'pointer' : 'default',
        opacity: recipe.status === 'coming_soon' ? 0.45 : 1,
        transition: 'box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        if (recipe.status !== 'coming_soon')
          (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ aspectRatio: '4/3', background: '#e8e2da', overflow: 'hidden' }}>
        {hasPhoto ? (
          <img
            src={`/images/${recipe.photo}`}
            alt={name}
            onError={() => setErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e8e2da' }} />
        )}
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: recipe.status === 'coming_soon' ? '#bbb' : '#1a1a1a', lineHeight: 1.3 }}>
          {name}
        </div>
        {recipe.status === 'needs_method' && (
          <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>
            {lang === 'id' ? 'Bahan saja' : 'Ingredients only'}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLang();
  const initialCat = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(24);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { complete: 0, flagged: 0, needs_method: 1, coming_soon: 2 };
    return allRecipes
      .filter(r => activeCategory === 'all' || r.category === activeCategory)
      .filter(r => {
        if (!search) return true;
        const n = lang === 'id' ? r.name_id : (r.name_en || r.name_id);
        return n.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));
  }, [activeCategory, search, lang]);

  const displayed = sorted.slice(0, visible);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* Top bar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', borderBottom: '1px solid #f2f2f2',
      }}>
        <a href="/" style={{ fontSize: 13, color: '#999', textDecoration: 'none', fontWeight: 400 }}>← Back</a>
        <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>RAMAYANI</span>
        <div style={{ width: 40 }} />
      </nav>

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
            placeholder={lang === 'id' ? 'Cari resep' : 'Search recipes'}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: '#1a1a1a', flex: 1, fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#ccc', fontSize: 13, padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ padding: '16px 32px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTER_CATS.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); setVisible(24); }}
            style={{
              fontSize: 12, fontWeight: 500, padding: '7px 16px', borderRadius: 50,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease',
              color: activeCategory === cat.id ? '#fff' : '#666',
              background: activeCategory === cat.id ? '#1a1a1a' : '#fff',
              border: `1.5px solid ${activeCategory === cat.id ? '#1a1a1a' : '#e8e8e8'}`,
            }}
          >
            {lang === 'id' ? cat.label_id : cat.label_en}
          </button>
        ))}
      </div>

      {/* Heading */}
      <div style={{ padding: '28px 32px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>
          {lang === 'id' ? 'Semua Resep' : 'All Recipes'}
        </h1>
        <span style={{ fontSize: 12, color: '#aaa' }}>
          {sorted.length} {lang === 'id' ? 'resep' : 'recipes'}
        </span>
      </div>

      {/* Grid */}
      {sorted.length === 0 ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {lang === 'id' ? 'Tidak ada resep yang cocok.' : 'No recipes match.'}
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '0 32px' }}>
          {displayed.map(r => (
            <RecipeCard
              key={r.id}
              recipe={r}
              lang={lang}
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
              fontSize: 13, fontWeight: 500, color: '#1a1a1a',
              border: '1.5px solid #e0e0e0', borderRadius: 50,
              padding: '11px 28px', background: '#fff', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {lang === 'id' ? 'Lihat lebih banyak' : 'Load more'}
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
