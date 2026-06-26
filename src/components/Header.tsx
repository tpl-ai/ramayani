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

  const setId = () => { if (lang !== 'id') toggle(); };
  const setEn = () => { if (lang !== 'en') toggle(); };

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

        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            className={`lang-opt${lang === 'id' ? ' active' : ''}`}
            onClick={setId}
            aria-pressed={lang === 'id'}
          >
            ID
          </button>
          <span className="lang-sep" aria-hidden="true">|</span>
          <button
            className={`lang-opt${lang === 'en' ? ' active' : ''}`}
            onClick={setEn}
            aria-pressed={lang === 'en'}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
