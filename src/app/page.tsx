'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';

const BROWSE_CATEGORIES = [
  { id: 'ayam',          label_en: 'Chicken',        label_id: 'Ayam',         photo: 'cat-chicken.jpg' },
  { id: 'daging',        label_en: 'Beef & Lamb',    label_id: 'Daging',       photo: 'cat-beef.jpg' },
  { id: 'seafood',       label_en: 'Seafood',        label_id: 'Seafood',      photo: 'cat-seafood.jpg' },
  { id: 'nasi_mie',      label_en: 'Rice & Noodles', label_id: 'Nasi & Mie',   photo: 'cat-rice.jpg' },
  { id: 'sayuran_salad', label_en: 'Vegetables',     label_id: 'Sayuran',      photo: 'cat-veg.jpg' },
  { id: 'sambal_saus',   label_en: 'Sambal',         label_id: 'Sambal',       photo: 'cat-sambal.jpg' },
];

const MENU_ITEMS = (lang: 'en' | 'id') => [
  { label: lang === 'id' ? 'Paling Populer'   : 'Most Popular',    href: '#popular' },
  { label: lang === 'id' ? 'Semua Resep'      : 'All Recipes',     href: '/recipes' },
  { label: lang === 'id' ? 'Jenis Masakan'    : 'Browse by Type',  href: '#types' },
  { label: lang === 'id' ? 'Tentang Ramayani' : 'About Ramayani',  href: '/about' },
];

function PhotoCard({ src, alt, fallback = '#e8e2da' }: { src: string; alt: string; fallback?: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <div style={{ width: '100%', height: '100%', background: fallback }} />;
  return (
    <img
      src={`/images/${src}`}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

export default function HomePage() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const popular = allRecipes
    .filter(r => r.featured_order != null)
    .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))
    .slice(0, 10);

  const name = (r: typeof popular[0]) => lang === 'id' ? r.name_id : (r.name_en || r.name_id);

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', minHeight: '100vh', background: '#fff' }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 32px', borderBottom: '1px solid #f2f2f2',
      }}>
        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Menu"
          style={{ display: 'flex', flexDirection: 'column', gap: 5, cursor: 'pointer', width: 24, padding: 0, background: 'none', border: 'none' }}
        >
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
        </button>

        {/* Wordmark */}
        <span style={{
          fontSize: 18, fontWeight: 700, letterSpacing: '0.06em',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          RAMAYANI
        </span>

        {/* Search icon */}
        <button
          onClick={() => router.push('/search')}
          aria-label="Search"
          style={{ padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </nav>

      {/* ── SLIDE-OUT MENU ──────────────────────────────────────── */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 9 }}
          />
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 280, minHeight: '100%',
            background: '#fff', boxShadow: '2px 0 30px rgba(0,0,0,0.12)',
            padding: 28, zIndex: 10,
          }}>
            <button
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 22, color: '#999', cursor: 'pointer', display: 'block', marginBottom: 28, background: 'none', border: 'none', padding: 0 }}
              aria-label="Close menu"
            >✕</button>

            {MENU_ITEMS(lang).map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', fontSize: 16, fontWeight: 500, color: '#1a1a1a',
                  padding: '13px 0', borderBottom: '1px solid #f2f2f2', textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            ))}

            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              <button
                onClick={() => setLang('en')}
                style={{
                  fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 50,
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${lang === 'en' ? '#1a1a1a' : '#e8e8e8'}`,
                  background: lang === 'en' ? '#1a1a1a' : '#fff',
                  color: lang === 'en' ? '#fff' : '#999',
                }}
              >English</button>
              <button
                onClick={() => setLang('id')}
                style={{
                  fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 50,
                  cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${lang === 'id' ? '#1a1a1a' : '#e8e8e8'}`,
                  background: lang === 'id' ? '#1a1a1a' : '#fff',
                  color: lang === 'id' ? '#fff' : '#999',
                }}
              >Indonesia</button>
            </div>
          </div>
        </>
      )}

      {/* ── SPLASH ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36, padding: '44px 32px 32px' }}>
        <div style={{ width: 280, height: 280, flexShrink: 0, borderRadius: 16, overflow: 'hidden' }}>
          <PhotoCard src="nasi-uduk-plate.jpg" alt="Nasi Uduk" fallback="#e8e2da" />
        </div>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 12 }}>
            Ramayani
          </h1>
          <p style={{ fontSize: 16, color: '#999', lineHeight: 1.5, maxWidth: 360 }}>
            {lang === 'id'
              ? 'Masakan rumahan Indonesia dari dapur tercinta di Los Angeles.'
              : 'Classic Indonesian home cooking from a beloved Los Angeles kitchen.'}
          </p>
        </div>
      </div>

      {/* ── MOST POPULAR ────────────────────────────────────────── */}
      <h2 id="popular" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', padding: '36px 32px 22px' }}>
        {lang === 'id' ? 'Paling Populer' : 'Most Popular'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 18, padding: '0 32px' }}>
        {popular.map(r => (
          <div
            key={r.id}
            onClick={() => router.push(`/resep/${r.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', marginBottom: 10, background: '#e8e2da' }}>
              <PhotoCard src={r.photo} alt={name(r)} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{name(r)}</div>
          </div>
        ))}
      </div>

      {/* ── BROWSE BY TYPE ──────────────────────────────────────── */}
      <h2 id="types" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', padding: '36px 32px 22px' }}>
        {lang === 'id' ? 'Jenis Masakan' : 'Browse by Type'}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, padding: '0 32px' }}>
        {BROWSE_CATEGORIES.map(cat => (
          <div
            key={cat.id}
            onClick={() => router.push(`/recipes?category=${cat.id}`)}
            style={{ cursor: 'pointer', position: 'relative', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/10' }}
          >
            <PhotoCard src={cat.photo} alt={lang === 'id' ? cat.label_id : cat.label_en} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.32)',
            }}>
              <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
                {lang === 'id' ? cat.label_id : cat.label_en}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <div style={{ padding: 32, borderTop: '1px solid #f2f2f2', textAlign: 'center', marginTop: 48 }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>RAMAYANI</span>
      </div>

    </div>
  );
}
