'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const { lang } = useLang()
  const pathname = usePathname()
  const isAgency = pathname?.startsWith('/agency')
  const isAdmin  = pathname?.startsWith('/admin')

  const Logo = () => (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="8" fill="#0f172a"/>
        <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
        <line x1="16" y1="9" x2="16" y2="7" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <line x1="20" y1="10" x2="21.5" y2="8.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <line x1="12" y1="10" x2="10.5" y2="8.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
        <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
        <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
        <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
        <rect x="23" y="25" width="1.5" height="1.5" rx="0.3" fill="#fef08a"/>
        <text x="11" y="6" fontFamily="Georgia,serif" fontSize="5" fontWeight="700" fontStyle="italic" fill="#4ade80">N</text>
        <text x="16" y="6" fontFamily="Georgia,serif" fontSize="5" fontWeight="700" fontStyle="italic" fill="#fbbf24">V</text>
      </svg>
      <span className="nv-nav-logo">NyangaVoyage</span>
    </Link>
  )

  if (isAgency) return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div className="nv-nav-links">
          <Link href="/agency/dashboard" className={'nv-nav-link' + (pathname === '/agency/dashboard' ? ' active' : '')}>{lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}</Link>
          <Link href="/agency/trips"     className={'nv-nav-link' + (pathname === '/agency/trips'     ? ' active' : '')}>{lang === 'fr' ? 'Mes trajets' : 'My trips'}</Link>
          <Link href="/agency/bookings"  className={'nv-nav-link' + (pathname === '/agency/bookings'  ? ' active' : '')}>{lang === 'fr' ? 'Reservations' : 'Bookings'}</Link>
          <Link href="/agency/scan"      className={'nv-nav-link' + (pathname === '/agency/scan'      ? ' active' : '')} style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{lang === 'fr' ? 'Scanner' : 'Scan'}</Link>
          <Link href="/agency/profile"   className={'nv-nav-link' + (pathname === '/agency/profile'   ? ' active' : '')}>{lang === 'fr' ? 'Mon profil' : 'My profile'}</Link>
        </div>
        <div className="nv-nav-right" />
      </div>
    </nav>
  )

  if (isAdmin) return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</div>
        <div className="nv-nav-right" />
      </div>
    </nav>
  )

  return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div className="nv-nav-links">
          <Link href="/search"   className={'nv-nav-link' + (pathname === '/search'   ? ' active' : '')}>{lang === 'fr' ? 'Trajets' : 'Routes'}</Link>
          <Link href="/agencies" className={'nv-nav-link' + (pathname === '/agencies' ? ' active' : '')}>{lang === 'fr' ? 'Agences' : 'Agencies'}</Link>
        </div>
        <div className="nv-nav-right">
          <Link href="/agency/login" className="nv-btn nv-btn-primary nv-btn-sm">{lang === 'fr' ? 'Espace Agence' : 'Agency Portal'}</Link>
        </div>
      </div>
    </nav>
  )
}
