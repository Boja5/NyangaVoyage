
/*
 * ============================================================
 * FILE: app/agencies/page.tsx
 * URL: /agencies
 * WHAT THIS FILE DOES:
 *   The AGENCIES & OPERATORS INFO PAGE — a comprehensive directory
 *   of all transport operators available on NyangaVoyage.
 *
 *   BUS TAB shows 3 agencies:
 *   - Buca Voyages (green theme, 45 buses, since 2008)
 *   - Garanti Express (blue theme, 30 buses, since 2012)
 *   - Vatican Express (gold theme, 25 buses, since 2015)
 *   Clicking an agency expands to show: all classes (Normal/Classic/VIP)
 *   with seat counts, layouts, and amenities; plus all routes with times.
 *
 *   TRAIN TAB shows Camrail with 3 lines:
 *   - Douala-Yaounde Express (263km, 4h45, daily)
 *   - Yaounde-Ngaoundere Night Train (667km, 13h, couchettes)
 *   - Douala-Kumba Omnibus (200km, 5h)
 *   Clicking a line shows: departure times, all stops, all classes.
 *
 * THE ACCORDION PATTERN:
 *   selectedAgency state stores which agency is expanded.
 *   Clicking the same agency again collapses it (sets to null).
 *   This is called an "accordion" or "expand/collapse" UI pattern.
 *
 * ALL DATA IS HARDCODED:
 *   Agency info, routes, and amenities are defined as constants
 *   at the top of the file (BUS_AGENCIES, TRAIN_LINES arrays).
 * ============================================================
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Nos Agences & Operateurs',
    sub: 'Decouvrez tous les operateurs de transport disponibles sur NyangaVoyage',
    bus: 'Bus',
    train: 'Train',
    routes: 'Itineraires',
    schedule: 'Horaires',
    classes: 'Classes',
    busSize: 'Capacite',
    departure: 'Depart',
    price: 'A partir de',
    fcfa: 'FCFA',
    allRoutes: 'Tous les itineraires',
    seats: 'sieges',
    viewAll: 'Voir tous les trajets',
    operator: 'Operateur',
    trainInfo: 'Informations Camrail',
    trainDesc: 'Camrail est le seul operateur ferroviaire du Cameroun. Il dessert 3 grandes lignes au depart de Douala et Yaounde.',
    line: 'Ligne',
    duration: 'Duree',
    frequency: 'Frequence',
    daily: 'Quotidien',
    classesAvail: 'Classes disponibles',
    amenities: 'Services a bord',
    busAmenities: 'Services',
    normal: 'Normal',
    classic: 'Classic',
    vip: 'VIP',
  },
  en: {
    title: 'Our Agencies & Operators',
    sub: 'Discover all transport operators available on NyangaVoyage',
    bus: 'Bus',
    train: 'Train',
    routes: 'Routes',
    schedule: 'Schedule',
    classes: 'Classes',
    busSize: 'Capacity',
    departure: 'Departure',
    price: 'From',
    fcfa: 'FCFA',
    allRoutes: 'All routes',
    seats: 'seats',
    viewAll: 'View all trips',
    operator: 'Operator',
    trainInfo: 'Camrail Information',
    trainDesc: 'Camrail is the only railway operator in Cameroon. It serves 3 major lines from Douala and Yaounde.',
    line: 'Line',
    duration: 'Duration',
    frequency: 'Frequency',
    daily: 'Daily',
    classesAvail: 'Available classes',
    amenities: 'On-board services',
    busAmenities: 'Services',
    normal: 'Normal',
    classic: 'Classic',
    vip: 'VIP',
  },
}

const BUS_AGENCIES = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'Buca Voyages',
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    founded: '2008',
    fleet: 45,
    description: { fr: 'Pionniere du transport interurbain au Cameroun. Buca Voyages est reconnue pour sa ponctualite et son confort.', en: 'Pioneer of intercity transport in Cameroon. Buca Voyages is known for its punctuality and comfort.' },
    classes: [
      { name: 'Normal', seats: 70, layout: '2+3', price: 3500, amenities: { fr: ['Climatisation', 'Sieges reclinables'], en: ['Air conditioning', 'Reclining seats'] } },
      { name: 'Classic', seats: 50, layout: '2+2', price: 5000, amenities: { fr: ['Climatisation', 'Sieges larges', 'Chargeur USB'], en: ['Air conditioning', 'Wide seats', 'USB charger'] } },
      { name: 'VIP', seats: 33, layout: '2+2', price: 6000, amenities: { fr: ['Climatisation premium', 'Sieges cuir', 'Chargeur USB', 'Eau offerte'], en: ['Premium AC', 'Leather seats', 'USB charger', 'Free water'] } },
    ],
    routes: [
      { from: 'Yaounde', to: 'Douala', times: ['06:00', '09:00', '12:00', '15:00'], price: 3500 },
      { from: 'Douala', to: 'Yaounde', times: ['06:30', '09:00', '13:00'], price: 3500 },
      { from: 'Yaounde', to: 'Bamenda', times: ['06:00', '08:00'], price: 5000 },
      { from: 'Yaounde', to: 'Bafoussam', times: ['06:00', '09:00'], price: 4500 },
      { from: 'Yaounde', to: 'Kribi', times: ['07:00'], price: 3000 },
      { from: 'Yaounde', to: 'Bertoua', times: ['06:00'], price: 5000 },
      { from: 'Yaounde', to: 'Ngaoundere', times: ['05:00'], price: 7500 },
      { from: 'Yaounde', to: 'Garoua', times: ['05:00'], price: 8500 },
      { from: 'Yaounde', to: 'Ebolowa', times: ['07:00'], price: 2500 },
      { from: 'Douala', to: 'Limbe', times: ['07:00', '10:00'], price: 1500 },
      { from: 'Douala', to: 'Buea', times: ['07:00'], price: 1500 },
      { from: 'Douala', to: 'Bafoussam', times: ['06:00'], price: 4000 },
    ],
  },
  {
    id: 'a2000000-0000-0000-0000-000000000002',
    name: 'Garanti Express',
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    founded: '2012',
    fleet: 30,
    description: { fr: 'Garanti Express est specialise dans les liaisons rapides entre les grandes villes camerounaises avec un service premium.', en: 'Garanti Express specializes in fast connections between major Cameroonian cities with premium service.' },
    classes: [
      { name: 'Normal', seats: 70, layout: '2+3', price: 3500, amenities: { fr: ['Climatisation', 'Sieges reclinables'], en: ['Air conditioning', 'Reclining seats'] } },
      { name: 'Classic', seats: 50, layout: '2+2', price: 5000, amenities: { fr: ['Climatisation', 'Sieges larges', 'Wifi'], en: ['Air conditioning', 'Wide seats', 'WiFi'] } },
      { name: 'VIP', seats: 33, layout: '2+2', price: 7000, amenities: { fr: ['Climatisation premium', 'Sieges cuir', 'Wifi', 'Snack offert'], en: ['Premium AC', 'Leather seats', 'WiFi', 'Free snack'] } },
    ],
    routes: [
      { from: 'Yaounde', to: 'Douala', times: ['07:00', '10:00', '14:00'], price: 3500 },
      { from: 'Douala', to: 'Yaounde', times: ['08:00', '11:00'], price: 3500 },
      { from: 'Yaounde', to: 'Bamenda', times: ['07:00'], price: 5000 },
      { from: 'Bamenda', to: 'Yaounde', times: ['07:00'], price: 5000 },
      { from: 'Yaounde', to: 'Bafoussam', times: ['07:00'], price: 4500 },
      { from: 'Bafoussam', to: 'Yaounde', times: ['08:00'], price: 4500 },
      { from: 'Douala', to: 'Bamenda', times: ['07:30'], price: 4500 },
      { from: 'Yaounde', to: 'Kribi', times: ['09:00'], price: 3000 },
      { from: 'Douala', to: 'Limbe', times: ['13:00'], price: 1500 },
      { from: 'Douala', to: 'Buea', times: ['10:00'], price: 1500 },
      { from: 'Douala', to: 'Bafoussam', times: ['08:00'], price: 4000 },
      { from: 'Yaounde', to: 'Ngaoundere', times: ['06:00'], price: 7500 },
    ],
  },
  {
    id: 'a3000000-0000-0000-0000-000000000003',
    name: 'Vatican Express',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    founded: '2015',
    fleet: 25,
    description: { fr: 'Vatican Express couvre principalement les liaisons vers les regions de l Ouest et du Nord-Ouest avec des prix tres competitifs.', en: 'Vatican Express mainly covers routes to the West and North-West regions with very competitive prices.' },
    classes: [
      { name: 'Normal', seats: 70, layout: '2+3', price: 3500, amenities: { fr: ['Climatisation', 'Sieges reclinables'], en: ['Air conditioning', 'Reclining seats'] } },
      { name: 'VIP', seats: 33, layout: '2+2', price: 8000, amenities: { fr: ['Climatisation premium', 'Sieges cuir', 'Chargeur USB'], en: ['Premium AC', 'Leather seats', 'USB charger'] } },
    ],
    routes: [
      { from: 'Yaounde', to: 'Douala', times: ['08:00', '11:00', '16:00'], price: 3500 },
      { from: 'Douala', to: 'Yaounde', times: ['07:00', '17:00'], price: 3500 },
      { from: 'Yaounde', to: 'Bamenda', times: ['06:30'], price: 5000 },
      { from: 'Douala', to: 'Bamenda', times: ['06:00', '09:00'], price: 4500 },
      { from: 'Bamenda', to: 'Douala', times: ['06:00'], price: 4500 },
      { from: 'Yaounde', to: 'Kribi', times: ['09:00'], price: 3000 },
      { from: 'Yaounde', to: 'Ebolowa', times: ['07:00'], price: 2500 },
      { from: 'Limbe', to: 'Bamenda', times: ['06:00'], price: 3500 },
      { from: 'Buea', to: 'Bamenda', times: ['06:00'], price: 3500 },
      { from: 'Bafoussam', to: 'Bamenda', times: ['07:00'], price: 2500 },
    ],
  },
]

const TRAIN_LINES = [
  {
    id: 'line1',
    name: { fr: 'Ligne Express Douala - Yaounde', en: 'Express Line Douala - Yaounde' },
    from: 'Douala', to: 'Yaounde', km: 263, duration: '4h45',
    departures: [
      { time: '06:30', type: { fr: 'Express', en: 'Express' }, direction: 'Douala → Yaounde' },
      { time: '17:00', type: { fr: 'Express', en: 'Express' }, direction: 'Yaounde → Douala' },
    ],
    classes: [
      { name: '2eme Classe', nameEn: '2nd Class', seats: 88, price: 3500, amenities: { fr: ['Sieges numerotes', 'Climatisation'], en: ['Numbered seats', 'Air conditioning'] } },
      { name: 'Premium', nameEn: 'Premium', seats: 60, price: 8000, amenities: { fr: ['Sieges larges', 'Climatisation premium', 'Chargeur USB'], en: ['Wide seats', 'Premium AC', 'USB charger'] } },
      { name: '1ere Classe', nameEn: '1st Class', seats: 40, price: 10000, amenities: { fr: ['Sieges cuir', 'Repas inclus', 'Climatisation', 'Wifi'], en: ['Leather seats', 'Meal included', 'AC', 'WiFi'] } },
    ],
    stops: ['Douala', 'Eseka', 'Makak', 'Yaounde'],
    frequency: { fr: 'Quotidien', en: 'Daily' },
    color: '#16a34a',
    badge: 'nv-badge-green',
  },
  {
    id: 'line2',
    name: { fr: 'Ligne de Nuit Yaounde - Ngaoundere', en: 'Night Train Yaounde - Ngaoundere' },
    from: 'Yaounde', to: 'Ngaoundere', km: 667, duration: '13h',
    departures: [
      { time: '18:10', type: { fr: 'Train de nuit', en: 'Night train' }, direction: 'Yaounde → Ngaoundere' },
      { time: '07:45', type: { fr: 'Train de nuit', en: 'Night train' }, direction: 'Ngaoundere → Yaounde' },
    ],
    classes: [
      { name: '2eme Classe', nameEn: '2nd Class', seats: 88, price: 5000, amenities: { fr: ['Sieges numerotes', 'Climatisation'], en: ['Numbered seats', 'Air conditioning'] } },
      { name: '1ere Classe', nameEn: '1st Class', seats: 40, price: 15000, amenities: { fr: ['Sieges cuir', 'Repas inclus', 'Couverture'], en: ['Leather seats', 'Meal included', 'Blanket'] } },
      { name: 'Couchette 4', nameEn: 'Couchette 4', seats: 20, price: 25000, amenities: { fr: ['4 couchettes/compartiment', 'Literie fournie', 'Cadenas'], en: ['4 berths/compartment', 'Bedding provided', 'Lock'] } },
      { name: 'Couchette 2', nameEn: 'Couchette 2', seats: 10, price: 28000, amenities: { fr: ['2 couchettes/compartiment', 'Literie premium', 'Cadenas', 'Prise electrique'], en: ['2 berths/compartment', 'Premium bedding', 'Lock', 'Power outlet'] } },
    ],
    stops: ['Yaounde', 'Belabo', 'Ngaoundal', 'Ngaoundere'],
    frequency: { fr: 'Quotidien', en: 'Daily' },
    color: '#7e22ce',
    badge: 'nv-badge-couchette',
  },
  {
    id: 'line3',
    name: { fr: 'Ligne Omnibus Douala - Kumba', en: 'Omnibus Line Douala - Kumba' },
    from: 'Douala', to: 'Kumba', km: 200, duration: '5h',
    departures: [
      { time: '07:30', type: { fr: 'Omnibus', en: 'Omnibus' }, direction: 'Douala → Kumba' },
      { time: '13:00', type: { fr: 'Omnibus', en: 'Omnibus' }, direction: 'Kumba → Douala' },
    ],
    classes: [
      { name: '2eme Classe', nameEn: '2nd Class', seats: 88, price: 1500, amenities: { fr: ['Sieges numerotes', 'Ventilation'], en: ['Numbered seats', 'Ventilation'] } },
    ],
    stops: ['Douala', 'Loum', 'Mbanga', 'Kumba'],
    frequency: { fr: 'Quotidien', en: 'Daily' },
    color: '#d97706',
    badge: 'nv-badge-gold',
  },
]

export default function AgenciesPage() {
  const { lang } = useLang()
  const router = useRouter()
  const t = T[lang]
  const [mode, setMode] = useState<'bus'|'train'>('bus')
  const [selectedAgency, setSelectedAgency] = useState<string | null>(null)
  const [selectedLine, setSelectedLine] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => setIsMounted(true), [])
  const tl = T[isMounted ? lang : 'fr']

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px 20px', border: 'none',
    borderBottom: active ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    background: active ? 'var(--nv-bg-surface)' : 'var(--nv-gray-50)',
    fontFamily: 'var(--nv-font-body)', fontSize: '15px',
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '-1.5px',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(160deg, var(--nv-green-50) 0%, #fff 60%)', borderBottom: '1.5px solid var(--nv-border)', padding: 'clamp(28px,6vw,56px) 0' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600), var(--nv-green-500))' }} />
        <div className="nv-container">
          <div style={{ marginBottom: '8px' }}>
            <Link href="/" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>&larr; {lang === 'fr' ? 'Accueil' : 'Home'}</Link>
          </div>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 800, color: 'var(--nv-gray-900)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {tl.title}
          </h1>
          <p style={{ fontSize: 'clamp(13px,3vw,15px)', color: 'var(--nv-text-secondary)', maxWidth: '500px' }}>{tl.sub}</p>
        </div>
      </div>

      {/* MODE TABS */}
      <div className="nv-mode-tabs-sticky" style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', position: 'sticky', top: '60px', zIndex: 50 }}>
        <div className="nv-container" style={{ padding: '0 clamp(16px,4vw,40px)' }}>
          <div style={{ display: 'flex', maxWidth: '400px' }}>
            <button style={tabStyle(mode === 'bus')} onClick={() => { setMode('bus'); setSelectedAgency(null) }}>{tl.bus}</button>
            <button style={tabStyle(mode === 'train')} onClick={() => { setMode('train'); setSelectedLine(null) }}>Train (Camrail)</button>
          </div>
        </div>
      </div>

      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>

        {/* ---- BUS MODE ---- */}
        {mode === 'bus' && (
          <div>
            <div className="nv-agencies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {BUS_AGENCIES.map(agency => (
                <div
                  key={agency.id}
                  className="nv-card nv-card-hover"
                  style={{ padding: '24px', borderColor: selectedAgency === agency.id ? agency.color : 'var(--nv-border)', cursor: 'pointer', background: selectedAgency === agency.id ? agency.bg : 'var(--nv-bg-surface)' }}
                  onClick={() => setSelectedAgency(selectedAgency === agency.id ? null : agency.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: agency.bg, border: '2px solid ' + agency.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 800, color: agency.color, flexShrink: 0 }}>
                      {agency.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>{agency.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)' }}>{lang === 'fr' ? 'Depuis' : 'Since'} {agency.founded} &middot; {agency.fleet} {lang === 'fr' ? 'bus' : 'buses'}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {agency.description[lang]}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {agency.classes.map(c => (
                      <span key={c.name} className={'nv-badge ' + (c.name === 'VIP' ? 'nv-badge-vip' : c.name === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                        {c.name} &middot; {c.seats} {tl.seats}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: agency.color, fontWeight: 600 }}>
                    {selectedAgency === agency.id ? (lang === 'fr' ? '▲ Reduire' : '▲ Collapse') : (lang === 'fr' ? '▼ Voir details' : '▼ View details')}
                  </div>
                </div>
              ))}
            </div>

            {/* AGENCY DETAIL */}
            {selectedAgency && (() => {
              const agency = BUS_AGENCIES.find(a => a.id === selectedAgency)!
              return (
                <div>
                  {/* Classes */}
                  <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                    {agency.name} — {tl.classes}
                  </h2>
                  <div className="nv-classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '32px' }}>
                    {agency.classes.map(cls => (
                      <div key={cls.name} className="nv-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span className={'nv-badge ' + (cls.name === 'VIP' ? 'nv-badge-vip' : cls.name === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')} style={{ fontSize: '13px', padding: '4px 12px' }}>{cls.name}</span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{cls.price.toLocaleString('fr-CM')}</div>
                            <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '10px' }}>
                          {tl.busSize}: <strong style={{ color: 'var(--nv-gray-900)' }}>{cls.seats} {tl.seats}</strong> &middot; {cls.layout}
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-gray-700)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tl.busAmenities}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {cls.amenities[lang].map((a, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                              <span style={{ color: 'var(--nv-green-500)', fontWeight: 700 }}>&#10003;</span> {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Routes */}
                  <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(18px,4vw,22px)', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                    {agency.name} — {tl.allRoutes}
                  </h2>
                  <div className="nv-routes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                    {agency.routes.map((route, i) => (
                      <div key={i} className="nv-card" style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                            {route.from} <span style={{ color: 'var(--nv-green-500)' }}>&rarr;</span> {route.to}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{route.price.toLocaleString('fr-CM')}</div>
                            <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                          </div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{tl.schedule}</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {route.times.map((time, j) => (
                            <span key={j} style={{ background: 'var(--nv-green-50)', border: '1px solid var(--nv-green-200)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--nv-green-700)' }}>{time}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <button
                      className="nv-btn nv-btn-primary nv-btn-lg"
                      onClick={() => router.push('/?agency=' + agency.id)}
                    >
                      {tl.viewAll} {agency.name} &rarr;
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ---- TRAIN MODE ---- */}
        {mode === 'train' && (
          <div>
            {/* Camrail header */}
            <div className="nv-card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--nv-gold-50)', borderColor: 'var(--nv-gold-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--nv-gold-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>C</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>Camrail</div>
                  <p style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', lineHeight: 1.5 }}>{tl.trainDesc}</p>
                </div>
                <span className="nv-badge nv-badge-gold" style={{ fontSize: '12px' }}>{lang === 'fr' ? 'Operateur officiel' : 'Official operator'}</span>
              </div>
            </div>

            {/* Train lines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {TRAIN_LINES.map(line => (
                <div key={line.id}>
                  <div
                    className="nv-card nv-card-hover"
                    style={{ padding: '20px 24px', borderColor: selectedLine === line.id ? line.color : 'var(--nv-border)', cursor: 'pointer' }}
                    onClick={() => setSelectedLine(selectedLine === line.id ? null : line.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(16px,4vw,20px)', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
                          {line.name[lang]}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                          {line.km} km &middot; {line.duration} &middot; {line.frequency[lang]}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span className={line.badge}>{lang === 'fr' ? line.departures[0].type.fr : line.departures[0].type.en}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>{tl.price}</div>
                          <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{line.classes[0].price.toLocaleString('fr-CM')}</div>
                          <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: line.color, fontWeight: 600 }}>
                      {selectedLine === line.id ? (lang === 'fr' ? '▲ Reduire' : '▲ Collapse') : (lang === 'fr' ? '▼ Voir details' : '▼ View details')}
                    </div>
                  </div>

                  {selectedLine === line.id && (
                    <div style={{ background: 'var(--nv-gray-50)', border: '1.5px solid var(--nv-border)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '24px' }}>

                      {/* Departures */}
                      <h3 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '12px' }}>{tl.schedule}</h3>
                      <div className="nv-departure-cards" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {line.departures.map((dep, i) => (
                          <div key={i} style={{ background: 'var(--nv-bg-surface)', border: '1.5px solid var(--nv-border)', borderRadius: '10px', padding: '12px 16px', minWidth: '180px' }}>
                            <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: line.color }}>{dep.time}</div>
                            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{dep.direction}</div>
                            <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginTop: '2px' }}>{lang === 'fr' ? dep.type.fr : dep.type.en}</div>
                          </div>
                        ))}
                      </div>

                      {/* Stops */}
                      <h3 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '12px' }}>
                        {lang === 'fr' ? 'Arrets' : 'Stops'}
                      </h3>
                      <div className="nv-train-stops" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {line.stops.map((stop, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ background: line.color, color: '#fff', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>{stop}</span>
                            {i < line.stops.length - 1 && <span style={{ color: 'var(--nv-text-muted)', fontSize: '18px' }}>&rarr;</span>}
                          </div>
                        ))}
                      </div>

                      {/* Classes */}
                      <h3 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '12px' }}>{tl.classesAvail}</h3>
                      <div className="nv-classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                        {line.classes.map(cls => (
                          <div key={cls.name} className="nv-card" style={{ padding: '16px', background: 'var(--nv-bg-surface)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: line.color }}>{lang === 'fr' ? cls.name : cls.nameEn}</span>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{cls.price.toLocaleString('fr-CM')}</div>
                                <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                              </div>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>
                              {cls.seats} {tl.seats}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {cls.amenities[lang].map((a, i) => (
                                <div key={i} style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <span style={{ color: 'var(--nv-green-500)', fontWeight: 700 }}>&#10003;</span> {a}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '20px' }}>
                        <button
                          className="nv-btn nv-btn-primary"
                          onClick={() => router.push('/train-results?origin=' + line.from + '&destination=' + line.to + '&date=' + new Date().toISOString().split('T')[0])}
                        >
                          {tl.viewAll} &rarr;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="nv-footer" style={{ marginTop: '64px' }}>
        <div className="nv-container">
          <div className="nv-footer-inner">
            <div>
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
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                {lang === 'fr' ? 'La billetterie bus & train du Cameroun.' : "Cameroon's bus & train ticketing platform."}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>&copy; 2026 NyangaVoyage</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
