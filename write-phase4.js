const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/seats/[id]/page.tsx — Bus Seat Map
// ============================================================
const busSeatsPage = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Trip = {
  id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  total_seats: number
  price: number
  agencies: { name: string }
}

type Seat = {
  id: string
  seat_number: number
  status: 'available' | 'locked' | 'booked'
  locked_until: string | null
  locked_by: string | null
}

function getLayoutConfig(busClass: string) {
  if (busClass === 'VIP') return { cols: [2, 2], total: 33, label: 'VIP' }
  if (busClass === 'Classic') return { cols: [2, 2], total: 50, label: 'Classic' }
  return { cols: [2, 3], total: 70, label: 'Normal' }
}

function getSeatStatus(seat: Seat): 'available' | 'locked' | 'booked' | 'selected' {
  if (seat.status === 'booked') return 'booked'
  if (seat.status === 'locked') {
    if (seat.locked_until && new Date(seat.locked_until) > new Date()) return 'locked'
    return 'available'
  }
  return 'available'
}

export default function SeatsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [tripId, setTripId] = useState('')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [loading, setLoading] = useState(true)
  const [locking, setLocking] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))

  useEffect(() => {
    params.then(p => setTripId(p.id))
  }, [params])

  useEffect(() => {
    if (!tripId) return
    loadTripAndSeats()
  }, [tripId])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  async function loadTripAndSeats() {
    setLoading(true)
    const { data: tripData } = await supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('id', tripId)
      .single()

    if (!tripData) { setLoading(false); return }
    setTrip(tripData)

    const { data: existingSeats } = await supabase
      .from('seats')
      .select('*')
      .eq('trip_id', tripId)
      .order('seat_number')

    if (existingSeats && existingSeats.length > 0) {
      setSeats(existingSeats)
    } else {
      const layout = getLayoutConfig(tripData.bus_class)
      const newSeats = Array.from({ length: layout.total }, (_, i) => ({
        trip_id: tripId,
        seat_number: i + 1,
        status: 'available',
        locked_until: null,
        locked_by: null,
      }))
      const { data: created } = await supabase
        .from('seats')
        .insert(newSeats)
        .select()
      setSeats(created || [])
    }
    setLoading(false)
  }

  async function handleSeatClick(seat: Seat) {
    const status = getSeatStatus(seat)
    if (status === 'booked' || status === 'locked') return

    if (selectedSeat?.id === seat.id) {
      await supabase.from('seats').update({
        status: 'available', locked_until: null, locked_by: null,
      }).eq('id', seat.id)
      setSelectedSeat(null)
      setCountdown(0)
      await loadTripAndSeats()
      return
    }

    if (selectedSeat) {
      await supabase.from('seats').update({
        status: 'available', locked_until: null, locked_by: null,
      }).eq('id', selectedSeat.id)
    }

    setLocking(true)
    const lockUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    await supabase.from('seats').update({
      status: 'locked',
      locked_until: lockUntil,
      locked_by: sessionId,
    }).eq('id', seat.id)

    setSelectedSeat(seat)
    setCountdown(600)
    setLocking(false)
    await loadTripAndSeats()
  }

  function handleProceed() {
    if (!selectedSeat || !trip) return
    const params = new URLSearchParams({
      tripId: trip.id,
      seatId: selectedSeat.id,
      seatNumber: String(selectedSeat.seat_number),
    })
    router.push('/checkout?' + params.toString())
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function formatCountdown(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m + ':' + String(sec).padStart(2, '0')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  if (!trip) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)', gap: '16px' }}>
      <div style={{ fontSize: '18px', fontWeight: 600 }}>Trajet introuvable</div>
      <Link href="/" className="nv-btn nv-btn-primary">Retour</Link>
    </div>
  )

  const layout = getLayoutConfig(trip.bus_class)
  const leftCols = layout.cols[0]
  const rightCols = layout.cols[1]
  const totalCols = leftCols + rightCols + 1
  const rows = Math.ceil(layout.total / (leftCols + rightCols))

  const availableCount = seats.filter(s => getSeatStatus(s) === 'available').length
  const bookedCount = seats.filter(s => s.status === 'booked').length

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      {/* NAVBAR */}
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-right">
            <Link href="/agency/login" className="nv-btn nv-btn-secondary nv-btn-sm">Espace Agence</Link>
          </div>
        </div>
      </nav>

      {/* PROGRESS */}
      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '14px 0' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {['Recherche', 'Choix du siege', 'Paiement', 'Billet'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {i > 0 && <span style={{ color: 'var(--nv-text-muted)' }}>&rarr;</span>}
                <span style={{
                  fontWeight: i === 1 ? 600 : 400,
                  color: i === 1 ? 'var(--nv-green-600)' : i < 1 ? 'var(--nv-text-secondary)' : 'var(--nv-text-muted)',
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nv-container" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>

          {/* SEAT MAP */}
          <div>
            {/* Trip info */}
            <div className="nv-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                    {trip.origin} &rarr; {trip.destination}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '4px' }}>
                    {trip.agencies?.name} &middot; Depart {formatTime(trip.departure_time)} &middot; {new Date(trip.departure_time).toLocaleDateString('fr-CM', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={'nv-badge ' + (trip.bus_class === 'VIP' ? 'nv-badge-vip' : trip.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                    {trip.bus_class}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                      {trip.price.toLocaleString('fr-CM')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>FCFA / siege</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {[
                { color: 'var(--nv-green-50)', border: 'var(--nv-green-200)', text: 'var(--nv-green-800)', label: 'Disponible' },
                { color: '#eff6ff', border: '#bfdbfe', text: '#1e40af', label: 'Selectionne' },
                { color: 'var(--nv-gold-50)', border: 'var(--nv-gold-200)', text: 'var(--nv-gold-700)', label: 'Reserve (10 min)' },
                { color: 'var(--nv-gray-100)', border: 'var(--nv-gray-200)', text: 'var(--nv-gray-400)', label: 'Occupe' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '4px', background: l.color, border: '1.5px solid ' + l.border }} />
                  <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Bus body */}
            <div className="nv-card" style={{ padding: '24px', maxWidth: '480px' }}>
              {/* Driver */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px dashed var(--nv-border)' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '8px',
                  background: 'var(--nv-gray-200)', border: '1.5px solid var(--nv-gray-300)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                }}>
                  S
                </div>
              </div>

              {/* Seats grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: rows }, (_, rowIdx) => {
                  const leftSeats = Array.from({ length: leftCols }, (_, colIdx) => {
                    const num = rowIdx * (leftCols + rightCols) + colIdx + 1
                    return seats.find(s => s.seat_number === num)
                  }).filter(Boolean) as Seat[]

                  const rightSeats = Array.from({ length: rightCols }, (_, colIdx) => {
                    const num = rowIdx * (leftCols + rightCols) + leftCols + colIdx + 1
                    return seats.find(s => s.seat_number === num)
                  }).filter(Boolean) as Seat[]

                  return (
                    <div key={rowIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Left seats */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {leftSeats.map(seat => {
                          const status = selectedSeat?.id === seat.id ? 'selected' : getSeatStatus(seat)
                          return (
                            <div
                              key={seat.id}
                              onClick={() => !locking && handleSeatClick(seat)}
                              style={{
                                width: '44px', height: '44px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 600,
                                cursor: status === 'booked' || status === 'locked' ? 'not-allowed' : 'pointer',
                                transition: 'all 150ms ease',
                                userSelect: 'none',
                                background:
                                  status === 'selected' ? '#2563eb' :
                                  status === 'booked' ? 'var(--nv-gray-100)' :
                                  status === 'locked' ? 'var(--nv-gold-50)' :
                                  'var(--nv-green-50)',
                                border: '1.5px solid ' + (
                                  status === 'selected' ? '#1d4ed8' :
                                  status === 'booked' ? 'var(--nv-gray-200)' :
                                  status === 'locked' ? 'var(--nv-gold-200)' :
                                  'var(--nv-green-200)'
                                ),
                                color:
                                  status === 'selected' ? '#fff' :
                                  status === 'booked' ? 'var(--nv-gray-400)' :
                                  status === 'locked' ? 'var(--nv-gold-700)' :
                                  'var(--nv-green-800)',
                              }}
                            >
                              {seat.seat_number}
                            </div>
                          )
                        })}
                      </div>

                      {/* Aisle */}
                      <div style={{ width: '24px', textAlign: 'center', fontSize: '10px', color: 'var(--nv-text-muted)' }}>
                        {rowIdx + 1}
                      </div>

                      {/* Right seats */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {rightSeats.map(seat => {
                          const status = selectedSeat?.id === seat.id ? 'selected' : getSeatStatus(seat)
                          return (
                            <div
                              key={seat.id}
                              onClick={() => !locking && handleSeatClick(seat)}
                              style={{
                                width: '44px', height: '44px',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: 600,
                                cursor: status === 'booked' || status === 'locked' ? 'not-allowed' : 'pointer',
                                transition: 'all 150ms ease',
                                userSelect: 'none',
                                background:
                                  status === 'selected' ? '#2563eb' :
                                  status === 'booked' ? 'var(--nv-gray-100)' :
                                  status === 'locked' ? 'var(--nv-gold-50)' :
                                  'var(--nv-green-50)',
                                border: '1.5px solid ' + (
                                  status === 'selected' ? '#1d4ed8' :
                                  status === 'booked' ? 'var(--nv-gray-200)' :
                                  status === 'locked' ? 'var(--nv-gold-200)' :
                                  'var(--nv-green-200)'
                                ),
                                color:
                                  status === 'selected' ? '#fff' :
                                  status === 'booked' ? 'var(--nv-gray-400)' :
                                  status === 'locked' ? 'var(--nv-gold-700)' :
                                  'var(--nv-green-800)',
                              }}
                            >
                              {seat.seat_number}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Stats */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--nv-border)', display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                <span><span style={{ fontWeight: 600, color: 'var(--nv-green-600)' }}>{availableCount}</span> disponibles</span>
                <span><span style={{ fontWeight: 600, color: 'var(--nv-gray-600)' }}>{bookedCount}</span> occupes</span>
                <span><span style={{ fontWeight: 600, color: 'var(--nv-gray-700)' }}>{seats.length}</span> sieges total</span>
              </div>
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {selectedSeat ? (
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Siege selectionne
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '10px',
                    background: '#2563eb', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700,
                  }}>
                    {selectedSeat.seat_number}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Siege N&deg; {selectedSeat.seat_number}</div>
                    <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{trip.bus_class}</div>
                  </div>
                </div>

                {countdown > 0 && (
                  <div className="nv-alert nv-alert-warning" style={{ marginBottom: '16px', padding: '10px 14px' }}>
                    <div style={{ fontSize: '13px' }}>
                      Reserve pour <span style={{ fontWeight: 700 }}>{formatCountdown(countdown)}</span>
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--nv-border)', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '6px' }}>
                    <span>Prix du billet</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{trip.price.toLocaleString('fr-CM')} FCFA</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                    <span>Siege</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>N&deg; {selectedSeat.seat_number}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                    {trip.price.toLocaleString('fr-CM')} FCFA
                  </span>
                </div>

                <button className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" onClick={handleProceed}>
                  Continuer vers le paiement &rarr;
                </button>
              </div>
            ) : (
              <div className="nv-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nv-green-50)', border: '1.5px solid var(--nv-green-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px' }}>
                  S
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                  Choisissez votre siege
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                  Cliquez sur un siege vert pour le selectionner.
                </div>
              </div>
            )}

            <Link href="javascript:history.back()" className="nv-btn nv-btn-secondary nv-btn-full" style={{ textAlign: 'center' }}>
              &larr; Retour aux resultats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 2: app/train-seats/page.tsx — Train Seat Map
// ============================================================
const trainSeatsPage = `'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

type BerthType = '4-bed' | '2-bed' | 'seat'

type Compartment = {
  id: number
  type: BerthType
  berths: { number: number; available: boolean }[]
}

function generateCompartments(className: string, totalSeats: number): Compartment[] {
  if (className.includes('Couchette 4')) {
    return Array.from({ length: Math.ceil(totalSeats / 4) }, (_, i) => ({
      id: i + 1,
      type: '4-bed',
      berths: Array.from({ length: 4 }, (_, j) => ({
        number: i * 4 + j + 1,
        available: Math.random() > 0.3,
      })),
    }))
  }
  if (className.includes('Couchette 2')) {
    return Array.from({ length: Math.ceil(totalSeats / 2) }, (_, i) => ({
      id: i + 1,
      type: '2-bed',
      berths: Array.from({ length: 2 }, (_, j) => ({
        number: i * 2 + j + 1,
        available: Math.random() > 0.3,
      })),
    }))
  }
  return []
}

function generateSeats(total: number) {
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    available: Math.random() > 0.25,
  }))
}

function TrainSeatsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''
  const className = searchParams.get('class') || ''
  const depart = searchParams.get('depart') || ''
  const arrive = searchParams.get('arrive') || ''
  const duration = searchParams.get('duration') || ''
  const km = searchParams.get('km') || ''
  const price = parseInt(searchParams.get('price') || '0')

  const isCouchette = className.includes('Couchette')
  const isRegularSeat = !isCouchette

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [selectedCompartment, setSelectedCompartment] = useState<number | null>(null)
  const [selectedBerth, setSelectedBerth] = useState<number | null>(null)

  const totalSeats = className.includes('Couchette 4') ? 20 :
                     className.includes('Couchette 2') ? 10 :
                     className.includes('1ere') ? 64 :
                     className.includes('Premium') ? 88 : 88

  const [compartments] = useState(() => generateCompartments(className, totalSeats))
  const [seats] = useState(() => generateSeats(totalSeats))

  function handleProceed() {
    if (!selectedSeat && !selectedBerth) return
    const params = new URLSearchParams({
      type: 'train',
      origin,
      destination,
      date,
      class: className,
      depart,
      arrive,
      duration,
      km,
      price: String(price),
      seat: String(selectedSeat || selectedBerth),
      compartment: String(selectedCompartment || ''),
    })
    router.push('/train-checkout?' + params.toString())
  }

  const hasSelection = selectedSeat !== null || selectedBerth !== null

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      {/* NAVBAR */}
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-right">
            <span className="nv-badge nv-badge-gold">Camrail</span>
          </div>
        </div>
      </nav>

      {/* PROGRESS */}
      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '14px 0' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {['Recherche', 'Choix de la place', 'Paiement', 'Billet'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {i > 0 && <span style={{ color: 'var(--nv-text-muted)' }}>&rarr;</span>}
                <span style={{
                  fontWeight: i === 1 ? 600 : 400,
                  color: i === 1 ? 'var(--nv-green-600)' : i < 1 ? 'var(--nv-text-secondary)' : 'var(--nv-text-muted)',
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nv-container" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>

          {/* MAIN */}
          <div>
            {/* Trip summary */}
            <div className="nv-card" style={{ padding: '20px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                    {origin} &rarr; {destination}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '4px' }}>
                    Camrail &middot; Depart {depart} &middot; Arrivee {arrive} &middot; {duration} &middot; {km} km
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={'nv-badge ' + (
                    className.includes('Couchette') ? 'nv-badge-couchette' :
                    className.includes('1ere') || className.includes('Premium') ? 'nv-badge-first' :
                    'nv-badge-second'
                  )}>{className}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                      {price.toLocaleString('fr-CM')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>FCFA / place</div>
                  </div>
                </div>
              </div>
            </div>

            {/* COUCHETTE LAYOUT */}
            {isCouchette && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Compartiments {className} &mdash; Choisissez une couchette
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {compartments.map(comp => (
                    <div key={comp.id} className="nv-card" style={{
                      padding: '16px',
                      borderColor: selectedCompartment === comp.id ? 'var(--nv-green-400)' : 'var(--nv-border)',
                      background: selectedCompartment === comp.id ? 'var(--nv-green-50)' : 'var(--nv-bg-surface)',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Compartiment {comp.id}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {comp.berths.map(berth => (
                          <div
                            key={berth.number}
                            onClick={() => {
                              if (!berth.available) return
                              setSelectedCompartment(comp.id)
                              setSelectedBerth(berth.number)
                              setSelectedSeat(null)
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: berth.available ? 'pointer' : 'not-allowed',
                              background:
                                selectedBerth === berth.number && selectedCompartment === comp.id ? '#2563eb' :
                                !berth.available ? 'var(--nv-gray-100)' :
                                'var(--nv-green-50)',
                              border: '1.5px solid ' + (
                                selectedBerth === berth.number && selectedCompartment === comp.id ? '#1d4ed8' :
                                !berth.available ? 'var(--nv-gray-200)' :
                                'var(--nv-green-200)'
                              ),
                              transition: 'all 150ms ease',
                            }}
                          >
                            <span style={{
                              fontSize: '13px', fontWeight: 600,
                              color:
                                selectedBerth === berth.number && selectedCompartment === comp.id ? '#fff' :
                                !berth.available ? 'var(--nv-gray-400)' :
                                'var(--nv-green-800)',
                            }}>
                              Couchette {berth.number}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color:
                                selectedBerth === berth.number && selectedCompartment === comp.id ? 'rgba(255,255,255,0.8)' :
                                !berth.available ? 'var(--nv-gray-400)' :
                                'var(--nv-green-600)',
                            }}>
                              {berth.available ? 'Libre' : 'Occupe'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REGULAR SEAT LAYOUT */}
            {isRegularSeat && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Voiture {className} &mdash; Choisissez votre place
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  {[
                    { color: 'var(--nv-green-50)', border: 'var(--nv-green-200)', label: 'Disponible' },
                    { color: '#eff6ff', border: '#bfdbfe', label: 'Selectionne' },
                    { color: 'var(--nv-gray-100)', border: 'var(--nv-gray-200)', label: 'Occupe' },
                  ].map((l, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '4px', background: l.color, border: '1.5px solid ' + l.border }} />
                      <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{l.label}</span>
                    </div>
                  ))}
                </div>

                <div className="nv-card" style={{ padding: '24px', maxWidth: '520px' }}>
                  {/* Train header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px dashed var(--nv-border)', fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                    <span>Avant du train</span>
                    <span>Arriere du train</span>
                  </div>

                  {/* Seats in 2+2 layout */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {Array.from({ length: Math.ceil(seats.length / 4) }, (_, rowIdx) => {
                      const rowSeats = seats.slice(rowIdx * 4, rowIdx * 4 + 4)
                      const left = rowSeats.slice(0, 2)
                      const right = rowSeats.slice(2, 4)
                      return (
                        <div key={rowIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {left.map(seat => (
                              <div
                                key={seat.number}
                                onClick={() => seat.available && setSelectedSeat(seat.number)}
                                style={{
                                  width: '44px', height: '44px', borderRadius: '8px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '11px', fontWeight: 600,
                                  cursor: seat.available ? 'pointer' : 'not-allowed',
                                  transition: 'all 150ms ease',
                                  background:
                                    selectedSeat === seat.number ? '#2563eb' :
                                    !seat.available ? 'var(--nv-gray-100)' :
                                    'var(--nv-green-50)',
                                  border: '1.5px solid ' + (
                                    selectedSeat === seat.number ? '#1d4ed8' :
                                    !seat.available ? 'var(--nv-gray-200)' :
                                    'var(--nv-green-200)'
                                  ),
                                  color:
                                    selectedSeat === seat.number ? '#fff' :
                                    !seat.available ? 'var(--nv-gray-400)' :
                                    'var(--nv-green-800)',
                                }}
                              >
                                {seat.number}
                              </div>
                            ))}
                          </div>
                          <div style={{ width: '24px', textAlign: 'center', fontSize: '10px', color: 'var(--nv-text-muted)' }}>
                            {rowIdx + 1}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {right.map(seat => (
                              <div
                                key={seat.number}
                                onClick={() => seat.available && setSelectedSeat(seat.number)}
                                style={{
                                  width: '44px', height: '44px', borderRadius: '8px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '11px', fontWeight: 600,
                                  cursor: seat.available ? 'pointer' : 'not-allowed',
                                  transition: 'all 150ms ease',
                                  background:
                                    selectedSeat === seat.number ? '#2563eb' :
                                    !seat.available ? 'var(--nv-gray-100)' :
                                    'var(--nv-green-50)',
                                  border: '1.5px solid ' + (
                                    selectedSeat === seat.number ? '#1d4ed8' :
                                    !seat.available ? 'var(--nv-gray-200)' :
                                    'var(--nv-green-200)'
                                  ),
                                  color:
                                    selectedSeat === seat.number ? '#fff' :
                                    !seat.available ? 'var(--nv-gray-400)' :
                                    'var(--nv-green-800)',
                                }}
                              >
                                {seat.number}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--nv-border)', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--nv-green-600)' }}>{seats.filter(s => s.available).length}</span> places disponibles sur {seats.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {hasSelection ? (
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  Place selectionnee
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '10px',
                    background: '#2563eb', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700,
                  }}>
                    {selectedSeat || selectedBerth}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>
                      {isCouchette ? 'Couchette N' : 'Place N'}&deg; {selectedSeat || selectedBerth}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                      {className}
                      {selectedCompartment && ' &middot; Compartiment ' + selectedCompartment}
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--nv-border)', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '6px' }}>
                    <span>Trajet</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{origin} &rarr; {destination}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '6px' }}>
                    <span>Depart</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{depart}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                    <span>Classe</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{className}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                    {price.toLocaleString('fr-CM')} FCFA
                  </span>
                </div>

                <button className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" onClick={handleProceed}>
                  Continuer vers le paiement &rarr;
                </button>
              </div>
            ) : (
              <div className="nv-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nv-gold-50)', border: '1.5px solid var(--nv-gold-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gold-700)' }}>
                  T
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                  {isCouchette ? 'Choisissez une couchette' : 'Choisissez votre place'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                  {isCouchette ? 'Selectionnez une couchette disponible dans un compartiment.' : 'Cliquez sur une place verte pour la selectionner.'}
                </div>
              </div>
            )}

            <Link href="javascript:history.back()" className="nv-btn nv-btn-secondary nv-btn-full" style={{ textAlign: 'center' }}>
              &larr; Retour aux trains
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainSeatsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <TrainSeatsInner />
    </Suspense>
  )
}
`;

// Write bus seats file
const busSeatsDir = path.join('app', 'seats', '[id]');
if (!fs.existsSync(busSeatsDir)) {
  fs.mkdirSync(busSeatsDir, { recursive: true });
}
fs.writeFileSync(path.join(busSeatsDir, 'page.tsx'), busSeatsPage, 'utf8');
console.log('Written: app/seats/[id]/page.tsx');

// Write train seats file
const trainSeatsDir = path.join('app', 'train-seats');
if (!fs.existsSync(trainSeatsDir)) {
  fs.mkdirSync(trainSeatsDir, { recursive: true });
}
fs.writeFileSync(path.join(trainSeatsDir, 'page.tsx'), trainSeatsPage, 'utf8');
console.log('Written: app/train-seats/page.tsx');

console.log('Phase 4 complete!');
