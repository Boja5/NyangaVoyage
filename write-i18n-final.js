const fs = require('fs');

const content = `'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'fr' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  mounted: boolean
}>({ lang: 'fr', setLang: () => {}, mounted: false })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nv_lang') as Lang
      if (saved === 'fr' || saved === 'en') setLangState(saved)
    } catch {}
    setMounted(true)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    try { localStorage.setItem('nv_lang', l) } catch {}
  }

  return (
    <LangContext.Provider value={{ lang, setLang, mounted }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  // Always return 'fr' until mounted to match server render
  return {
    lang: ctx.mounted ? ctx.lang : 'fr' as Lang,
    setLang: ctx.setLang,
    mounted: ctx.mounted,
  }
}
`;

fs.writeFileSync('lib/i18n.tsx', content, 'utf8');
console.log('Done: lib/i18n.tsx fixed');
