const fs = require('fs');
const path = require('path');

// ============================================================
// 1. Permanently disable service worker
// ============================================================
fs.writeFileSync('public/sw.js', 'self.addEventListener("fetch", function(e) {});', 'utf8');
console.log('Service worker disabled permanently');

// ============================================================
// 2. Rewrite app/results/page.tsx — Bus search results
// ============================================================
const resultsPage = `'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Resultats', noResults: 'Aucun trajet trouve pour cette date.',
    tryAnother: 'Essayez une autre date ou destination.',
    depart: 'Depart', seats: 'places', book: 'Reserver',
    filters: 'Filtres', allClasses: 'Toutes les classes',
    sortBy: 'Trier par', price: 'Prix', time: 'Heure',
    normal: 'Normal', vip: 'VIP', classic: 'Classic',
    loading: 'Recherche en cours...',
    back: 'Retour',
    available: 'places disponibles',
    from: 'De', to: 'vers',
  },
  en: {
    title: 'Results', noResults: 'No trips found for this date.',
    tryAnother: 'Try another date or destination.',
    depart: 'Departure', seats: 'seats', book: 'Book',
    filters: 'Filters', allClasses: 'All classes',
    sortBy: 'Sort by', price: 'Price', time: 'Time',
    normal: 'Normal', vip: 'VIP', classic: 'Classic',
    loading: 'Searching...',
    back: 'Back',
    available: 'seats available',
    from: 'From', to: 'to',
  },
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]

  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''
  const classFilter = searchParams.get('class') || ''

  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState(classFilter)
  const [sortBy, setSortBy] = useState('time')

  useEffect(() => {
    if (!origin || !destination || !date) return
    fetchTrips()
  }, [origin, destination, date])

  async function fetchTrips() {
    setLoading(true)

    const dayStart = date + 'T00:00:00'
    const dayEnd   = date + 'T23:59:59'

    let query = supabase
      .from('trips')
      .select('*, agencies(name, id)')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('departure_time', dayStart)
      .lte('departure_time', dayEnd)
      .order('departure_time', { ascending: true })

    const { data, error } = await query
    if (!error && data) setTrips(data)
    setLoading(false)
  }

  const filtered = trips.filter(t => !selectedClass || t.bus_class === selectedClass)
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price
    return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
  })

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getBadgeClass = (cls: string) => {
    if (cls === 'VIP') return 'nv-badge-vip'
    if (cls === 'Classic') return 'nv-badge-classic'
    return 'nv-badge-normal'
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>
            &larr; {t.back}
          </Link>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(22px,5vw,30px)', fontWeight: 700, color: 'var(--nv-gray-900)', marginTop: '8px', marginBottom: '4px' }}>
            {origin} &rarr; {destination}
          </h1>
          <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
            {date && formatDate(date + 'T12:00:00')}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)' }}>{t.filters}:</div>
          {['', 'Normal', 'Classic', 'VIP'].map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--nv-radius-full)',
                border: '1.5px solid ' + (selectedClass === cls ? 'var(--nv-green-500)' : 'var(--nv-border)'),
                background: selectedClass === cls ? 'var(--nv-green-50)' : 'var(--nv-bg-surface)',
                color: selectedClass === cls ? 'var(--nv-green-700)' : 'var(--nv-text-secondary)',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--nv-font-body)',
                transition: 'all 150ms ease',
              }}
            >
              {cls || t.allClasses}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.sortBy}:</span>
            <select
              className="nv-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ width: 'auto', padding: '6px 28px 6px 10px', fontSize: '13px' }}
            >
              <option value="time">{t.time}</option>
              <option value="price">{t.price}</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '16px' }}>
            <div className="nv-spinner nv-spinner-lg" />
            <div style={{ color: 'var(--nv-text-secondary)' }}>{t.loading}</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="nv-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>&#128652;</div>
            <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>{t.noResults}</div>
            <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>{t.tryAnother}</div>
            <Link href="/" className="nv-btn nv-btn-primary">{t.back}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sorted.map((trip, i) => (
              <div key={trip.id} className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>

                  {/* Time + Route */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--nv-gray-900)', lineHeight: 1 }}>
                        {formatTime(trip.departure_time)}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{trip.origin}</div>
                    </div>

                    <div style={{ flex: 1, textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: 'var(--nv-bg-surface)', padding: '0 8px', fontSize: '16px', color: 'var(--nv-green-500)' }}>&rarr;</div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', marginTop: '6px' }}>{trip.agencies?.name}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--nv-gray-400)', lineHeight: 1 }}>--:--</div>
                      <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{trip.destination}</div>
                    </div>
                  </div>

                  {/* Class + Seats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span className={'nv-badge ' + getBadgeClass(trip.bus_class)}>{trip.bus_class}</span>
                    <span style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                      {trip.total_seats} {t.seats}
                    </span>
                  </div>

                  {/* Price + Book */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 800, color: 'var(--nv-green-600)', lineHeight: 1 }}>
                        {trip.price?.toLocaleString('fr-CM')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                    </div>
                    <button
                      className="nv-btn nv-btn-primary"
                      onClick={() => router.push('/seats/' + trip.id)}
                      style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 700 }}
                    >
                      {t.book}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
`;

const resultsDir = path.join('app', 'results');
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
fs.writeFileSync(path.join(resultsDir, 'page.tsx'), resultsPage, 'utf8');
console.log('Written: app/results/page.tsx');

console.log('\nAll done! Now run:');
console.log('1. Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue');
console.log('2. npm run dev');
console.log('3. In Chrome DevTools > Application > Service Workers > click Unregister');
console.log('4. Refresh the page');
