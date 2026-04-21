'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'fr' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'fr', setLang: () => {} })

function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'fr'
  // Check browser/phone language setting
  const browserLang = navigator.language || (navigator as any).userLanguage || 'fr'
  // If browser is set to English return EN, otherwise default to FR
  if (browserLang.toLowerCase().startsWith('en')) return 'en'
  return 'fr'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Auto-detect phone/browser language on first load
    const detected = detectLanguage()
    setLangState(detected)
    setMounted(true)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
  }

  return (
    <LangContext.Provider value={{ lang: mounted ? lang : 'fr', setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
