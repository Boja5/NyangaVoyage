
/*
 * ============================================================
 * FILE: app/agency/trips/page.tsx
 * URL: /agency/trips
 * WHAT THIS FILE DOES:
 *   Lets agency staff ADD and DELETE their bus trips.
 *   This is how new trips appear in the passenger search results.
 *
 * ADDING A TRIP:
 *   The form collects: origin, destination, date, time, class, price.
 *   Seat count is automatically set based on class:
 *   Normal=70, Classic=50, VIP=33 (no manual entry needed).
 *   The date and time are combined: date + 'T' + time + ':00+00'
 *   (the +00 means UTC timezone).
 *   Then inserted into Supabase trips table with the agency's ID.
 *
 * DELETING A TRIP:
 *   First deletes all seats for that trip (foreign key constraint)
 *   Then deletes the trip itself.
 *   confirm() shows a browser dialog asking "are you sure?"
 *
 * ONLY SHOWS THIS AGENCY'S TRIPS:
 *   .eq('agency_id', ag.id) — filters to only this agency's data.
 *   An agency cannot see or modify another agency's trips.
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
