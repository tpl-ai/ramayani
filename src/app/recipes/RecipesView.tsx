'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import type { RecipeSummary, FilterCat } from '@/types/recipe';
import Header from '@/components/Header';
import RecipeResults from '@/components/RecipeResults';
import CategoryTabs from '@/components/CategoryTabs';

export default function RecipesView({ recipes, categories, initialCategory }: {
  recipes: RecipeSummary[];
  categories: FilterCat[];
  initialCategory: string;
}) {
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [visible, setVisible] = useState(24);

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
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          lang={ctxLang}
          onSelect={(id) => { setActiveCategory(id); setVisible(24); }}
        />

        <span style={{
          fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
          fontSize: 15, color: '#aaa', flexShrink: 0, whiteSpace: 'nowrap',
        }}>
          {sorted.length} {ctxLang === 'id' ? 'resep' : 'recipes'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {ctxLang === 'id' ? 'Tidak ada resep yang cocok.' : 'No recipes match.'}
        </p>
      ) : (
        <RecipeResults
          items={displayed}
          lang={ctxLang}
          onSelect={(id) => router.push(`/resep/${id}`)}
          hasMore={sorted.length > visible}
          onLoadMore={() => setVisible(v => v + 24)}
        />
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
