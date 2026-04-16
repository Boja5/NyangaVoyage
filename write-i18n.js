const fs = require('fs');

const content = `'use client'

import { createContext, useContext, useState } from 'react'

type Lang = 'fr' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'fr', setLang: () => {} })

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'fr'
  try {
    const saved = localStorage.getItem('nv_lang')
    if (saved === 'fr' || saved === 'en') return saved
  } catch {}
  return 'fr'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('nv_lang', l) } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
`;

fs.writeFileSync('lib/i18n.tsx', content, 'utf8');
console.log('Done');
