'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Trip = {
  id: string
  agency_id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  total_seats: number
  price: number
  agencies: { name: string }
}

const DISTANCE_MAP: Record<string, number> = {
  'Yaounde-Douala': 240, 'Douala-Yaounde': 240,
  'Yaounde-Bafoussam': 300, 'Bafoussam-Yaounde': 300,
  'Yaounde-Bamenda': 360, 'Bamenda-Yaounde': 360,
  'Yaounde-Kribi': 170, 'Kribi-Yaounde': 170,
  'Yaounde-Bertoua': 350, 'Bertoua-Yaounde': 350,
  'Yaounde-Ebolowa': 160, 'Ebolowa-Yaounde': 160,
  'Yaounde-Ngaoundere': 590, 'Ngaoundere-Yaounde': 590,
  'Yaounde-Garoua': 780, 'Garoua-Yaounde': 780,
  'Yaounde-Maroua': 1100, 'Maroua-Yaounde': 1100,
  'Douala-Bamenda': 330, 'Bamenda-Douala': 330,
  'Douala-Bafoussam': 250, 'Bafoussam-Douala': 250,
  'Douala-Limbe': 70, 'Limbe-Douala': 70,
  'Douala-Buea': 70, 'Buea-Douala': 70,
  'Douala-Garoua': 820, 'Garoua-Douala': 820,
}

const DURATION_MAP: Record<string, string> = {
  'Yaounde-Douala': '4h', 'Douala-Yaounde': '4h',
  'Yaounde-Bafoussam': '5h', 'Bafoussam-Yaounde': '5h',
  'Yaounde-Bamenda': '6h', 'Bamenda-Yaounde': '6h',
  'Yaounde-Kribi': '3h', 'Kribi-Yaounde': '3h',
  'Yaounde-Bertoua': '5h', 'Bertoua-Yaounde': '5h',
  'Yaounde-Ebolowa': '2h30', 'Ebolowa-Yaounde': '2h30',
  'Yaounde-Ngaoundere': '10h', 'Ngaoundere-Yaounde': '10h',
  'Yaounde-Garoua': '13h', 'Garoua-Yaounde': '13h',
  'Yaounde-Maroua': '18h', 'Maroua-Yaounde': '18h',
  'Douala-Bamenda': '5h30', 'Bamenda-Douala': '5h30',
  'Douala-Bafoussam': '4h30', 'Bafoussam-Douala': '4h30',
  'Douala-Limbe': '1h30', 'Limbe-Douala': '1h30',
  'Douala-Buea': '1h30', 'Buea-Douala': '1h30',
  'Douala-Garoua': '14h', 'Garoua-Douala': '14h',
}

function getRouteKey(origin: string, destination: string) {
  return origin + '-' + destination
}

function getClassBadge(cls: string) {
  if (cls === 'VIP') return 'nv-badge-vip'
  if (cls === 'Classic') return 'nv-badge-classic'
  return 'nv-badge-normal'
}

function formatTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString('fr-CM', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function ResultsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''
  const classFilter = searchParams.get('class') || ''

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState('all')

  const routeKey = getRouteKey(origin, destination)
  const distance = DISTANCE_MAP[routeKey]
  const duration = DURATION_MAP[routeKey]

  useEffect(() => {
    if (!origin || !destination || !date) return
    
    const dayStart = date + 'T00:00:00'
    const dayEnd = date + 'T23:59:59'

    supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('departure_time', dayStart)
      .lte('departure_time', dayEnd)
      .then(({ data }) => {
        let results = data || []
        if (classFilter) results = results.filter(t => t.bus_class === classFilter)
        setTrips(results)
        setLoading(false)
      })
  }, [origin, destination, date, classFilter])

  const filteredTrips = trips.filter(t => {
    const hour = new Date(t.departure_time).getHours()
    if (timeFilter === 'morning') return hour >= 5 && hour < 12
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 18
    if (timeFilter === 'evening') return hour >= 18
    return true
  })

  const timeFilters = [
    { key: 'all', label: 'Tous' },
    { key: 'morning', label: 'Matin (5h-12h)' },
    { key: 'afternoon', label: 'Apres-midi (12h-18h)' },
    { key: 'evening', label: 'Soir (18h+)' },
  ]

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

      {/* PAGE HEADER */}
      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '24px 0' }}>
        <div className="nv-container">
          <div className="nv-breadcrumb">
            <Link href="/" style={{ color: 'var(--nv-text-secondary)' }}>Accueil</Link>
            <span className="nv-breadcrumb-sep">/</span>
            <span>Resultats</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)' }}>
                {origin} &rarr; {destination}
              </h1>
              <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>{new Date(date).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {distance && <span>&middot; {distance} km</span>}
                {duration && <span>&middot; {duration} de trajet</span>}
              </div>
            </div>
            <Link href="/" className="nv-btn nv-btn-secondary nv-btn-sm">
              &larr; Modifier la recherche
            </Link>
          </div>
        </div>
      </div>

      <div className="nv-container" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>

          {/* SIDEBAR FILTERS */}
          <div className="nv-card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Horaires
            </div>
            {timeFilters.map(f => (
              <button
                key={f.key}
                onClick={() => setTimeFilter(f.key)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 12px', marginBottom: '4px',
                  borderRadius: 'var(--nv-radius-md)',
                  border: '1.5px solid ' + (timeFilter === f.key ? 'var(--nv-green-600)' : 'transparent'),
                  background: timeFilter === f.key ? 'var(--nv-green-50)' : 'transparent',
                  color: timeFilter === f.key ? 'var(--nv-green-700)' : 'var(--nv-text-secondary)',
                  fontSize: '13px', fontWeight: timeFilter === f.key ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--nv-font-body)',
                  transition: 'all 150ms ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* RESULTS */}
          <div>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1,2,3].map(i => (
                  <div key={i} className="nv-card" style={{ height: '100px', background: 'var(--nv-gray-100)', border: 'none' }} />
                ))}
              </div>
            ) : filteredTrips.length === 0 ? (
              <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>:(</div>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>
                  Aucun bus disponible
                </div>
                <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '24px' }}>
                  Aucun trajet trouve pour {origin} &rarr; {destination} le {date}.
                </div>
                <Link href="/" className="nv-btn nv-btn-primary">Nouvelle recherche</Link>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''}</span> disponible{filteredTrips.length > 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredTrips.map(trip => (
                    <div
                      key={trip.id}
                      className="nv-card nv-card-hover"
                      style={{ padding: '20px 24px' }}
                      onClick={() => router.push('/seats/' + trip.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>

                        {/* Agency + Route */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {trip.agencies?.name || 'Agence'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div>
                              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                                {formatTime(trip.departure_time)}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{origin}</div>
                            </div>
                            <div style={{ textAlign: 'center', flex: 1 }}>
                              <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', marginBottom: '4px' }}>{duration || ''}</div>
                              <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                                <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--nv-green-500)' }} />
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', marginTop: '4px' }}>{distance ? distance + ' km' : ''}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-500)' }}>
                                --:--
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{destination}</div>
                            </div>
                          </div>
                        </div>

                        {/* Class + Seats */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px' }}>
                          <span className={'nv-badge ' + getClassBadge(trip.bus_class)}>{trip.bus_class}</span>
                          <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{trip.total_seats} sieges</div>
                        </div>

                        {/* Price + CTA */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-green-600)', lineHeight: 1 }}>
                            {trip.price.toLocaleString('fr-CM')}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', marginBottom: '10px' }}>FCFA</div>
                          <div className="nv-btn nv-btn-primary nv-btn-sm">
                            Choisir &rarr;
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="nv-footer" style={{ marginTop: '64px' }}>
        <div className="nv-container">
          <div className="nv-footer-inner">
            <div className="nv-footer-logo">NyangaVoyage</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>&copy; 2026 NyangaVoyage</div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}




