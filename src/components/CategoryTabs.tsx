'use client';

import { useState } from 'react';
import type { FilterCat } from '@/types/recipe';

// Shared between /recipes (filters its own grid in place) and the recipe
// detail page (navigates to /recipes?category=X instead, since there's no
// grid on that page to filter) -- same tab bar, different onSelect.
export default function CategoryTabs({ categories, activeCategory, lang, onSelect }: {
  categories: FilterCat[];
  activeCategory: string;
  lang: 'en' | 'id';
  onSelect: (id: string) => void;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const activeCat = categories.find(c => c.id === activeCategory);
  const activeCatLabel = activeCat ? (lang === 'id' ? activeCat.label_id : activeCat.label_en) : (lang === 'id' ? 'Semua' : 'All');

  return (
    <>
      {/* Desktop/tablet — inline scrollable row, 768px+ */}
      <div className="categories-inline-row" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>
        {categories.map(cat => (
          <span
            key={cat.id}
            onClick={() => onSelect(cat.id)}
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
            {lang === 'id' ? cat.label_id : cat.label_en}
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
          {lang === 'id' ? 'Saring' : 'Filter'}: {activeCatLabel}
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
                  onClick={() => { onSelect(cat.id); setFilterOpen(false); }}
                  style={{
                    padding: '10px 14px', cursor: 'pointer',
                    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                    fontSize: 15, fontWeight: 400,
                    color: activeCategory === cat.id ? '#cc0000' : '#1a1a1a',
                    background: activeCategory === cat.id ? '#faf5f5' : 'transparent',
                  }}
                >
                  {lang === 'id' ? cat.label_id : cat.label_en}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
