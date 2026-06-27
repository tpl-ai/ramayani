'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageContext';
import { allRecipes } from '@/lib/recipes';

const BOOK_ANTIQUA = "'Book Antiqua','Palatino Linotype',Palatino,Georgia,serif";
const ARIAL_BLACK = "'Arial Black','Arial Bold',Gadget,sans-serif";

const CATEGORIES = [
  { id: 'ayam',          label_en: 'Chicken',        label_id: 'Ayam',       photo: 'cat-chicken.jpg' },
  { id: 'daging',        label_en: 'Beef & Lamb',    label_id: 'Daging',     photo: 'cat-beef.jpg'    },
  { id: 'seafood',       label_en: 'Seafood',        label_id: 'Seafood',    photo: 'cat-seafood.jpg' },
  { id: 'nasi_mie',      label_en: 'Rice & Noodles', label_id: 'Nasi & Mie', photo: 'cat-rice.jpg'    },
  { id: 'sayuran_salad', label_en: 'Vegetables',     label_id: 'Sayuran',    photo: 'cat-veg.jpg'     },
  { id: 'sambal_saus',   label_en: 'Sambal',         label_id: 'Sambal',     photo: 'cat-sambal.jpg'  },
];

const cardImg: React.CSSProperties = {
  aspectRatio: '4/5',
  borderRadius: 14,
  overflow: 'hidden',
  position: 'relative',
  marginBottom: 14,
  background: '#e8e2da',
};

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-bc)',
  fontSize: 20,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  color: '#1a6a5a',
  lineHeight: 1.15,
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 28,
  padding: '0 24px',
};

export default function HomePage() {
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const featured = allRecipes
    .filter(r => r.featured_order != null)
    .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))
    .slice(0, 10);

  const isReady = (r: typeof featured[0]) => r.status === 'complete' || r.status === 'flagged';
  const name = (r: typeof featured[0]) => lang === 'id' ? r.name_id : (r.name_en || r.name_id);
  const catLabel = (c: typeof CATEGORIES[0]) => lang === 'id' ? c.label_id : c.label_en;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', background: '#fff' }}>

      {/* ── HEADER ── */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 24px', position: 'relative',
      }}>
        <div onClick={() => setMenuOpen(true)} style={{
          display: 'flex', flexDirection: 'column', gap: 5, cursor: 'pointer', width: 22,
        }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ height: 2, background: '#1a1a1a', borderRadius: 2, display: 'block' }} />
          ))}
        </div>

        <span style={{
          fontFamily: BOOK_ANTIQUA,
          fontSize: 22, fontWeight: 400, letterSpacing: '0.12em', color: '#1a1a1a',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        }}>
          RAMAYANI
        </span>

        <div onClick={() => router.push('/search')} style={{ cursor: 'pointer' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
      </nav>

      {/* ── HAMBURGER MENU ── */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 9,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, width: 280, minHeight: '100%',
            background: '#fff', boxShadow: '2px 0 30px rgba(0,0,0,0.12)',
            padding: 28, zIndex: 10,
          }}>
            <span onClick={() => setMenuOpen(false)} style={{
              fontSize: 22, color: '#999', cursor: 'pointer', display: 'inline-block', marginBottom: 28,
            }}>✕</span>

            {[
              { label: lang === 'id' ? 'Semua Resep'      : 'All Recipes',    href: '/recipes' },
              { label: lang === 'id' ? 'Jenis Masakan'    : 'Browse by Type', href: '#types'   },
              { label: lang === 'id' ? 'Tentang Ramayani' : 'About Ramayani', href: '/about'   },
            ].map(item => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{
                display: 'block', fontFamily: 'var(--font-bc)',
                fontSize: 16, fontWeight: 500, color: '#1a1a1a',
                padding: '13px 0', borderBottom: '1px solid #f0f0f0', textDecoration: 'none',
              }}>
                {item.label}
              </a>
            ))}

            <div style={{ marginTop: 28, display: 'flex', gap: 10 }}>
              {(['English', 'Indonesia'] as const).map(l => {
                const v = l === 'English' ? 'en' : 'id';
                const active = lang === v;
                return (
                  <button key={l} onClick={() => setLang(v)} style={{
                    fontFamily: 'var(--font-bc)', fontSize: 13, fontWeight: 600,
                    padding: '7px 16px', borderRadius: 50, cursor: 'pointer',
                    border: `1.5px solid ${active ? '#1a1a1a' : '#e8e8e8'}`,
                    background: active ? '#1a1a1a' : '#fff',
                    color: active ? '#fff' : '#999',
                  }}>
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── SPLASH ── */}
      <div style={{
        margin: '8px 24px 0', borderRadius: 16, overflow: 'hidden',
        position: 'relative', height: 320,
      }}>
        <img
          src="/images/ramayani_inside.jpg"
          alt="Ramayani restaurant"
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            objectPosition: '75% center', display: 'block',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0 32px 40px', textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-bc)', fontWeight: 700, fontSize: 28,
            color: '#ffffff', lineHeight: 1.3,
            maxWidth: 480, margin: '0 auto',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            {lang === 'id'
              ? 'Resep masakan Indonesia klasik dari Ramayani, restoran keluarga tercinta di Los Angeles.'
              : 'Classic Indonesian recipes from Ramayani, a beloved Los Angeles family restaurant.'}
          </p>
        </div>
      </div>

      {/* ── FEATURED RECIPES — no heading ── */}
      <div style={{ ...grid, paddingTop: 36 }}>
        {featured.map(r => (
          <div
            key={r.id}
            onClick={() => isReady(r) && router.push(`/resep/${r.id}`)}
            style={{ cursor: isReady(r) ? 'pointer' : 'default', opacity: isReady(r) ? 1 : 0.45 }}
          >
            <div style={cardImg}>
              {r.photo && (
                <img
                  src={`/images/${r.photo}`}
                  alt={name(r)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              {/* Heart */}
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 32, height: 32, borderRadius: '50%', background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a6a5a" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              {/* Coming soon tag */}
              {!isReady(r) && (
                <div style={{
                  position: 'absolute', top: 10, left: 10,
                  background: '#1a6a5a', color: '#fff',
                  fontFamily: 'var(--font-bc)', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 20,
                }}>
                  Coming soon
                </div>
              )}
            </div>
            <div style={{ ...cardTitle, color: isReady(r) ? '#1a6a5a' : '#aaaaaa' }}>
              {name(r)}
            </div>
          </div>
        ))}
      </div>

      {/* ── BROWSE BY TYPE ── */}
      <h2 id="types" style={{
        fontFamily: 'var(--font-bc)', fontSize: 26, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.04em',
        color: '#1a1a1a', padding: '52px 24px 24px',
      }}>
        {lang === 'id' ? 'Jenis Masakan' : 'Browse by Type'}
      </h2>

      <div style={grid}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} onClick={() => router.push(`/recipes?category=${cat.id}`)} style={{ cursor: 'pointer' }}>
            <div style={cardImg}>
              <img
                src={`/images/${cat.photo}`}
                alt={catLabel(cat)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={cardTitle}>{catLabel(cat)}</div>
          </div>
        ))}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '48px 24px', textAlign: 'center',
        borderTop: '1px solid #f0f0f0', marginTop: 52,
      }}>
        <span style={{
          fontFamily: BOOK_ANTIQUA,
          fontSize: 18, fontWeight: 400, letterSpacing: '0.12em', color: '#1a1a1a',
        }}>
          RAMAYANI
        </span>
      </footer>

    </div>
  );
}
