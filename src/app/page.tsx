'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';

const BOOK_ANTIQUA = "'Book Antiqua', 'Palatino Linotype', Palatino, Georgia, serif";
const ARIAL_BLACK = "'Arial Black', 'Arial Bold', Gadget, sans-serif";
const BARLOW_COND = 'var(--font-barlow-condensed)';
const BARLOW = 'var(--font-barlow)';

const CATEGORIES = [
  { id: 'ayam',          label_en: 'Chicken',        label_id: 'Ayam',         photo: 'cat-chicken.jpg' },
  { id: 'daging',        label_en: 'Beef & Lamb',    label_id: 'Daging',       photo: 'cat-beef.jpg' },
  { id: 'seafood',       label_en: 'Seafood',        label_id: 'Seafood',      photo: 'cat-seafood.jpg' },
  { id: 'nasi_mie',      label_en: 'Rice & Noodles', label_id: 'Nasi & Mie',   photo: 'cat-rice.jpg' },
  { id: 'sayuran_salad', label_en: 'Vegetables',     label_id: 'Sayuran',      photo: 'cat-veg.jpg' },
  { id: 'sambal_saus',   label_en: 'Sambal',         label_id: 'Sambal',       photo: 'cat-sambal.jpg' },
];

function Img({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err || !src) return <div style={{ width: '100%', height: '100%', background: '#e8e2da' }} />;
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

  const featured = allRecipes
    .filter(r => r.featured_order != null)
    .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))
    .slice(0, 10);

  const name = (r: typeof featured[0]) => lang === 'id' ? r.name_id : (r.name_en || r.name_id);
  const isReady = (r: typeof featured[0]) => r.status === 'complete' || r.status === 'flagged';

  const CAT_LABEL = (c: typeof CATEGORIES[0]) => lang === 'id' ? c.label_id : c.label_en;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', minHeight: '100vh', background: '#fff' }}>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 20px', position: 'relative',
      }}>
        <div
          onClick={() => setMenuOpen(true)}
          style={{ display: 'flex', flexDirection: 'column', gap: 5, cursor: 'pointer', width: 22 }}
        >
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
          <span style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
        </div>

        <span style={{
          fontFamily: BOOK_ANTIQUA,
          fontSize: 20, fontWeight: 400, letterSpacing: '0.1em', color: '#1a1a1a',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          RAMAYANI
        </span>

        <div onClick={() => router.push('/search')} style={{ cursor: 'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </nav>

      {/* ── SLIDE-OUT MENU ──────────────────────────────────── */}
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
            <span
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 22, color: '#999', cursor: 'pointer', display: 'inline-block', marginBottom: 28 }}
            >✕</span>

            {[
              { label: lang === 'id' ? 'Semua Resep'      : 'All Recipes',    href: '/recipes' },
              { label: lang === 'id' ? 'Jenis Masakan'    : 'Browse by Type', href: '#types' },
              { label: lang === 'id' ? 'Tentang Ramayani' : 'About Ramayani', href: '/about' },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', fontFamily: BARLOW_COND,
                  fontSize: 16, fontWeight: 500, color: '#1a1a1a',
                  padding: '13px 0', borderBottom: '1px solid #f2f2f2', textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            ))}

            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              {(['English', 'Indonesia'] as const).map(l => {
                const lKey = l === 'English' ? 'en' : 'id';
                const active = lang === lKey;
                return (
                  <button
                    key={l}
                    onClick={() => setLang(lKey)}
                    style={{
                      fontFamily: BARLOW_COND, fontSize: 13, fontWeight: 600,
                      padding: '7px 16px', borderRadius: 50, cursor: 'pointer',
                      border: `1.5px solid ${active ? '#1a1a1a' : '#e8e8e8'}`,
                      background: active ? '#1a1a1a' : '#fff',
                      color: active ? '#fff' : '#999',
                    }}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── SPLASH BANNER ───────────────────────────────────── */}
      <div style={{
        margin: '12px 20px 0', borderRadius: 18, overflow: 'hidden',
        position: 'relative', height: 280,
      }}>
        <img
          src="/images/nasi-uduk.jpg"
          alt="Ramayani recipes"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 24px 28px', textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: ARIAL_BLACK, fontWeight: 900, fontSize: 40,
            color: '#ffffff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
          }}>
            Recipes
          </h1>
          <p style={{
            fontFamily: BARLOW, fontSize: 13, color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.5, maxWidth: 360, margin: '0 auto',
          }}>
            {lang === 'id'
              ? 'Masakan rumahan Indonesia dari dapur Ramayani, Los Angeles.'
              : 'Classic Indonesian home cooking from Ramayani, a beloved Los Angeles kitchen.'}
          </p>
        </div>
      </div>

      {/* ── FEATURED RECIPES (no heading) ───────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, padding: '28px 20px 0',
      }}>
        {featured.map(r => (
          <div
            key={r.id}
            onClick={() => isReady(r) && router.push(`/resep/${r.id}`)}
            style={{ cursor: isReady(r) ? 'pointer' : 'default' }}
          >
            <div style={{
              aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden',
              position: 'relative', marginBottom: 8, background: '#e8e2da',
              opacity: isReady(r) ? 1 : 0.55,
            }}>
              {r.photo && (
                <img
                  src={`/images/${r.photo}`}
                  alt={name(r)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              {/* Heart */}
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 26, height: 26, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a6a5a" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              {/* Coming soon tag */}
              {!isReady(r) && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: '#1a6a5a', color: '#fff',
                  fontSize: 10, fontWeight: 600,
                  padding: '3px 8px', borderRadius: 20,
                  fontFamily: BARLOW_COND, letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Coming soon
                </div>
              )}
            </div>
            <div style={{
              fontFamily: BARLOW_COND, fontSize: 15, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.02em',
              color: isReady(r) ? '#1a6a5a' : '#aaaaaa', lineHeight: 1.2,
            }}>
              {name(r)}
            </div>
          </div>
        ))}
      </div>

      {/* ── BROWSE BY TYPE ──────────────────────────────────── */}
      <h2 id="types" style={{
        fontFamily: BARLOW_COND, fontSize: 22, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.04em', color: '#1a6a5a',
        padding: '36px 20px 16px',
      }}>
        {lang === 'id' ? 'Jenis Masakan' : 'Browse by Type'}
      </h2>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, padding: '0 20px',
      }}>
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            onClick={() => router.push(`/recipes?category=${cat.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              aspectRatio: '4/5', borderRadius: 12, overflow: 'hidden',
              marginBottom: 8, background: '#e8e2da',
            }}>
              <Img src={cat.photo} alt={CAT_LABEL(cat)} />
            </div>
            <div style={{
              fontFamily: BARLOW_COND, fontSize: 15, fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.02em',
              color: '#1a6a5a', lineHeight: 1.2,
            }}>
              {CAT_LABEL(cat)}
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        padding: '40px 20px', textAlign: 'center',
        borderTop: '1px solid #f0f0f0', marginTop: 48,
      }}>
        <span style={{
          fontFamily: BOOK_ANTIQUA,
          fontSize: 16, fontWeight: 400, letterSpacing: '0.1em', color: '#1a1a1a',
        }}>
          RAMAYANI
        </span>
      </footer>

    </div>
  );
}
