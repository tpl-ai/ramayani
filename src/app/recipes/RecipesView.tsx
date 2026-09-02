'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import type { RecipeSummary, FilterCat } from '@/types/recipe';
import Header from '@/components/Header';
import RecipeResults from '@/components/RecipeResults';

const SERIF = 'var(--font-logo), Libre Baskerville, Georgia, serif';
const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif';

type TypeLabels = { label_en: string; label_id: string } | null;

export default function RecipesView({ recipes, categories, initialCategory, initialType, typeRecipes, typeLabels }: {
  recipes: RecipeSummary[];
  categories: FilterCat[];
  initialCategory: string;
  initialType: string | null;
  typeRecipes: RecipeSummary[];
  typeLabels: TypeLabels;
}) {
  const router = useRouter();
  const { lang: ctxLang } = useLang();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeType, setActiveType] = useState(initialType);

  // initialCategory/initialType only change when the URL itself changes
  // (e.g. the browser back button restoring `/recipes?category=X` or
  // `?type=X` after visiting a recipe) -- useState's initial value is
  // ignored on re-render, so sync explicitly or the filter would stay
  // stuck on whatever it was when this component first mounted.
  useEffect(() => { setActiveCategory(initialCategory); }, [initialCategory]);
  useEffect(() => { setActiveType(initialType); }, [initialType]);

  // The page's title -- Course and Group both render the same way now, so
  // whichever one is active (they're mutually exclusive) supplies it; the
  // plain "All Recipes" state (no longer a choice in the RECIPES menu,
  // but still reachable by URL) has none.
  const activeCategoryLabels = !activeType && activeCategory !== 'all'
    ? categories.find(c => c.id === activeCategory) ?? null
    : null;
  const titleLabels = activeType ? typeLabels : activeCategoryLabels;

  const sorted = useMemo(() => {
    if (activeType) return typeRecipes;

    const order: Record<string, number> = { full: 0, partial: 1, no_content: 2 };
    const filtered = recipes
      .filter(r => activeCategory === 'all' || r.category === activeCategory)
      .sort((a, b) => (order[a.content_state] ?? 2) - (order[b.content_state] ?? 2));

    return [...filtered].sort((a, b) => {
      const aHasPhoto = a.photo && a.photo.trim() !== '' ? 0 : 1;
      const bHasPhoto = b.photo && b.photo.trim() !== '' ? 0 : 1;
      return aHasPhoto - bHasPhoto;
    });
  }, [recipes, activeCategory, activeType, typeRecipes]);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
      <Header categories={categories} />

      {/* Filtering now happens entirely through the header's RECIPES menu
          (Course/Group), so this is just the result: whichever one is
          active names itself here -- Course and Group read identically,
          on purpose (was two different treatments before). Just a title
          for now; a real header for this page (a photo, a blurb) can
          replace it later without touching the filtering logic above. */}
      <div style={{ padding: '28px 48px 20px' }}>
        {titleLabels && (
          <h2 style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 28, color: '#cc0000', margin: '0 0 6px' }}>
            {ctxLang === 'id' ? titleLabels.label_id : titleLabels.label_en}
          </h2>
        )}
        <span style={{ fontFamily: HELVETICA, fontSize: 15, color: '#aaa' }}>
          {sorted.length} {ctxLang === 'id' ? 'resep' : 'recipes'}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p style={{ padding: '40px 32px', fontSize: 14, color: '#aaa', textAlign: 'center' }}>
          {ctxLang === 'id' ? 'Tidak ada resep yang cocok.' : 'No recipes match.'}
        </p>
      ) : (
        <RecipeResults
          items={sorted}
          lang={ctxLang}
          onSelect={(id) => router.push(`/resep/${id}`)}
          hasMore={false}
          onLoadMore={() => {}}
        />
      )}

      <div style={{ height: 48 }} />
    </div>
  );
}
