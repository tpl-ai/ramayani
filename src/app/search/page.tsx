'use client';

import { useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

function RecipeCard({ recipe, lang, onClick }: { recipe: Recipe; lang: 'id' | 'en'; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const name = lang === 'id' ? recipe.name_id : (recipe.name_en || recipe.name_id);
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
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const { lang } = useLang();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allRecipes.filter(r => {
      const nameEn = (r.name_en || r.name_id).toLowerCase();
      const nameId = r.name_id.toLowerCase();
      return nameEn.includes(q) || nameId.includes(q);
    });
  }, [query]);

  const placeholder = lang === 'id' ? 'Cari resep…' : 'Search recipes…';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', background: '#fff', minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', borderBottom: '1px solid #f2f2f2',
      }}>
        <a href="/" style={{ fontSize: 13, color: '#999', textDecoration: 'none', fontWeight: 400 }}>← Back</a>
        <span style={{ fontFamily: "'Book Antiqua', 'Palatino Linotype', Palatino, Georgia, serif", fontSize: 16, fontWeight: 400, letterSpacing: '0.1em' }}>RAMAYANI</span>
        <div style={{ width: 40 }} />
      </nav>

      {/* Search input */}
      <div style={{ padding: '28px 32px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#f7f5f2', borderRadius: 50, padding: '14px 22px',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, color: '#1a1a1a', flex: 1, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ color: '#ccc', fontSize: 16, padding: 0, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {query.trim() === '' ? (
        <div style={{ padding: '60px 32px', textAlign: 'center', color: '#ccc', fontSize: 14 }}>
          {lang === 'id' ? 'Ketik untuk mencari resep' : 'Start typing to search'}
        </div>
      ) : results.length === 0 ? (
        <div style={{ padding: '60px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>
            {lang === 'id' ? `Tidak ditemukan untuk "${query}"` : `No results for "${query}"`}
          </p>
          <p style={{ fontSize: 13, color: '#aaa' }}>
            {lang === 'id' ? 'Coba kata kunci lain' : 'Try a different search'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ padding: '20px 32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: '#aaa' }}>
              {results.length} {lang === 'id' ? 'resep ditemukan' : 'results'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, padding: '0 32px' }}>
            {results.map(r => (
              <RecipeCard
                key={r.id}
                recipe={r}
                lang={lang}
                onClick={() => router.push(`/resep/${r.id}`)}
              />
            ))}
          </div>
        </>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
