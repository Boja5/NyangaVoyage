'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const { lang, setLang } = useLang()
  const pathname = usePathname()

  const isAgency = pathname?.startsWith('/agency')
  const isAdmin = pathname?.startsWith('/admin')

  if (isAgency || isAdmin) {
    return (
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          {isAgency && (
            <div className="nv-nav-links">
              <Link href="/agency/dashboard" className={'nv-nav-link' + (pathname === '/agency/dashboard' ? ' active' : '')}>
                {lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}
              </Link>
              <Link href="/agency/trips" className={'nv-nav-link' + (pathname === '/agency/trips' ? ' active' : '')}>
                {lang === 'fr' ? 'Mes trajets' : 'My trips'}
              </Link>
              <Link href="/agency/bookings" className={'nv-nav-link' + (pathname === '/agency/bookings' ? ' active' : '')}>
                {lang === 'fr' ? 'Reservations' : 'Bookings'}
              </Link>
            </div>
          )}
          {isAdmin && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admin
            </div>
          )}
          <div className="nv-nav-right">
            <div className="nv-lang-toggle">
              <button className={'nv-lang-btn' + (lang === 'fr' ? ' active' : '')} onClick={() => setLang('fr')}>FR</button>
              <button className={'nv-lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
        <div className="nv-nav-links">
          <Link href="/search" className={'nv-nav-link' + (pathname === '/search' ? ' active' : '')}>
            {lang === 'fr' ? 'Trajets' : 'Routes'}
          </Link>
        </div>
        <div className="nv-nav-right">
          <div className="nv-lang-toggle">
            <button className={'nv-lang-btn' + (lang === 'fr' ? ' active' : '')} onClick={() => setLang('fr')}>FR</button>
            <button className={'nv-lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
          </div>
          <Link href="/agency/login" className="nv-btn nv-btn-primary nv-btn-sm">
            {lang === 'fr' ? 'Espace Agence' : 'Agency Portal'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
