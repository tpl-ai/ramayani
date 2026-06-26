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
          <Link href="/" className="header-logo">
            Ramayani
          </Link>
        </div>
        <button
          className="lang-btn"
          onClick={toggle}
          aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
        >
          {lang === 'id' ? 'EN' : 'ID'}
        </button>
      </div>
    </header>
  );
}
