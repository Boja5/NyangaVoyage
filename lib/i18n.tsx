
/*
 * ============================================================
 * FILE: lib/i18n.tsx
 * WHAT THIS FILE DOES:
 *   This file powers the FR/EN LANGUAGE TOGGLE across the entire app.
 *   "i18n" stands for "internationalization" (18 letters between i and n).
 *
 *   It creates a React "Context" — think of it like a global variable
 *   that ALL pages can read and update simultaneously.
 *   When a user clicks FR or EN in the navbar, this file saves the choice
 *   to localStorage so it persists even when the page refreshes.
 *
 * HOW IT WORKS:
 *   1. LangProvider wraps the whole app (in layout.tsx)
 *   2. Any page calls useLang() to get the current language
 *   3. When setLang('en') is called, all pages update instantly
 *
 * THE MOUNTED FIX:
 *   Next.js renders pages on the SERVER first (in French).
 *   Then the browser loads and reads localStorage (might be English).
 *   If they don't match, React throws a "hydration error".
 *   Solution: always render French first, THEN switch after mount.
 *   The "mounted" flag controls this — it starts false (server safe)
 *   and becomes true only after the component loads in the browser.
 * ============================================================
 */

'use client'

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
