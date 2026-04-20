
/*
 * ============================================================
 * FILE: app/seats/[id]/page.tsx
 * URL: /seats/[trip-id]
 * WHAT THIS FILE DOES:
 *   This is the BUS SEAT MAP — the interactive grid where passengers
 *   choose which physical seat they want on the bus.
 *
 * THE [id] IN THE FILENAME:
 *   This is a Next.js "dynamic route". The [id] means the URL can be
 *   /seats/abc123 or /seats/xyz789 — any trip ID works.
 *   The ID is read with: params.then(p => setTripId(p.id))
 *
 * SEAT LAYOUT BY CLASS:
 *   Normal bus: 2+3 layout (2 seats left, aisle, 3 seats right) = 70 seats
 *   VIP bus:    2+2 layout (2 seats each side) = 33 seats
 *   Classic bus: 2+2 layout = 50 seats
 *   Seats 1,2,3 are permanently reserved (driver + 2 hostesses)
 *
 * REAL-TIME SEAT LOCKING:
 *   When you click a seat, it is immediately "locked" in Supabase
 *   for 10 minutes. This prevents two people booking the same seat.
 *   A countdown timer shows how long you have to complete checkout.
 *   If you don't pay, the lock expires and the seat becomes available again.
 *
 * SEAT COLORS:
 *   Green = available, Blue = your selected seat,
 *   Yellow = locked by someone else (10 min hold), Gray = already booked
 *
 * ON-DEMAND GENERATION:
 *   Seats are only created in the database when someone FIRST views
 *   the seat map. Before that, only the trip exists in the database.
 * ============================================================
 */

'use client'

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
        status: (i + 1 <= 3) ? 'booked' : 'available',
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

      <div className="nv-container" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>
        <div className='nv-seats-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>

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
          <div className='nv-seat-sidebar' style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
