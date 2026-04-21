const fs = require('fs');
const path = require('path');

// ============================================================
// Fix 1: Add scan card to agency dashboard
// ============================================================
const agencyDashboard = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    hello: 'Bonjour', overview: 'Voici un apercu de votre activite sur NyangaVoyage',
    trips: 'Trajets actifs', bookings: 'Reservations confirmees', revenue: 'Revenus totaux (FCFA)',
    actions: 'Actions rapides',
    manageTrips: 'Gerer les trajets', manageTripsDesc: 'Ajouter, modifier ou supprimer vos trajets',
    viewBookings: 'Voir les reservations', viewBookingsDesc: 'Consulter toutes les reservations de vos passagers',
    scanTicket: 'Scanner un billet', scanTicketDesc: 'Verifier un billet passager via QR code',
    logout: 'Deconnexion',
  },
  en: {
    hello: 'Hello', overview: 'Here is an overview of your activity on NyangaVoyage',
    trips: 'Active trips', bookings: 'Confirmed bookings', revenue: 'Total revenue (FCFA)',
    actions: 'Quick actions',
    manageTrips: 'Manage trips', manageTripsDesc: 'Add, edit or delete your trips',
    viewBookings: 'View bookings', viewBookingsDesc: 'See all passenger bookings',
    scanTicket: 'Scan a ticket', scanTicketDesc: 'Verify a passenger ticket via QR code',
    logout: 'Sign out',
  },
}

export default function AgencyDashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [agency, setAgency] = useState<any>(null)
  const [stats, setStats] = useState({ trips: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: agencyData } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!agencyData) { router.push('/agency/login'); return }
    setAgency(agencyData)
    const { data: trips } = await supabase.from('trips').select('id').eq('agency_id', agencyData.id)
    const tripIds = (trips || []).map((t: any) => t.id)
    let bookings: any[] = []
    if (tripIds.length > 0) {
      const { data } = await supabase.from('bookings').select('*, trips(price)').in('trip_id', tripIds).eq('status', 'confirmed')
      bookings = data || []
    }
    const revenue = bookings.reduce((sum: number, b: any) => sum + (b.trips?.price || 0), 0)
    setStats({ trips: trips?.length || 0, bookings: bookings.length, revenue })
    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/agency/login') }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
              {t.hello}, {agency?.name}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.overview}</p>
          </div>
          <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">{t.logout}</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: t.trips,    value: stats.trips,                           color: 'var(--nv-green-600)' },
            { label: t.bookings, value: stats.bookings,                        color: '#2563eb' },
            { label: t.revenue,  value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-gold-600)' },
          ].map((s, i) => (
            <div key={i} className="nv-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
          {t.actions}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', maxWidth: '800px' }}>

          {/* Manage trips */}
          <Link href="/agency/trips" style={{ textDecoration: 'none' }}>
            <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>&#128652;</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.manageTrips}</div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.manageTripsDesc}</div>
            </div>
          </Link>

          {/* View bookings */}
          <Link href="/agency/bookings" style={{ textDecoration: 'none' }}>
            <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>&#128203;</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.viewBookings}</div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.viewBookingsDesc}</div>
            </div>
          </Link>

          {/* Scan ticket — highlighted in green */}
          <Link href="/agency/scan" style={{ textDecoration: 'none' }}>
            <div className="nv-card nv-card-hover" style={{ padding: '24px', borderColor: 'var(--nv-green-400)', background: 'var(--nv-green-50)' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>&#9638;</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-700)', marginBottom: '6px' }}>{t.scanTicket}</div>
              <div style={{ fontSize: '13px', color: 'var(--nv-green-600)' }}>{t.scanTicketDesc}</div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(path.join('app', 'agency', 'dashboard', 'page.tsx'), agencyDashboard, 'utf8');
console.log('Written: app/agency/dashboard/page.tsx with scan button');

// ============================================================
// Fix 2: Add Scanner link to Navbar
// ============================================================
const navbar = `'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const { lang, setLang } = useLang()
  const pathname = usePathname()

  const isAgency = pathname?.startsWith('/agency')
  const isAdmin = pathname?.startsWith('/admin')

  const LogoSvg = () => (
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
  )

  const LangToggle = () => (
    <div className="nv-lang-toggle">
      <button className={'nv-lang-btn' + (lang === 'fr' ? ' active' : '')} onClick={() => setLang('fr')}>FR</button>
      <button className={'nv-lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
    </div>
  )

  if (isAgency) {
    return (
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <LogoSvg />
            <span className="nv-nav-logo">NyangaVoyage</span>
          </Link>
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
            <Link href="/agency/scan" className={'nv-nav-link' + (pathname === '/agency/scan' ? ' active' : '')} style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>
              {lang === 'fr' ? 'Scanner' : 'Scan'}
            </Link>
          </div>
          <div className="nv-nav-right">
            <LangToggle />
          </div>
        </div>
      </nav>
    )
  }

  if (isAdmin) {
    return (
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <LogoSvg />
            <span className="nv-nav-logo">NyangaVoyage</span>
          </Link>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin
          </div>
          <div className="nv-nav-right">
            <LangToggle />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <LogoSvg />
          <span className="nv-nav-logo">NyangaVoyage</span>
        </Link>
        <div className="nv-nav-links">
          <Link href="/search" className={'nv-nav-link' + (pathname === '/search' ? ' active' : '')}>
            {lang === 'fr' ? 'Trajets' : 'Routes'}
          </Link>
          <Link href="/agencies" className={'nv-nav-link' + (pathname === '/agencies' ? ' active' : '')}>
            {lang === 'fr' ? 'Agences' : 'Agencies'}
          </Link>
        </div>
        <div className="nv-nav-right">
          <LangToggle />
          <Link href="/agency/login" className="nv-btn nv-btn-primary nv-btn-sm">
            {lang === 'fr' ? 'Espace Agence' : 'Agency Portal'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
`;

fs.writeFileSync(path.join('components', 'Navbar.tsx'), navbar, 'utf8');
console.log('Written: components/Navbar.tsx with Scanner link');

console.log('\nAll done!');
console.log('- Agency dashboard now shows the green Scan button');
console.log('- Agency navbar now shows Scanner link');
console.log('- All new agencies get scanner by default via shared Navbar');
