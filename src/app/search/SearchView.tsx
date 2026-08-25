'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { recipePhotoSrc } from '@/lib/photo';
import type { RecipeSummary } from '@/types/recipe';
import Header from '@/components/Header';

// Card, grid, and search-bar styling mirror /recipes/RecipesView.tsx
// exactly, so this page reads as the same product surface rather than a
// separately designed one.
function RecipeCard({ recipe, lang, onClick }: { recipe: RecipeSummary; lang: 'EN' | 'ID'; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'ID' ? (recipe.name_id || recipe.name_en) : (recipe.name_en || recipe.name_id);
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
  );
}

export default function SearchView({ recipes }: { recipes: RecipeSummary[] }) {
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [lang, setLang] = useState<'EN' | 'ID'>('EN');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(24);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return recipes.filter(r => {
      const nameEn = (r.name_en || r.name_id).toLowerCase();
      const nameId = r.name_id.toLowerCase();
      return nameEn.includes(q) || nameId.includes(q);
    });
  }, [recipes, query]);

  const displayed = results.slice(0, visible);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
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
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setVisible(24); }}
            placeholder={ctxLang === 'id' ? 'Cari resep' : 'Search recipes'}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#1a1a1a', flex: 1, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ color: '#ccc', fontSize: 15, padding: 0, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>✕</button>
          )}
        </div>
      </div>

      {/* Results */}
      {query.trim() === '' ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {ctxLang === 'id' ? 'Ketik untuk mencari resep' : 'Start typing to search'}
        </p>
      ) : results.length === 0 ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {ctxLang === 'id' ? `Tidak ditemukan untuk "${query}"` : `No results for "${query}"`}
        </p>
      ) : (
        <>
          <div style={{ padding: '16px 32px 0', textAlign: 'right' }}>
            <span style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: 15, color: '#aaa' }}>
              {results.length} {ctxLang === 'id' ? 'resep' : 'results'}
            </span>
          </div>
          <div className="recipes-grid" style={{ display: 'grid', gap: 24, padding: '16px 48px 0' }}>
            {displayed.map(r => (
              <RecipeCard key={r.id} recipe={r} lang={lang} onClick={() => router.push(`/resep/${r.id}`)} />
            ))}
          </div>
        </>
      )}

      {/* Load more */}
      {results.length > visible && (
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
