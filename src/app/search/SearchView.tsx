'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import type { RecipeSummary, FilterCat } from '@/types/recipe';
import Header from '@/components/Header';
import { TextRow, LoadMoreButton } from '@/components/RecipeResults';

export default function SearchView({ recipes, initialQuery, categories }: { recipes: RecipeSummary[]; initialQuery: string; categories: FilterCat[] }) {
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [query, setQuery] = useState(initialQuery);
  const [visible, setVisible] = useState(24);

  // initialQuery only changes when the URL itself changes (e.g. the
  // browser back button restoring `/search?q=X` after visiting a recipe)
  // -- useState's initial value is ignored on re-render, so sync it
  // explicitly or the box would come back empty.
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  // Debounced so the URL (and back-button history) tracks the query
  // without pushing a navigation on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace(query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search', { scroll: false });
    }, 400);
    return () => clearTimeout(t);
  }, [query, router]);

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
      <Header categories={categories} />

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

      {/* Results — text only, no photos. Searching is a fast, narrowing
          lookup by name, not visual browsing (that's what /recipes is
          for), and images would otherwise get fetched and discarded on
          every partial keystroke as someone types toward what they want.
          The photo itself still loads normally once they click through
          to the recipe page. */}
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
          <div style={{ maxWidth: 640, padding: '16px 48px 0' }}>
            {displayed.map(r => (
              <TextRow
                key={r.id}
                recipe={r}
                onClick={() => router.push(`/resep/${r.id}`)}
              />
            ))}
          </div>
          {results.length > visible && (
            <LoadMoreButton lang={ctxLang} onClick={() => setVisible(v => v + 24)} />
          )}
        </>
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
