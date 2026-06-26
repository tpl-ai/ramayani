'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLang } from './LanguageContext';

interface HeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export default function Header({ showBack, backHref }: HeaderProps) {
  const { lang, toggle } = useLang();
  const router = useRouter();

  const handleBack = () => {
    if (backHref) router.push(backHref);
    else router.back();
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          {showBack && (
            <button className="back-btn" onClick={handleBack} aria-label="Go back">
              &#8592;
            </button>
          )}
          <Link href="/" className="header-logo">Ramayani</Link>
        </div>
        <div className="header-right">
          <Link href="/" className="header-search-btn" aria-label="Search recipes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <button
            className="lang-btn-small"
            onClick={toggle}
            aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          >
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
        </div>
      </div>
    </header>
  );
}
