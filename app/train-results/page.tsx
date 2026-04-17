'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type TrainRoute = {
  from: string
  to: string
  km: number
  time: string
  depart: string
  arrive: string
  classes: TrainClass[]
}

type TrainClass = {
  name: string
  price: number
  seats: number
  badge: string
}

const TRAIN_ROUTES: TrainRoute[] = [
  {
    from: 'Douala', to: 'Yaounde', km: 263, time: '4h45',
    depart: '06:30', arrive: '11:15',
    classes: [
      { name: '2eme Classe', price: 3500,  seats: 88, badge: 'nv-badge-second' },
      { name: 'Premium',     price: 8000,  seats: 88, badge: 'nv-badge-first' },
      { name: '1ere Classe', price: 10000, seats: 64, badge: 'nv-badge-first' },
    ],
  },
  {
    from: 'Yaounde', to: 'Douala', km: 263, time: '4h45',
    depart: '17:00', arrive: '21:45',
    classes: [
      { name: '2eme Classe', price: 3500,  seats: 88, badge: 'nv-badge-second' },
      { name: 'Premium',     price: 8000,  seats: 88, badge: 'nv-badge-first' },
      { name: '1ere Classe', price: 10000, seats: 64, badge: 'nv-badge-first' },
    ],
  },
  {
    from: 'Yaounde', to: 'Ngaoundere', km: 667, time: '13h',
    depart: '18:10', arrive: '07:00+1',
    classes: [
      { name: '2eme Classe', price: 10000, seats: 88, badge: 'nv-badge-second' },
      { name: '1ere Classe', price: 17000, seats: 64, badge: 'nv-badge-first' },
      { name: 'Couchette 4', price: 25000, seats: 20, badge: 'nv-badge-couchette' },
      { name: 'Couchette 2', price: 28000, seats: 10, badge: 'nv-badge-couchette' },
    ],
  },
  {
    from: 'Ngaoundere', to: 'Yaounde', km: 667, time: '13h',
    depart: '18:20', arrive: '07:00+1',
    classes: [
      { name: '2eme Classe', price: 10000, seats: 88, badge: 'nv-badge-second' },
      { name: '1ere Classe', price: 17000, seats: 64, badge: 'nv-badge-first' },
      { name: 'Couchette 4', price: 25000, seats: 20, badge: 'nv-badge-couchette' },
      { name: 'Couchette 2', price: 28000, seats: 10, badge: 'nv-badge-couchette' },
    ],
  },
  {
    from: 'Douala', to: 'Kumba', km: 200, time: '5h',
    depart: '07:30', arrive: '12:30',
    classes: [
      { name: '2eme Classe', price: 1500, seats: 176, badge: 'nv-badge-second' },
    ],
  },
  {
    from: 'Kumba', to: 'Douala', km: 200, time: '5h',
    depart: '07:30', arrive: '12:30',
    classes: [
      { name: '2eme Classe', price: 1500, seats: 176, badge: 'nv-badge-second' },
    ],
  },
]

function TrainResultsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const origin = searchParams.get('origin') || ''
  const destination = searchParams.get('destination') || ''
  const date = searchParams.get('date') || ''
  const classFilter = searchParams.get('class') || ''

  const matchingRoutes = TRAIN_ROUTES.filter(r =>
    r.from.toLowerCase() === origin.toLowerCase() &&
    r.to.toLowerCase() === destination.toLowerCase()
  )

  const filteredRoutes = classFilter
    ? matchingRoutes.map(r => ({
        ...r,
        classes: r.classes.filter(c => c.name.toLowerCase().includes(classFilter.toLowerCase())),
      })).filter(r => r.classes.length > 0)
    : matchingRoutes

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      {/* NAVBAR */}
      <Navbar />

      {/* PAGE HEADER */}
      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '24px 0' }}>
        <div className="nv-container">
          <div className="nv-breadcrumb">
            <Link href="/" style={{ color: 'var(--nv-text-secondary)' }}>Accueil</Link>
            <span className="nv-breadcrumb-sep">/</span>
            <span>Trains disponibles</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)' }}>
                  {origin} &rarr; {destination}
                </h1>
                <span className="nv-badge nv-badge-gold">Camrail</span>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
                {date && new Date(date).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <Link href="/" className="nv-btn nv-btn-secondary nv-btn-sm">
              &larr; Modifier la recherche
            </Link>
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="nv-container" style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 40px)' }}>
        {filteredRoutes.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>
              Aucun train disponible
            </div>
            <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '24px' }}>
              Aucun trajet Camrail trouve pour {origin} &rarr; {destination}.
            </div>
            <Link href="/" className="nv-btn nv-btn-primary">Nouvelle recherche</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '860px' }}>
            <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
              <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{filteredRoutes.length} train{filteredRoutes.length > 1 ? 's' : ''}</span> disponible{filteredRoutes.length > 1 ? 's' : ''}
            </div>

            {filteredRoutes.map((route, i) => (
              <div key={i} className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Train header */}
                <div style={{ padding: '20px 24px', borderBottom: '1.5px solid var(--nv-border)', background: 'var(--nv-gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                        {route.depart}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{route.from}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginBottom: '4px' }}>{route.time}</div>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{route.km} km</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                        {route.arrive}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{route.to}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                    Camrail &middot; {route.classes.length} classe{route.classes.length > 1 ? 's' : ''} disponible{route.classes.length > 1 ? 's' : ''}
                  </div>
                </div>

                {/* Class options */}
                {route.classes.map((cls, j) => (
                  <div
                    key={j}
                    style={{
                      padding: '16px 24px',
                      borderBottom: j < route.classes.length - 1 ? '1px solid var(--nv-border)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: '12px',
                      cursor: 'pointer', transition: 'background 150ms ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--nv-green-50)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      const params = new URLSearchParams({
                        origin: route.from,
                        destination: route.to,
                        date,
                        class: cls.name,
                        depart: route.depart,
                        arrive: route.arrive,
                        duration: route.time,
                        km: String(route.km),
                        price: String(cls.price),
                      })
                      router.push('/train-seats?' + params.toString())
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={'nv-badge ' + cls.badge}>{cls.name}</span>
                      <span style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{cls.seats} places</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-green-600)', lineHeight: 1 }}>
                          {cls.price.toLocaleString('fr-CM')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>FCFA / place</div>
                      </div>
                      <div className="nv-btn nv-btn-primary nv-btn-sm">
                        Choisir &rarr;
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {/* Camrail info box */}
            <div className="nv-alert nv-alert-warning" style={{ marginTop: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Info Camrail</div>
                <div style={{ fontSize: '13px' }}>
                  Les billets 1ere classe et couchettes se vendent rapidement. Reservez 2-3 jours a l'avance. Paiement via MTN MoMo ou Orange Money uniquement.
                </div>
              </div>
            </div>
          </div>
        )}
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

export default function TrainResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <TrainResultsInner />
    </Suspense>
  )
}
