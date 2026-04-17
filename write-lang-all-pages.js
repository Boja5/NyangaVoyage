const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/agency/login/page.tsx
// ============================================================
const agencyLogin = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Espace Agence', sub: 'Connectez-vous pour gerer vos trajets et reservations', email: 'Adresse email', password: 'Mot de passe', login: 'Se connecter', logging: 'Connexion...', error: 'Email ou mot de passe incorrect.', noAgency: 'Aucune agence associee a ce compte.', isAdmin: 'Vous etes administrateur ?', adminLink: 'Acces admin' },
  en: { title: 'Agency Portal', sub: 'Sign in to manage your trips and bookings', email: 'Email address', password: 'Password', login: 'Sign in', logging: 'Signing in...', error: 'Incorrect email or password.', noAgency: 'No agency linked to this account.', isAdmin: 'Are you an administrator?', adminLink: 'Admin access' },
}

export default function AgencyLoginPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) { setError(t.error); setLoading(false); return }
    const { data: agency } = await supabase.from('agencies').select('*').eq('user_id', authData.user.id).eq('is_admin', false).single()
    if (!agency) { setError(t.noAgency); await supabase.auth.signOut(); setLoading(false); return }
    router.push('/agency/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>A</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>
          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">{t.email}</label>
                <input type="email" className="nv-input" placeholder="agence@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">{t.password}</label>
                <input type="password" className="nv-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="nv-alert nv-alert-error"><div style={{ fontSize: '13px' }}>{error}</div></div>}
              <button type="submit" className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" disabled={loading}>{loading ? t.logging : t.login}</button>
            </form>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
            {t.isAdmin} <Link href="/admin/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{t.adminLink}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 2: app/agency/dashboard/page.tsx
// ============================================================
const agencyDashboard = `'use client'

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
`;

// ============================================================
// FILE 3: app/agency/trips/page.tsx
// ============================================================
const agencyTrips = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Mes trajets', add: '+ Ajouter un trajet', cancel: 'Annuler', newTrip: 'Nouveau trajet', from: 'Ville de depart', to: 'Destination', class: 'Classe', date: 'Date de depart', time: 'Heure de depart', price: 'Prix (FCFA)', save: 'Ajouter ce trajet', saving: 'Enregistrement...', delete: 'Supprimer', confirmDelete: 'Supprimer ce trajet ? Cette action est irreversible.', seats: 'sieges', noTrips: 'Aucun trajet programme', noTripsDesc: "Ajoutez votre premier trajet pour qu'il apparaisse dans les resultats.", normal: 'Normal (70 sieges)', classic: 'Classic (50 sieges)', vip: 'VIP (33 sieges)' },
  en: { title: 'My trips', add: '+ Add a trip', cancel: 'Cancel', newTrip: 'New trip', from: 'Departure city', to: 'Destination', class: 'Class', date: 'Departure date', time: 'Departure time', price: 'Price (FCFA)', save: 'Add this trip', saving: 'Saving...', delete: 'Delete', confirmDelete: 'Delete this trip? This action cannot be undone.', seats: 'seats', noTrips: 'No trips scheduled', noTripsDesc: 'Add your first trip to make it appear in search results.', normal: 'Normal (70 seats)', classic: 'Classic (50 seats)', vip: 'VIP (33 seats)' },
}

const CITIES = ['Yaounde','Douala','Bafoussam','Bamenda','Garoua','Maroua','Ngaoundere','Bertoua','Ebolowa','Kribi','Limbe','Buea']

