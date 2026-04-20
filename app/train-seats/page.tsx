
/*
 * ============================================================
 * FILE: app/train-seats/page.tsx
 * URL: /train-seats?origin=X&class=Y&price=Z&...
 * WHAT THIS FILE DOES:
 *   This page lets passengers choose their TRAIN SEAT or COUCHETTE BERTH.
 *   It has two different layouts depending on the class chosen:
 *
 *   REGULAR SEATS (2nd Class, 1st Class, Premium):
 *   Shows a 2+2 seat grid (like an airplane layout).
 *   Green = available, Gray = occupied, Blue = your selection.
 *
 *   COUCHETTE BERTHS (night train):
 *   Shows compartment cards (groups of 2 or 4 berths per compartment).
 *   Each berth shows "Libre" (free) or "Occupe" (taken).
 *
 * WHY NO DATABASE FOR TRAIN SEATS:
 *   Train seat availability is simulated using a deterministic pattern
 *   (every 4th seat is "occupied") instead of real database records.
 *   This avoids needing to create thousands of seat records for trains.
 *
 * THE HYDRATION FIX:
 *   Seats are generated in useEffect (after mount) not in useState
 *   to avoid server/client mismatch errors.
 *
 * ALL DATA PASSED VIA URL:
 *   Origin, destination, class, price, departure time — everything
 *   is in the URL so no session storage is needed between pages.
 * ============================================================
 */

'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type Compartment = {
  id: number
  type: '4-bed' | '2-bed'
  berths: { number: number; available: boolean }[]
}

type Seat = {
  number: number
  available: boolean
}

function generateCompartments(className: string, total: number): Compartment[] {
  if (className.includes('Couchette 4')) {
    return Array.from({ length: Math.ceil(total / 4) }, (_, i) => ({
      id: i + 1,
      type: '4-bed' as const,
      berths: Array.from({ length: 4 }, (_, j) => ({
        number: i * 4 + j + 1,
        available: (i * 4 + j) % 3 !== 0,
      })),
    }))
  }
  if (className.includes('Couchette 2')) {
    return Array.from({ length: Math.ceil(total / 2) }, (_, i) => ({
      id: i + 1,
      type: '2-bed' as const,
      berths: Array.from({ length: 2 }, (_, j) => ({
        number: i * 2 + j + 1,
        available: (i * 2 + j) % 3 !== 0,
      })),
    }))
  }
  return []
}

function generateSeats(total: number): Seat[] {
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    available: i % 4 !== 0,
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

  const [selectedSeat, setSelectedSeat] = useState<number | null>(null)
  const [selectedCompartment, setSelectedCompartment] = useState<number | null>(null)
  const [selectedBerth, setSelectedBerth] = useState<number | null>(null)
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [seats, setSeats] = useState<Seat[]>([])
  const [ready, setReady] = useState(false)

  const totalSeats = className.includes('Couchette 4') ? 20 :
                     className.includes('Couchette 2') ? 10 :
                     className.includes('1ere') ? 64 :
                     className.includes('Premium') ? 88 : 88

  useEffect(() => {
    setCompartments(generateCompartments(className, totalSeats))
    setSeats(generateSeats(totalSeats))
    setReady(true)
  }, [className, totalSeats])

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
  const availableCount = seats.filter(s => s.available).length

  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      {/* NAVBAR */}
      <Navbar />

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

      <div className="nv-container" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>
        <div className='nv-train-seats-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>

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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
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
            {!isCouchette && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Voiture {className} &mdash; Choisissez votre place
                </div>

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px dashed var(--nv-border)', fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                    <span>Avant du train</span>
                    <span>Arriere du train</span>
                  </div>

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
                    <span style={{ fontWeight: 600, color: 'var(--nv-green-600)' }}>{availableCount}</span> places disponibles sur {seats.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className='nv-train-seat-sidebar' style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      {className}{selectedCompartment ? ' - Compartiment ' + selectedCompartment : ''}
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
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'var(--nv-gold-50)', border: '1.5px solid var(--nv-gold-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                  fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 800,
                  color: 'var(--nv-gold-700)',
                }}>
                  T
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                  {isCouchette ? 'Choisissez une couchette' : 'Choisissez votre place'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                  {isCouchette
                    ? 'Selectionnez une couchette disponible dans un compartiment.'
                    : 'Cliquez sur une place verte pour la selectionner.'}
                </div>
              </div>
            )}

            <Link href="/train-results" className="nv-btn nv-btn-secondary nv-btn-full" style={{ textAlign: 'center' }}>
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