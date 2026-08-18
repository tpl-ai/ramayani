'use client';

import { useRouter } from 'next/navigation';

interface HeaderProps {
  lang: 'EN' | 'ID';
  setLang: (lang: 'EN' | 'ID') => void;
}

export default function Header({ lang, setLang }: HeaderProps) {
  const router = useRouter();

  return (
    <header style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 48px', borderBottom: '1px solid #e8e8e8',
      background: '#fff', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <span onClick={() => router.push('/')} style={{
        fontFamily: 'Libre Baskerville, Baskerville, Georgia, serif',
        fontSize: 36, fontWeight: 400, letterSpacing: '0.40em',
        color: '#cc0000', cursor: 'pointer', textTransform: 'uppercase',
      }}>
        Ramayani
      </span>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        {[{ label: 'RECIPES', href: '/recipes' }, { label: 'ABOUT', href: '/about' }, { label: 'SHOP', href: '#' }].map(item => (
          <a key={item.label} href={item.href} style={{
            fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            fontSize: 12, fontWeight: 500, letterSpacing: '0.1em',
            color: '#1a1a1a', textDecoration: 'none',
          }}>{item.label}</a>
        ))}
        <svg onClick={() => router.push('/search')} width="18" height="18" viewBox="0 0 24 24"
          fill="none" stroke="#1a1a1a" strokeWidth="1.8" style={{ cursor: 'pointer' }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {(['EN', 'ID'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              fontSize: 11, fontWeight: lang === l ? 700 : 400,
              color: lang === l ? '#cc0000' : '#999',
              background: 'none', border: lang === l ? '1px solid #cc0000' : 'none',
              padding: '2px 6px', cursor: 'pointer',
              fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
            }}>{l}</button>
          ))}
        </div>
      </nav>
    </header>
  );
}
