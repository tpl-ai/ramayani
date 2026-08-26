'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from './LanguageContext';

const NAV_ITEMS = [
  { label: 'RECIPES', href: '/recipes' },
  { label: 'ABOUT', href: '/about' },
  { label: 'SHOP', href: '#' },
];

const HELVETICA = 'Helvetica Neue, Helvetica, Arial, sans-serif';

// Reads/writes the shared LanguageContext directly rather than taking
// lang/setLang as props -- every page used to keep its own separate
// useState('EN') just to hand to this component, disconnected from the
// context that actually drives what content renders (tx(), t(), etc. all
// read useLang()'s lang). Clicking EN/ID visibly changed which button was
// highlighted here but never touched the page content -- this is the fix,
// in the one place responsible for the toggle, rather than in every page.
export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const goHome = () => { setMenuOpen(false); router.push('/'); };
  const goSearch = () => { setMenuOpen(false); router.push('/search'); };

  return (
    <header style={{
      position: 'sticky',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 48px', borderBottom: '1px solid #e8e8e8',
      background: '#fff', top: 0, zIndex: 100,
    }}>
      <span onClick={goHome} className="header-logo" style={{
        fontFamily: 'Libre Baskerville, Baskerville, Georgia, serif',
        fontWeight: 400,
        color: '#cc0000', cursor: 'pointer', textTransform: 'uppercase',
      }}>
        Ramayani
      </span>

      {/* Desktop nav — hidden below 768px via .header-nav-desktop in globals.css */}
      <nav className="header-nav-desktop" style={{ alignItems: 'center', gap: 32 }}>
        {NAV_ITEMS.map(item => (
          <a key={item.label} href={item.href} style={{
            fontFamily: HELVETICA,
            fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
            color: '#1a1a1a', textDecoration: 'none',
          }}>{item.label}</a>
        ))}
        <svg onClick={goSearch} width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#1a1a1a" strokeWidth="1.8" style={{ cursor: 'pointer' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['en', 'id'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              fontSize: 11, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#cc0000' : '#999',
              background: 'none', border: lang === l ? '1px solid #cc0000' : 'none',
              padding: '2px 6px', cursor: 'pointer',
              fontFamily: HELVETICA,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </nav>

      {/* Mobile controls — search + hamburger, hidden at 768px+ via .header-mobile-controls */}
      <div className="header-mobile-controls" style={{ alignItems: 'center', gap: 20 }}>
        <svg onClick={goSearch} width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#1a1a1a" strokeWidth="1.8" style={{ cursor: 'pointer' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <button
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(o => !o)}
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5,
            width: 22, height: 18, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          }}
        >
          <span style={{
            display: 'block', height: 2, width: '100%', background: '#1a1a1a',
            transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
            transition: 'transform 0.2s ease',
          }} />
          <span style={{
            display: 'block', height: 2, width: '100%', background: '#1a1a1a',
            opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s ease',
          }} />
          <span style={{
            display: 'block', height: 2, width: '100%', background: '#1a1a1a',
            transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            transition: 'transform 0.2s ease',
          }} />
        </button>
      </div>

      {/* Dimmed overlay behind the drawer — tap to close */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease', zIndex: 98,
        }}
      />

      {/* Right-anchored slide-in drawer — ~78% width, page visible behind it */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '78%', maxWidth: 340,
        background: '#fff', zIndex: 99, boxShadow: menuOpen ? '-6px 0 24px rgba(0,0,0,0.18)' : 'none',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s ease',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        padding: '20px 28px 32px',
      }}>
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          style={{
            alignSelf: 'flex-end', background: 'none', border: 'none',
            padding: 6, marginBottom: 16, cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {NAV_ITEMS.map(item => (
          <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)} style={{
            fontFamily: HELVETICA,
            fontSize: 16, fontWeight: 400, letterSpacing: '0.02em',
            color: '#1a1a1a', textDecoration: 'none',
            padding: '14px 0', borderBottom: '1px solid #f0f0f0',
          }}>{item.label}</a>
        ))}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 24 }}>
          {(['en', 'id'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              fontSize: 13, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#cc0000' : '#999',
              background: 'none', border: `1px solid ${lang === l ? '#cc0000' : '#e8e8e8'}`,
              padding: '6px 14px', cursor: 'pointer',
              fontFamily: HELVETICA,
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </header>
  );
}
