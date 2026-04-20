
/*
 * ============================================================
 * FILE: app/agency/dashboard/page.tsx
 * URL: /agency/dashboard
 * WHAT THIS FILE DOES:
 *   The AGENCY DASHBOARD — the home screen after an agency logs in.
 *   Shows 3 stat cards:
 *   - Number of active trips
 *   - Number of confirmed bookings
 *   - Total revenue in FCFA
 *
 *   Plus 2 quick action cards linking to Trips and Bookings pages.
 *
 * AUTHENTICATION GUARD:
 *   First thing on load: checkAuth() verifies the user is logged in.
 *   If not logged in → redirect to /agency/login immediately.
 *   If logged in but not an agency → redirect to /agency/login.
 *   This prevents unauthorized access to the dashboard.
 *
 * REVENUE CALCULATION:
 *   Gets all bookings for this agency's trips, then sums up the prices:
 *   bookings.reduce((sum, b) => sum + b.trips.price, 0)
 *   "reduce" is a JavaScript function that accumulates a running total.
 * ============================================================
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { hello: 'Bonjour', overview: 'Voici un apercu de votre activite sur NyangaVoyage', trips: 'Trajets actifs', bookings: 'Reservations confirmees', revenue: 'Revenus totaux (FCFA)', actions: 'Actions rapides', manageTrips: 'Gerer les trajets', manageTripsDesc: 'Ajouter, modifier ou supprimer vos trajets', viewBookings: 'Voir les reservations', viewBookingsDesc: 'Consulter toutes les reservations de vos passagers', logout: 'Deconnexion' },
  en: { hello: 'Hello', overview: 'Here is an overview of your activity on NyangaVoyage', trips: 'Active trips', bookings: 'Confirmed bookings', revenue: 'Total revenue (FCFA)', actions: 'Quick actions', manageTrips: 'Manage trips', manageTripsDesc: 'Add, edit or delete your trips', viewBookings: 'View bookings', viewBookingsDesc: 'See all passenger bookings', logout: 'Sign out' },
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

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="nv-spinner nv-spinner-lg" /></div>

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{t.hello}, {agency?.name}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.overview}</p>
          </div>
          <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">{t.logout}</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: t.trips, value: stats.trips, color: 'var(--nv-green-600)' },
            { label: t.bookings, value: stats.bookings, color: '#2563eb' },
            { label: t.revenue, value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-gold-600)' },
          ].map((s, i) => (
            <div key={i} className="nv-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.actions}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', maxWidth: '600px' }}>
          <Link href="/agency/trips" style={{ textDecoration: 'none' }}>
            <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.manageTrips}</div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.manageTripsDesc}</div>
            </div>
          </Link>
          <Link href="/agency/bookings" style={{ textDecoration: 'none' }}>
            <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.viewBookings}</div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.viewBookingsDesc}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