export default function AgencyTripsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [agency, setAgency] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ origin: '', destination: '', date: '', time: '', bus_class: 'Normal', price: '' })

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)
    loadTrips(ag.id)
  }

  async function loadTrips(agencyId: string) {
    const { data } = await supabase.from('trips').select('*').eq('agency_id', agencyId).order('departure_time', { ascending: true })
    setTrips(data || [])
    setLoading(false)
  }

  async function handleAddTrip(e: React.FormEvent) {
    e.preventDefault()
    if (!agency) return
    setSaving(true)
    const seats = form.bus_class === 'VIP' ? 33 : form.bus_class === 'Classic' ? 50 : 70
    await supabase.from('trips').insert({ agency_id: agency.id, origin: form.origin, destination: form.destination, departure_time: form.date + 'T' + form.time + ':00+00', bus_class: form.bus_class, total_seats: seats, price: parseInt(form.price) })
    setForm({ origin: '', destination: '', date: '', time: '', bus_class: 'Normal', price: '' })
    setShowForm(false)
    setSaving(false)
    loadTrips(agency.id)
  }

  async function handleDelete(tripId: string) {
    if (!confirm(t.confirmDelete)) return
    await supabase.from('seats').delete().eq('trip_id', tripId)
    await supabase.from('trips').delete().eq('id', tripId)
    loadTrips(agency.id)
  }

  function formatTime(dt: string) { return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false }) }
  function formatDate(dt: string) { return new Date(dt).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="nv-spinner nv-spinner-lg" /></div>

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{trips.length} {lang === 'fr' ? 'trajet(s) programme(s)' : 'trip(s) scheduled'}</p>
          </div>
          <button className="nv-btn nv-btn-primary" onClick={() => setShowForm(!showForm)}>{showForm ? t.cancel : t.add}</button>
        </div>

        {showForm && (
          <div className="nv-card" style={{ padding: '28px', marginBottom: '28px', borderColor: 'var(--nv-green-200)' }}>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '20px' }}>{t.newTrip}</h2>
            <form onSubmit={handleAddTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="nv-form-group">
                  <label className="nv-label">{t.from}</label>
                  <select className="nv-select" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} required>
                    <option value="">--</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{t.to}</label>
                  <select className="nv-select" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required>
                    <option value="">--</option>
                    {CITIES.filter(c => c !== form.origin).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{t.class}</label>
                  <select className="nv-select" value={form.bus_class} onChange={e => setForm({...form, bus_class: e.target.value})}>
                    <option value="Normal">{t.normal}</option>
                    <option value="Classic">{t.classic}</option>
                    <option value="VIP">{t.vip}</option>
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{t.date}</label>
                  <input type="date" className="nv-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{t.time}</label>
                  <input type="time" className="nv-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{t.price}</label>
                  <input type="number" className="nv-input" placeholder="3500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="500" />
                </div>
              </div>
              <button type="submit" className="nv-btn nv-btn-primary" disabled={saving}>{saving ? t.saving : t.save}</button>
            </form>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.noTrips}</div>
            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>{t.noTripsDesc}</div>
            <button className="nv-btn nv-btn-primary" onClick={() => setShowForm(true)}>{t.add}</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trips.map(trip => (
              <div key={trip.id} className="nv-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{trip.origin} &rarr; {trip.destination}</div>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{formatDate(trip.departure_time)} &middot; {formatTime(trip.departure_time)} &middot; {trip.total_seats} {t.seats}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span className={'nv-badge ' + (trip.bus_class === 'VIP' ? 'nv-badge-vip' : trip.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>{trip.bus_class}</span>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{trip.price.toLocaleString('fr-CM')} FCFA</div>
                  <button className="nv-btn nv-btn-danger nv-btn-sm" onClick={() => handleDelete(trip.id)}>{t.delete}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 4: app/agency/bookings/page.tsx
// ============================================================
const agencyBookings = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Reservations', count: 'reservation(s) confirmee(s)', ref: 'Reference', date: 'Date', route: 'Trajet', departure: 'Depart', class: 'Classe', seat: 'Siege', price: 'Prix', none: 'Aucune reservation', noneDesc: 'Les reservations de vos passagers apparaitront ici.' },
  en: { title: 'Bookings', count: 'confirmed booking(s)', ref: 'Reference', date: 'Date', route: 'Route', departure: 'Departure', class: 'Class', seat: 'Seat', price: 'Price', none: 'No bookings', noneDesc: 'Your passenger bookings will appear here.' },
}

export default function AgencyBookingsPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [agency, setAgency] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)
    const { data: trips } = await supabase.from('trips').select('id').eq('agency_id', ag.id)
    const tripIds = (trips || []).map((t: any) => t.id)
    if (tripIds.length > 0) {
      const { data } = await supabase.from('bookings').select('*, trips(origin,destination,departure_time,bus_class,price), seats(seat_number)').in('trip_id', tripIds).eq('status', 'confirmed').order('created_at', { ascending: false })
      setBookings(data || [])
    }
    setLoading(false)
  }

  function fmt(dt: string) { return new Date(dt).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  function fmtTime(dt: string) { return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false }) }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="nv-spinner nv-spinner-lg" /></div>

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{t.title}</h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{bookings.length} {t.count}</p>
        </div>
        {bookings.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.none}</div>
            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.noneDesc}</div>
          </div>
        ) : (
          <div className="nv-card nv-table-wrap" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                    {[t.ref, t.date, t.route, t.departure, t.class, t.seat, t.price].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                      <td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span></td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{fmt(b.created_at)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>{b.trips?.origin} &rarr; {b.trips?.destination}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{fmt(b.trips?.departure_time)} {fmtTime(b.trips?.departure_time)}</td>
                      <td style={{ padding: '14px 16px' }}><span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>{b.trips?.bus_class}</span></td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)' }}>N{b.seats?.seat_number}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>{b.trips?.price?.toLocaleString('fr-CM')} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 5: app/admin/login/page.tsx
// ============================================================
const adminLogin = `'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Acces Administrateur', sub: 'Panneau de gestion NyangaVoyage', email: 'Adresse email', password: 'Mot de passe', login: 'Se connecter', logging: 'Connexion...', error: 'Email ou mot de passe incorrect.', denied: 'Acces administrateur refuse.', back: 'Retour espace agence' },
  en: { title: 'Administrator Access', sub: 'NyangaVoyage management panel', email: 'Email address', password: 'Password', login: 'Sign in', logging: 'Signing in...', error: 'Incorrect email or password.', denied: 'Administrator access denied.', back: 'Back to agency portal' },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) { setError(t.error); setLoading(false); return }
    const { data: adminRecord } = await supabase.from('agencies').select('*').eq('user_id', authData.user.id).eq('is_admin', true).single()
    if (!adminRecord) { setError(t.denied); await supabase.auth.signOut(); setLoading(false); return }
    router.push('/admin/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-gray-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>S</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>
          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">{t.email}</label>
                <input type="email" className="nv-input" placeholder="admin@nyangavoyage.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">{t.password}</label>
                <input type="password" className="nv-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="nv-alert nv-alert-error"><div style={{ fontSize: '13px' }}>{error}</div></div>}
              <button type="submit" className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" disabled={loading}>{loading ? t.logging : t.login}</button>
            </form>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
            <Link href="/agency/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{t.back}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 6: app/admin/dashboard/page.tsx
// ============================================================
const adminDashboard = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: "Panneau d'administration", sub: 'Gestion de la plateforme NyangaVoyage', overview: "Vue d'ensemble", agencies: 'Agences', bookings: 'Reservations', agenciesCount: 'Agences partenaires', tripsCount: 'Trajets programmes', bookingsCount: 'Reservations confirmees', revenueTotal: 'Revenus totaux (FCFA)', registeredAgencies: 'Agences enregistrees', addAgency: 'Ajouter une agence', agencyName: "Nom de l'agence", email: 'Email', password: 'Mot de passe initial', phone: 'Telephone', add: "Ajouter l'agence", adding: 'Enregistrement...', active: 'Actif', inactive: 'Inactif', ref: 'Reference', date: 'Date', route: 'Trajet', class: 'Classe', price: 'Prix', status: 'Statut', confirmed: 'Confirme', noBookings: 'Aucune reservation', logout: 'Deconnexion' },
  en: { title: 'Administration Panel', sub: 'NyangaVoyage platform management', overview: 'Overview', agencies: 'Agencies', bookings: 'Bookings', agenciesCount: 'Partner agencies', tripsCount: 'Scheduled trips', bookingsCount: 'Confirmed bookings', revenueTotal: 'Total revenue (FCFA)', registeredAgencies: 'Registered agencies', addAgency: 'Add an agency', agencyName: 'Agency name', email: 'Email', password: 'Initial password', phone: 'Phone', add: 'Add agency', adding: 'Saving...', active: 'Active', inactive: 'Inactive', ref: 'Reference', date: 'Date', route: 'Route', class: 'Class', price: 'Price', status: 'Status', confirmed: 'Confirmed', noBookings: 'No bookings', logout: 'Sign out' },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [tab, setTab] = useState<'overview'|'agencies'|'bookings'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ agencies: 0, trips: 0, bookings: 0, revenue: 0 })
  const [agencies, setAgencies] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [newAgency, setNewAgency] = useState({ name: '', email: '', password: '', phone: '' })
  const [savingAgency, setSavingAgency] = useState(false)
  const [agencyMsg, setAgencyMsg] = useState('')

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }
    const { data: adminRecord } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', true).single()
    if (!adminRecord) { router.push('/admin/login'); return }
    loadData()
  }

  async function loadData() {
    const [{ data: agList }, { data: tripList }, { data: bookList }] = await Promise.all([
      supabase.from('agencies').select('*').eq('is_admin', false),
      supabase.from('trips').select('id'),
      supabase.from('bookings').select('*, trips(price, origin, destination, bus_class, departure_time)').eq('status', 'confirmed'),
    ])
    const revenue = (bookList || []).reduce((s: number, b: any) => s + (b.trips?.price || 0), 0)
    setStats({ agencies: agList?.length || 0, trips: tripList?.length || 0, bookings: bookList?.length || 0, revenue })
    setAgencies(agList || [])
    setBookings(bookList || [])
    setLoading(false)
  }

  async function handleAddAgency(e: React.FormEvent) {
    e.preventDefault()
    setSavingAgency(true)
    setAgencyMsg('')
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: newAgency.email, password: newAgency.password })
    if (authError || !authData.user) { setAgencyMsg('Erreur: ' + (authError?.message || 'Impossible de creer le compte.')); setSavingAgency(false); return }
    await supabase.from('agencies').insert({ name: newAgency.name, phone: newAgency.phone, user_id: authData.user.id, is_admin: false })
    setAgencyMsg((lang === 'fr' ? 'Agence ' : 'Agency ') + newAgency.name + (lang === 'fr' ? ' ajoutee avec succes !' : ' added successfully!'))
    setNewAgency({ name: '', email: '', password: '', phone: '' })
    setSavingAgency(false)
    loadData()
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/admin/login') }

  function fmt(dt: string) { return new Date(dt).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="nv-spinner nv-spinner-lg" /></div>

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px', border: 'none',
    borderBottom: active ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    background: 'transparent', fontFamily: 'var(--nv-font-body)', fontSize: '14px',
    fontWeight: active ? 600 : 400, color: active ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer', transition: 'all 150ms ease',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>
          <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">{t.logout}</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--nv-border)', marginBottom: '32px', overflowX: 'auto' }}>
          <button style={tabStyle(tab === 'overview')} onClick={() => setTab('overview')}>{t.overview}</button>
          <button style={tabStyle(tab === 'agencies')} onClick={() => setTab('agencies')}>{t.agencies} ({stats.agencies})</button>
          <button style={tabStyle(tab === 'bookings')} onClick={() => setTab('bookings')}>{t.bookings} ({stats.bookings})</button>
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: t.agenciesCount,  value: stats.agencies,                        color: 'var(--nv-green-600)' },
              { label: t.tripsCount,     value: stats.trips,                           color: '#2563eb' },
              { label: t.bookingsCount,  value: stats.bookings,                        color: 'var(--nv-gold-600)' },
              { label: t.revenueTotal,   value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-green-700)' },
            ].map((s, i) => (
              <div key={i} className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'agencies' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.registeredAgencies}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {agencies.map(ag => (
                  <div key={ag.id} className="nv-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--nv-gray-900)', fontSize: '15px' }}>{ag.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{ag.phone || '—'}</div>
                    </div>
                    <span className={'nv-badge ' + (ag.user_id ? 'nv-badge-green' : 'nv-badge-gray')}>{ag.user_id ? t.active : t.inactive}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.addAgency}</h2>
              <div className="nv-card" style={{ padding: '24px' }}>
                <form onSubmit={handleAddAgency} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="nv-form-group"><label className="nv-label">{t.agencyName}</label><input type="text" className="nv-input" placeholder="Ex: Express Voyages" value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} required /></div>
                  <div className="nv-form-group"><label className="nv-label">{t.email}</label><input type="email" className="nv-input" placeholder="agence@email.com" value={newAgency.email} onChange={e => setNewAgency({...newAgency, email: e.target.value})} required /></div>
                  <div className="nv-form-group"><label className="nv-label">{t.password}</label><input type="password" className="nv-input" placeholder="Min. 6 caracteres" value={newAgency.password} onChange={e => setNewAgency({...newAgency, password: e.target.value})} required minLength={6} /></div>
                  <div className="nv-form-group"><label className="nv-label">{t.phone}</label><input type="tel" className="nv-input" placeholder="+237 6XXXXXXXX" value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} /></div>
                  {agencyMsg && <div className={'nv-alert ' + (agencyMsg.includes('Erreur') ? 'nv-alert-error' : 'nv-alert-success')}><div style={{ fontSize: '13px' }}>{agencyMsg}</div></div>}
                  <button type="submit" className="nv-btn nv-btn-primary nv-btn-full" disabled={savingAgency}>{savingAgency ? t.adding : t.add}</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.bookings}</h2>
            {bookings.length === 0 ? (
              <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}><div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>{t.noBookings}</div></div>
            ) : (
              <div className="nv-card nv-table-wrap" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                        {[t.ref, t.date, t.route, t.class, t.price, t.status].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                          <td style={{ padding: '14px 16px' }}><span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span></td>
                          <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{fmt(b.created_at)}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>{b.trips?.origin} &rarr; {b.trips?.destination}</td>
                          <td style={{ padding: '14px 16px' }}><span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>{b.trips?.bus_class}</span></td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>{b.trips?.price?.toLocaleString('fr-CM')} FCFA</td>
                          <td style={{ padding: '14px 16px' }}><span className="nv-badge nv-badge-green">{t.confirmed}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
`;

// Write all files
fs.writeFileSync(path.join('app','agency','login','page.tsx'), agencyLogin, 'utf8');
console.log('Written: app/agency/login/page.tsx');

fs.writeFileSync(path.join('app','agency','dashboard','page.tsx'), agencyDashboard, 'utf8');
console.log('Written: app/agency/dashboard/page.tsx');

fs.writeFileSync(path.join('app','agency','trips','page.tsx'), agencyTrips, 'utf8');
console.log('Written: app/agency/trips/page.tsx');

fs.writeFileSync(path.join('app','agency','bookings','page.tsx'), agencyBookings, 'utf8');
console.log('Written: app/agency/bookings/page.tsx');

const adminLoginDir = path.join('app','admin','login');
if (!fs.existsSync(adminLoginDir)) fs.mkdirSync(adminLoginDir, { recursive: true });
fs.writeFileSync(path.join(adminLoginDir,'page.tsx'), adminLogin, 'utf8');
console.log('Written: app/admin/login/page.tsx');

const adminDashDir = path.join('app','admin','dashboard');
if (!fs.existsSync(adminDashDir)) fs.mkdirSync(adminDashDir, { recursive: true });
fs.writeFileSync(path.join(adminDashDir,'page.tsx'), adminDashboard, 'utf8');
console.log('Written: app/admin/dashboard/page.tsx');

console.log('\nAll pages now support FR/EN language toggle!');
