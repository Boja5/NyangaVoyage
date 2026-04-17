'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function AgencyDashboardPage() {
  const router = useRouter()
  const [agency, setAgency] = useState<any>(null)
  const [stats, setStats] = useState({ trips: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }

    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_admin', false)
      .single()

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

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/agency/login')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>

      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
            Bonjour, {agency?.name}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
            Voici un apercu de votre activite sur NyangaVoyage
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Trajets actifs', value: stats.trips, color: 'var(--nv-green-600)', bg: 'var(--nv-green-50)', border: 'var(--nv-green-200)' },
            { label: 'Reservations confirmees', value: stats.bookings, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { label: 'Revenus totaux (FCFA)', value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-gold-600)', bg: 'var(--nv-gold-50)', border: 'var(--nv-gold-200)' },
          ].map((s, i) => (
            <div key={i} className="nv-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
            Actions rapides
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', maxWidth: '600px' }}>
            <Link href="/agency/trips" style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                  Gerer les trajets
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                  Ajouter, modifier ou supprimer vos trajets
                </div>
              </div>
            </Link>
            <Link href="/agency/bookings" style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                  Voir les reservations
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                  Consulter toutes les reservations de vos passagers
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
