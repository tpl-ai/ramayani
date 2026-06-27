'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types/recipe';

const CATEGORIES = [
  { id: 'all',           label_id: 'Semua',       label_en: 'All' },
  { id: 'ayam',          label_id: 'Ayam',         label_en: 'Chicken' },
  { id: 'daging',        label_id: 'Daging',       label_en: 'Beef' },
  { id: 'seafood',       label_id: 'Seafood',      label_en: 'Seafood' },
  { id: 'nasi_mie',      label_id: 'Nasi & Mie',   label_en: 'Rice & Noodles' },
  { id: 'sayuran_salad', label_id: 'Sayuran',      label_en: 'Vegetables' },
  { id: 'sambal_saus',   label_id: 'Sambal',       label_en: 'Sambal' },
  { id: 'sup',           label_id: 'Sup',          label_en: 'Soups' },
  { id: 'kue_dessert',   label_id: 'Dessert',      label_en: 'Desserts' },
];

function RecipeCard({ recipe, lang, onClick }: {
  recipe: Recipe;
  lang: 'id' | 'en';
  onClick: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const name = lang === 'id' ? recipe.name_id : (recipe.name_en || recipe.name_id);
  const isReady = recipe.status === 'complete' || recipe.status === 'flagged';
  const hasPhoto = !!recipe.photo && !imgErr;

  return (
    <div
      onClick={isReady ? onClick : undefined}
      style={{
        background: '#ffffff',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: isReady ? 'pointer' : 'default',
        opacity: recipe.status === 'coming_soon' ? 0.45 : 1,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        if (!isReady) return;
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#e8e0d8' }}>
        {hasPhoto ? (
          <img
            src={`/images/${recipe.photo}`}
            alt={name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e8e0d8' }} />
        )}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontSize: 14,
          fontWeight: 500,
          color: recipe.status === 'coming_soon' ? '#bbbbbb' : '#1a1a1a',
          lineHeight: 1.3,
        }}>
          {name}
        </div>
        {recipe.status === 'needs_method' && (
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>
            {lang === 'id' ? 'Bahan saja' : 'Ingredients only'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [visible, setVisible] = useState(9);
  const [heroErr, setHeroErr] = useState(false);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setVisible(9);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setVisible(9);
  };

  const visibleRecipes = useMemo((): Recipe[] => {
    return allRecipes
      .filter(r => activeCategory === 'all' || r.category === activeCategory)
      .filter(r => {
        if (!search) return true;
        const name = lang === 'id' ? r.name_id : (r.name_en || r.name_id);
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const order: Record<string, number> = { complete: 0, flagged: 0, needs_method: 1, coming_soon: 2 };
        return (order[a.status] ?? 2) - (order[b.status] ?? 2);
      });
  }, [lang, search, activeCategory]);

  const displayedRecipes = visibleRecipes.slice(0, visible);
  const availableCount = allRecipes.filter(r => r.status === 'complete' || r.status === 'flagged').length;

  return (
    <div style={{ background: '#f7f5f2', minHeight: '100vh' }}>

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        background: '#ffffff',
      }}>
        <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '0.01em' }}>
          Ramayani
        </span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#recipes" style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>
            {lang === 'id' ? 'Resep' : 'Recipes'}
          </a>
          <a href="/about" style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>
            {lang === 'id' ? 'Tentang Hertha' : 'About Hertha'}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <button
              onClick={() => setLang('id')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontSize: 12, fontWeight: lang === 'id' ? 600 : 400,
                color: lang === 'id' ? '#e85d26' : '#cccccc',
              }}
            >ID</button>
            <span style={{ margin: '0 4px', color: '#dddddd', fontSize: 12 }}>·</span>
            <button
              onClick={() => setLang('en')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontSize: 12, fontWeight: lang === 'en' ? 600 : 400,
                color: lang === 'en' ? '#e85d26' : '#cccccc',
              }}
            >EN</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div style={{
        margin: '20px 32px 0',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
        height: 420,
      }}>
        {!heroErr ? (
          <img
            src="/images/hertha-kitchen.jpg"
            alt="Hertha Tan in the Ramayani kitchen"
            onError={() => setHeroErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#c4a882' }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0) 55%)',
        }} />
        <div style={{ position: 'absolute', bottom: 28, left: 32, right: 32 }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 400 }}>
            Hertha Tan &middot; Los Angeles &middot; 1983–2019
          </p>
          <p style={{ fontSize: 16, color: '#ffffff', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.45, maxWidth: 520 }}>
            {lang === 'id'
              ? '“Saya memasak untuk keluarga, untuk teman-teman, dan untuk siapa saja yang lapar.”'
              : '“I cook for family, for friends, and for anyone who is hungry.”'}
          </p>
        </div>
      </div>

      {/* ── SEARCH ───────────────────────────────────────────────── */}
      <div style={{ padding: '20px 32px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#ffffff', borderRadius: 50,
          padding: '12px 20px', border: '1.5px solid #e8e8e8',
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#cccccc" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder={lang === 'id' ? 'Cari resep' : 'Search recipes'}
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: '#1a1a1a', flex: 1, fontFamily: 'inherit', fontWeight: 400,
            }}
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              style={{ color: '#cccccc', fontSize: 13, lineHeight: 1, padding: 0 }}
              aria-label="Clear search"
            >✕</button>
          )}
        </div>
      </div>

      {/* ── CATEGORY PILLS ───────────────────────────────────────── */}
      <div style={{ padding: '20px 32px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: activeCategory === cat.id ? '#ffffff' : '#666666',
              padding: '7px 16px',
              borderRadius: 50,
              background: activeCategory === cat.id ? '#1a1a1a' : '#ffffff',
              border: `1.5px solid ${activeCategory === cat.id ? '#1a1a1a' : '#e8e8e8'}`,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
          >
            {lang === 'id' ? cat.label_id : cat.label_en}
          </button>
        ))}
      </div>

      {/* ── RECIPE GRID ──────────────────────────────────────────── */}
      <div id="recipes" style={{ padding: '28px 32px 0' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>
            {lang === 'id' ? 'Resep' : 'Recipes'}
          </h2>
          <span style={{ fontSize: 12, color: '#aaa', fontWeight: 400 }}>
            {availableCount}{lang === 'id' ? ' resep tersedia' : ' available now'}
          </span>
        </div>

        {visibleRecipes.length === 0 ? (
          <p style={{ fontSize: 14, color: '#aaa', padding: '40px 0', textAlign: 'center' }}>
            {lang === 'id' ? 'Tidak ada resep yang cocok.' : 'No recipes match.'}
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {displayedRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                lang={lang}
                onClick={() => router.push(`/resep/${recipe.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── LOAD MORE ────────────────────────────────────────────── */}
      {visibleRecipes.length > visible && (
        <div style={{ textAlign: 'center', padding: 32 }}>
          <button
            onClick={() => setVisible(v => v + 9)}
            style={{
              fontSize: 13, fontWeight: 500, color: '#1a1a1a',
              border: '1.5px solid #e0e0e0', borderRadius: 50,
              padding: '12px 32px', background: '#ffffff',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {lang === 'id' ? 'Lihat lebih banyak' : 'Load more'}
          </button>
        </div>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px 32px', marginTop: 16,
        borderTop: '1px solid #ece8e3',
      }}>
        <span style={{ fontSize: 11, color: '#bbbbbb', letterSpacing: '0.04em' }}>
          Ramayani &middot; Los Angeles &middot; 1983–2019
        </span>
        <a href="/about" style={{ fontSize: 13, color: '#888888', fontWeight: 400 }}>
          {lang === 'id' ? 'Tentang Hertha →' : 'About Hertha →'}
        </a>
      </footer>

    </div>
  );
}
