'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { hello: 'Bonjour', overview: 'Voici un apercu de votre activite sur NyangaVoyage', trips: 'Trajets actifs', bookings: 'Reservations confirmees', revenue: 'Revenus totaux (FCFA)', actions: 'Actions rapides', manageTrips: 'Gerer les trajets', manageTripsDesc: 'Ajouter, modifier ou supprimer vos trajets', viewBookings: 'Voir les reservations', viewBookingsDesc: 'Consulter toutes les reservations de vos passagers', scanTicket: 'Scanner un billet', scanTicketDesc: 'Verifier un billet passager via QR code', myProfile: 'Mon profil', myProfileDesc: 'Photo de profil et photos de vos bus', logout: 'Deconnexion' },
  en: { hello: 'Hello', overview: 'Here is an overview of your activity on NyangaVoyage', trips: 'Active trips', bookings: 'Confirmed bookings', revenue: 'Total revenue (FCFA)', actions: 'Quick actions', manageTrips: 'Manage trips', manageTripsDesc: 'Add, edit or delete your trips', viewBookings: 'View bookings', viewBookingsDesc: 'See all passenger bookings', scanTicket: 'Scan a ticket', scanTicketDesc: 'Verify a passenger ticket via QR code', myProfile: 'My profile', myProfileDesc: 'Profile photo and bus photos', logout: 'Sign out' },
}

export default function AgencyDashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [agency, setAgency] = useState<any>(null)
  const [stats, setStats] = useState({ trips: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)
    const saved = localStorage.getItem('agency_profile_photo_' + ag.id)
    if (saved) setProfilePhoto(saved)
    const { data: trips } = await supabase.from('trips').select('id').eq('agency_id', ag.id)
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Agency" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--nv-green-400)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nv-green-100)', border: '3px solid var(--nv-green-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--nv-green-700)', flexShrink: 0 }}>
                {agency?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '2px' }}>{t.hello}, {agency?.name}</h1>
              <p style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.overview}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">{t.logout}</button>
        </div>

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

        <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.actions}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { href: '/agency/trips',    icon: '&#128652;', title: t.manageTrips,  desc: t.manageTripsDesc,  color: 'var(--nv-gray-900)', bg: 'var(--nv-bg-surface)', border: 'var(--nv-border)' },
            { href: '/agency/bookings', icon: '&#128203;', title: t.viewBookings, desc: t.viewBookingsDesc, color: 'var(--nv-gray-900)', bg: 'var(--nv-bg-surface)', border: 'var(--nv-border)' },
            { href: '/agency/scan',     icon: '&#9638;',   title: t.scanTicket,   desc: t.scanTicketDesc,   color: 'var(--nv-green-700)', bg: 'var(--nv-green-50)', border: 'var(--nv-green-300)' },
            { href: '/agency/profile',  icon: '&#128247;', title: t.myProfile,    desc: t.myProfileDesc,    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          ].map((a, i) => (
            <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '22px', borderColor: a.border, background: a.bg }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: a.icon }} />
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: a.color, marginBottom: '5px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
