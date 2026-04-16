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

export default function AgencyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('is_admin', false)
      .single()

    if (!agency) {
      setError('Aucune agence associee a ce compte.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/agency/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>

      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>A</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
              Espace Agence
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
              Connectez-vous pour gerer vos trajets et reservations
            </p>
          </div>

          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">Adresse email</label>
                <input
                  type="email"
                  className="nv-input"
                  placeholder="agence@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">Mot de passe</label>
                <input
                  type="password"
                  className="nv-input"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="nv-alert nv-alert-error">
                  <div style={{ fontSize: '13px' }}>{error}</div>
                </div>
              )}
              <button type="submit" className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
            Vous etes administrateur ?{' '}
            <Link href="/admin/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>
              Acces admin
            </Link>
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

      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-links">
            <Link href="/agency/dashboard" className="nv-nav-link active">Tableau de bord</Link>
            <Link href="/agency/trips" className="nv-nav-link">Mes trajets</Link>
            <Link href="/agency/bookings" className="nv-nav-link">Reservations</Link>
          </div>
          <div className="nv-nav-right">
            <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{agency?.name}</span>
            <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">
              Deconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
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
`;

// ============================================================
// FILE 3: app/agency/trips/page.tsx
// ============================================================
const agencyTrips = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CITIES = ['Yaounde','Douala','Bafoussam','Bamenda','Garoua','Maroua','Ngaoundere','Bertoua','Ebolowa','Kribi','Limbe','Buea']

export default function AgencyTripsPage() {
  const router = useRouter()
  const [agency, setAgency] = useState<any>(null)
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    origin: '', destination: '', date: '', time: '',
    bus_class: 'Normal', total_seats: '70', price: '',
  })

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
    const departureTime = form.date + 'T' + form.time + ':00+00'
    const seats = form.bus_class === 'VIP' ? 33 : form.bus_class === 'Classic' ? 50 : 70
    await supabase.from('trips').insert({
      agency_id: agency.id,
      origin: form.origin,
      destination: form.destination,
      departure_time: departureTime,
      bus_class: form.bus_class,
      total_seats: seats,
      price: parseInt(form.price),
    })
    setForm({ origin: '', destination: '', date: '', time: '', bus_class: 'Normal', total_seats: '70', price: '' })
    setShowForm(false)
    setSaving(false)
    loadTrips(agency.id)
  }

  async function handleDelete(tripId: string) {
    if (!confirm('Supprimer ce trajet ? Cette action est irreversible.')) return
    await supabase.from('seats').delete().eq('trip_id', tripId)
    await supabase.from('trips').delete().eq('id', tripId)
    loadTrips(agency.id)
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-links">
            <Link href="/agency/dashboard" className="nv-nav-link">Tableau de bord</Link>
            <Link href="/agency/trips" className="nv-nav-link active">Mes trajets</Link>
            <Link href="/agency/bookings" className="nv-nav-link">Reservations</Link>
          </div>
          <div className="nv-nav-right">
            <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{agency?.name}</span>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
              Mes trajets
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
              {trips.length} trajet{trips.length !== 1 ? 's' : ''} programme{trips.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="nv-btn nv-btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Ajouter un trajet'}
          </button>
        </div>

        {/* Add trip form */}
        {showForm && (
          <div className="nv-card" style={{ padding: '28px', marginBottom: '28px', borderColor: 'var(--nv-green-200)' }}>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '20px' }}>
              Nouveau trajet
            </h2>
            <form onSubmit={handleAddTrip}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="nv-form-group">
                  <label className="nv-label">Ville de depart</label>
                  <select className="nv-select" value={form.origin} onChange={e => setForm({...form, origin: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Destination</label>
                  <select className="nv-select" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required>
                    <option value="">Choisir...</option>
                    {CITIES.filter(c => c !== form.origin).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Classe</label>
                  <select className="nv-select" value={form.bus_class} onChange={e => setForm({...form, bus_class: e.target.value})}>
                    <option value="Normal">Normal (70 sieges)</option>
                    <option value="Classic">Classic (50 sieges)</option>
                    <option value="VIP">VIP (33 sieges)</option>
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Date de depart</label>
                  <input type="date" className="nv-input" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Heure de depart</label>
                  <input type="time" className="nv-input" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Prix (FCFA)</label>
                  <input type="number" className="nv-input" placeholder="Ex: 3500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required min="500" />
                </div>
              </div>
              <button type="submit" className="nv-btn nv-btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Ajouter ce trajet'}
              </button>
            </form>
          </div>
        )}

        {/* Trips list */}
        {trips.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>Aucun trajet programme</div>
            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>Ajoutez votre premier trajet pour qu'il apparaisse dans les resultats de recherche.</div>
            <button className="nv-btn nv-btn-primary" onClick={() => setShowForm(true)}>+ Ajouter un trajet</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {trips.map(trip => (
              <div key={trip.id} className="nv-card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
                    {trip.origin} &rarr; {trip.destination}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                    {formatDate(trip.departure_time)} &middot; {formatTime(trip.departure_time)} &middot; {trip.total_seats} sieges
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={'nv-badge ' + (trip.bus_class === 'VIP' ? 'nv-badge-vip' : trip.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                    {trip.bus_class}
                  </span>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                    {trip.price.toLocaleString('fr-CM')} FCFA
                  </div>
                  <button className="nv-btn nv-btn-danger nv-btn-sm" onClick={() => handleDelete(trip.id)}>
                    Supprimer
                  </button>
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

export default function AgencyBookingsPage() {
  const router = useRouter()
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
      const { data } = await supabase
        .from('bookings')
        .select('*, trips(origin, destination, departure_time, bus_class, price, agencies(name)), seats(seat_number)')
        .in('trip_id', tripIds)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
      setBookings(data || [])
    }
    setLoading(false)
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-links">
            <Link href="/agency/dashboard" className="nv-nav-link">Tableau de bord</Link>
            <Link href="/agency/trips" className="nv-nav-link">Mes trajets</Link>
            <Link href="/agency/bookings" className="nv-nav-link active">Reservations</Link>
          </div>
          <div className="nv-nav-right">
            <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{agency?.name}</span>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
            Reservations
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
            {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} confirmee{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>Aucune reservation</div>
            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>Les reservations de vos passagers apparaitront ici.</div>
          </div>
        ) : (
          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                    {['Reference', 'Date reserv.', 'Trajet', 'Depart', 'Classe', 'Siege', 'Prix'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>
                        {b.trips?.origin} &rarr; {b.trips?.destination}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(b.trips?.departure_time)} {formatTime(b.trips?.departure_time)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                          {b.trips?.bus_class}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)' }}>N{b.seats?.seat_number}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>
                        {b.trips?.price?.toLocaleString('fr-CM')} FCFA
                      </td>
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

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    const { data: adminRecord } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', authData.user.id)
      .eq('is_admin', true)
      .single()

    if (!adminRecord) {
      setError('Acces administrateur refuse.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    router.push('/admin/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-gray-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>S</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
              Acces Administrateur
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
              Panneau de gestion NyangaVoyage
            </p>
          </div>

          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">Adresse email</label>
                <input type="email" className="nv-input" placeholder="admin@nyangavoyage.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">Mot de passe</label>
                <input type="password" className="nv-input" placeholder="Mot de passe admin" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && (
                <div className="nv-alert nv-alert-error">
                  <div style={{ fontSize: '13px' }}>{error}</div>
                </div>
              )}
              <button type="submit" className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
            <Link href="/agency/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>
              Retour espace agence
            </Link>
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

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'agencies' | 'bookings'>('overview')
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
      supabase.from('bookings').select('*, trips(price)').eq('status', 'confirmed'),
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

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newAgency.email,
      password: newAgency.password,
    })

    if (authError || !authData.user) {
      setAgencyMsg('Erreur: ' + (authError?.message || 'Impossible de creer le compte.'))
      setSavingAgency(false)
      return
    }

    await supabase.from('agencies').insert({
      name: newAgency.name,
      phone: newAgency.phone,
      user_id: authData.user.id,
      is_admin: false,
    })

    setAgencyMsg('Agence ' + newAgency.name + ' ajoutee avec succes !')
    setNewAgency({ name: '', email: '', password: '', phone: '' })
    setSavingAgency(false)
    loadData()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: tab === t ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    background: 'transparent',
    fontFamily: 'var(--nv-font-body)',
    fontSize: '14px',
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Admin
          </div>
          <div className="nv-nav-right">
            <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">
              Deconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
            Panneau d'administration
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>Gestion de la plateforme NyangaVoyage</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--nv-border)', marginBottom: '32px' }}>
          <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Vue d'ensemble</button>
          <button style={tabStyle('agencies')} onClick={() => setTab('agencies')}>Agences ({stats.agencies})</button>
          <button style={tabStyle('bookings')} onClick={() => setTab('bookings')}>Reservations ({stats.bookings})</button>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { label: 'Agences partenaires', value: stats.agencies, color: 'var(--nv-green-600)' },
                { label: 'Trajets programmes', value: stats.trips, color: '#2563eb' },
                { label: 'Reservations confirmees', value: stats.bookings, color: 'var(--nv-gold-600)' },
                { label: 'Revenus totaux (FCFA)', value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-green-700)' },
              ].map((s, i) => (
                <div key={i} className="nv-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {tab === 'agencies' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Agency list */}
              <div>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Agences enregistrees
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {agencies.map(ag => (
                    <div key={ag.id} className="nv-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--nv-gray-900)', fontSize: '15px' }}>{ag.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{ag.phone || 'Pas de telephone'}</div>
                      </div>
                      <span className={'nv-badge ' + (ag.user_id ? 'nv-badge-green' : 'nv-badge-gray')}>
                        {ag.user_id ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add agency form */}
              <div>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Ajouter une agence
                </h2>
                <div className="nv-card" style={{ padding: '24px' }}>
                  <form onSubmit={handleAddAgency} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">Nom de l'agence</label>
                      <input type="text" className="nv-input" placeholder="Ex: Express Voyages" value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} required />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Email</label>
                      <input type="email" className="nv-input" placeholder="agence@email.com" value={newAgency.email} onChange={e => setNewAgency({...newAgency, email: e.target.value})} required />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Mot de passe initial</label>
                      <input type="password" className="nv-input" placeholder="Min. 6 caracteres" value={newAgency.password} onChange={e => setNewAgency({...newAgency, password: e.target.value})} required minLength={6} />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Telephone</label>
                      <input type="tel" className="nv-input" placeholder="+237 6XXXXXXXX" value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} />
                    </div>
                    {agencyMsg && (
                      <div className={'nv-alert ' + (agencyMsg.includes('Erreur') ? 'nv-alert-error' : 'nv-alert-success')}>
                        <div style={{ fontSize: '13px' }}>{agencyMsg}</div>
                      </div>
                    )}
                    <button type="submit" className="nv-btn nv-btn-primary nv-btn-full" disabled={savingAgency}>
                      {savingAgency ? 'Enregistrement...' : 'Ajouter l\'agence'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
              Toutes les reservations
            </h2>
            {bookings.length === 0 ? (
              <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Aucune reservation</div>
              </div>
            ) : (
              <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                        {['Reference', 'Date', 'Trajet', 'Classe', 'Prix', 'Statut'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>
                            {b.trips?.origin} &rarr; {b.trips?.destination}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                              {b.trips?.bus_class}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>
                            {b.trips?.price?.toLocaleString('fr-CM')} FCFA
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="nv-badge nv-badge-green">Confirme</span>
                          </td>
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
fs.writeFileSync(path.join('app', 'agency', 'login', 'page.tsx'), agencyLogin, 'utf8');
console.log('Written: app/agency/login/page.tsx');

fs.writeFileSync(path.join('app', 'agency', 'dashboard', 'page.tsx'), agencyDashboard, 'utf8');
console.log('Written: app/agency/dashboard/page.tsx');

fs.writeFileSync(path.join('app', 'agency', 'trips', 'page.tsx'), agencyTrips, 'utf8');
console.log('Written: app/agency/trips/page.tsx');

fs.writeFileSync(path.join('app', 'agency', 'bookings', 'page.tsx'), agencyBookings, 'utf8');
console.log('Written: app/agency/bookings/page.tsx');

const adminDir = path.join('app', 'admin', 'login');
if (!fs.existsSync(adminDir)) fs.mkdirSync(adminDir, { recursive: true });
fs.writeFileSync(path.join(adminDir, 'page.tsx'), adminLogin, 'utf8');
console.log('Written: app/admin/login/page.tsx');

const adminDashDir = path.join('app', 'admin', 'dashboard');
if (!fs.existsSync(adminDashDir)) fs.mkdirSync(adminDashDir, { recursive: true });
fs.writeFileSync(path.join(adminDashDir, 'page.tsx'), adminDashboard, 'utf8');
console.log('Written: app/admin/dashboard/page.tsx');

console.log('Phase 6 complete!');
