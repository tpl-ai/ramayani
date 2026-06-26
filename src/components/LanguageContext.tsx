'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'id' | 'en';

interface LangCtx {
  lang: Lang;
  toggle: () => void;
}

const LanguageContext = createContext<LangCtx>({ lang: 'id', toggle: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('id');

  useEffect(() => {
    const saved = localStorage.getItem('ramayani_lang') as Lang | null;
    if (saved === 'id' || saved === 'en') setLang(saved);
  }, []);

  const toggle = () => {
    const next: Lang = lang === 'id' ? 'en' : 'id';
    setLang(next);
    localStorage.setItem('ramayani_lang', next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
