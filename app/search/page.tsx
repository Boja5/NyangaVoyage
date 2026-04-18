'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const BUS_CITIES = [
  'Yaounde', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundere', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe', 'Buea',
]

const TRAIN_STATIONS = ['Douala', 'Yaounde', 'Ngaoundere', 'Kumba']

function SearchInner() {
  const router = useRouter()
  const [mode, setMode] = useState<'bus' | 'train'>('bus')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState('')
  const [busClass, setBusClass] = useState('')
  const [trainClass, setTrainClass] = useState('')
  const [error, setError] = useState('')

  function handleSearch() {
    if (!from || !to || !date) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    if (from === to) {
      setError('La ville de depart et la destination ne peuvent pas etre identiques.')
      return
    }
    setError('')
    if (mode === 'bus') {
      const p = new URLSearchParams({ origin: from, destination: to, date, ...(busClass && { class: busClass }) })
      router.push('/results?' + p.toString())
    } else {
      const p = new URLSearchParams({ origin: from, destination: to, date, ...(trainClass && { class: trainClass }) })
      router.push('/train-results?' + p.toString())
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '14px 20px', border: 'none',
    borderBottom: active ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    background: active ? 'var(--nv-bg-surface)' : 'var(--nv-gray-50)',
    fontFamily: 'var(--nv-font-body)', fontSize: '15px',
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginBottom: '-1.5px',
  })

  const cities = mode === 'bus' ? BUS_CITIES : TRAIN_STATIONS

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SEARCH */}
      <div style={{
        background: 'linear-gradient(160deg, var(--nv-green-50) 0%, #fff 60%)',
        borderBottom: '1.5px solid var(--nv-border)',
        padding: '64px 0 56px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600), var(--nv-green-500))',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(22,163,74,0.04) 28px, rgba(22,163,74,0.04) 29px)',
          pointerEvents: 'none',
        }} />

        <div className="nv-container">
          <div style={{ marginBottom: '8px' }}>
            <Link href="/" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              &larr; Retour a l'accueil
            </Link>
          </div>

          <h1 style={{
            fontFamily: 'var(--nv-font-display)',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05,
            color: 'var(--nv-gray-900)', marginBottom: '10px', marginTop: '16px',
          }}>
            Ou allez-vous ?
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--nv-text-secondary)', marginBottom: '32px' }}>
            Recherchez parmi tous les bus et trains disponibles au Cameroun.
          </p>

          {/* Search card */}
          <div className="nv-card" style={{ maxWidth: '820px', padding: '0', overflow: 'hidden', boxShadow: 'var(--nv-shadow-lg)' }}>

            {/* Mode tabs */}
            <div style={{ display: 'flex', borderBottom: '1.5px solid var(--nv-border)' }}>
              <button style={tabStyle(mode === 'bus')} onClick={() => { setMode('bus'); setFrom(''); setTo('') }}>
                Bus
              </button>
              <button style={tabStyle(mode === 'train')} onClick={() => { setMode('train'); setFrom(''); setTo('') }}>
                Train
              </button>
            </div>

            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', alignItems: 'end' }}>
                <div className="nv-form-group">
                  <label className="nv-label">{mode === 'bus' ? 'Ville de depart' : 'Gare de depart'}</label>
                  <select className="nv-select" value={from} onChange={e => setFrom(e.target.value)}>
                    <option value="">Choisir...</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">{mode === 'bus' ? 'Destination' : 'Gare arrivee'}</label>
                  <select className="nv-select" value={to} onChange={e => setTo(e.target.value)}>
                    <option value="">Choisir...</option>
                    {cities.filter(c => c !== from).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Date</label>
                  <input
                    type="date" className="nv-input"
                    value={date} onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Classe</label>
                  {mode === 'bus' ? (
                    <select className="nv-select" value={busClass} onChange={e => setBusClass(e.target.value)}>
                      <option value="">Toutes</option>
                      <option value="Normal">Normal</option>
                      <option value="Classic">Classic</option>
                      <option value="VIP">VIP</option>
                    </select>
                  ) : (
                    <select className="nv-select" value={trainClass} onChange={e => setTrainClass(e.target.value)}>
                      <option value="">Toutes</option>
                      <option value="2nd">2eme Classe</option>
                      <option value="1st">1ere Classe</option>
                      <option value="Couchette">Couchette</option>
                    </select>
                  )}
                </div>
                <button
                  className="nv-btn nv-btn-primary nv-btn-lg"
                  onClick={handleSearch}
                  style={{ height: '42px', paddingLeft: '28px', paddingRight: '28px', whiteSpace: 'nowrap' }}
                >
                  Rechercher &rarr;
                </button>
              </div>

              {error && (
                <div className="nv-alert nv-alert-error" style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '13px' }}>{error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* POPULAR ROUTES */}
      <section className="nv-section-sm" style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '20px' }}>
            Trajets populaires
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {[
              { from: 'Yaounde', to: 'Douala', price: 3500, time: '4h' },
              { from: 'Douala', to: 'Bamenda', price: 4500, time: '5h30' },
              { from: 'Yaounde', to: 'Bafoussam', price: 4500, time: '5h' },
              { from: 'Douala', to: 'Limbe', price: 1500, time: '1h30' },
              { from: 'Yaounde', to: 'Kribi', price: 3000, time: '3h' },
              { from: 'Yaounde', to: 'Bamenda', price: 5000, time: '6h' },
            ].map((r, i) => (
              <div
                key={i}
                className="nv-card nv-card-hover"
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => {
                  setMode('bus')
                  setFrom(r.from)
                  setTo(r.to)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                    {r.from} &rarr; {r.to}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', marginTop: '2px' }}>{r.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                    {r.price.toLocaleString('fr-CM')}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nv-footer">
        <div className="nv-container">
          <div className="nv-footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="8" fill="#0f172a"/>
                <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
                <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
                <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
                <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
                <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
              </svg>
              <div className="nv-footer-logo">NyangaVoyage</div>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>&copy; 2026 NyangaVoyage</div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <SearchInner />
    </Suspense>
  )
}
