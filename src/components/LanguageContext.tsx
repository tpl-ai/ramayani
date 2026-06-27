'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Lang = 'id' | 'en';

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LangCtx>({ lang: 'id', toggle: () => {}, setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id');

  useEffect(() => {
    const saved = localStorage.getItem('ramayani_lang') as Lang | null;
    if (saved === 'id' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('ramayani_lang', l);
  };

  const toggle = () => setLang(lang === 'id' ? 'en' : 'id');

  return (
    <LanguageContext.Provider value={{ lang, toggle, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
