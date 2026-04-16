'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
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
      <Navbar />

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
