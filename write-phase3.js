const fs = require('fs');
const content = `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const T = {
  fr: {
    nav: { routes: 'Trajets', agencies: 'Agences', about: 'A propos', agencyPortal: 'Espace Agence' },
    hero: { badge: '12 villes - 3 agences - Bus & Train', headline1: 'Voyagez partout', headline2: 'au Cameroun,', headline3: 'facilement.', sub: 'Reservez votre billet de bus ou de train en quelques clics. Paiement MTN Mobile Money. Confirmation par SMS.' },
    tabs: { bus: 'Bus', train: 'Train' },
    search: { from: 'Ville de depart', to: 'Destination', date: 'Date', class: 'Classe', search: 'Rechercher', selectFrom: 'Choisir la ville de depart', selectTo: 'Choisir la destination', trainFrom: 'Gare de depart', trainTo: 'Gare arrivee', selectTrainFrom: 'Choisir la gare de depart', selectTrainTo: 'Choisir la gare arrivee', classes: { all: 'Toutes les classes', normal: 'Normal', vip: 'VIP', classic: 'Classic', second: '2eme Classe', first: '1ere Classe', couchette: 'Couchette (nuit)' } },
    stats: { agencies: 'Agences partenaires', cities: 'Villes desservies', sms: 'Ticket par SMS', momo: 'MTN Mobile Money' },
    partners: 'Nos partenaires',
    features: { title: 'Pourquoi NyangaVoyage ?', f1title: 'Reservation rapide', f1desc: 'Choisissez votre siege et payez en moins de 2 minutes depuis votre telephone.', f2title: 'Ticket par SMS', f2desc: 'Recevez votre billet directement par SMS. Pas besoin imprimante.', f3title: 'MTN Mobile Money', f3desc: 'Paiement 100% mobile. Simple, securise, et accessible partout au Cameroun.' },
    busRoutes: { title: 'Trajets bus populaires', from: 'A partir de' },
    trainRoutes: { title: 'Trajets train Camrail', from: 'A partir de' },
    howItWorks: { title: 'Comment ca marche ?', s1title: 'Recherchez', s1desc: 'Entrez votre ville de depart, destination et date.', s2title: 'Choisissez', s2desc: 'Selectionnez votre bus ou train et votre siege.', s3title: 'Payez', s3desc: 'Reglez via MTN Mobile Money en quelques secondes.', s4title: 'Voyagez', s4desc: 'Recevez votre billet par SMS. Bon voyage !' },
    footer: { tagline: 'La billetterie bus & train du Cameroun.', rights: '2026 NyangaVoyage. Tous droits reserves.' },
  },
  en: {
    nav: { routes: 'Routes', agencies: 'Agencies', about: 'About', agencyPortal: 'Agency Portal' },
    hero: { badge: '12 cities - 3 agencies - Bus & Train', headline1: 'Travel anywhere', headline2: 'in Cameroon,', headline3: 'easily.', sub: 'Book your bus or train ticket in a few clicks. Pay with MTN Mobile Money. Instant SMS confirmation.' },
    tabs: { bus: 'Bus', train: 'Train' },
    search: { from: 'Departure city', to: 'Destination', date: 'Date', class: 'Class', search: 'Search', selectFrom: 'Choose departure city', selectTo: 'Choose destination', trainFrom: 'Departure station', trainTo: 'Arrival station', selectTrainFrom: 'Choose departure station', selectTrainTo: 'Choose arrival station', classes: { all: 'All classes', normal: 'Normal', vip: 'VIP', classic: 'Classic', second: '2nd Class', first: '1st Class', couchette: 'Couchette (night)' } },
    stats: { agencies: 'Partner agencies', cities: 'Cities served', sms: 'SMS ticket', momo: 'MTN Mobile Money' },
    partners: 'Our partners',
    features: { title: 'Why NyangaVoyage?', f1title: 'Fast booking', f1desc: 'Choose your seat and pay in under 2 minutes from your phone.', f2title: 'SMS ticket', f2desc: 'Receive your ticket directly by SMS. No printer needed.', f3title: 'MTN Mobile Money', f3desc: '100% mobile payment. Simple, secure, available everywhere in Cameroon.' },
    busRoutes: { title: 'Popular bus routes', from: 'From' },
    trainRoutes: { title: 'Camrail train routes', from: 'From' },
    howItWorks: { title: 'How does it work?', s1title: 'Search', s1desc: 'Enter your departure city, destination and date.', s2title: 'Choose', s2desc: 'Select your bus or train and your seat.', s3title: 'Pay', s3desc: 'Pay via MTN Mobile Money in seconds.', s4title: 'Travel', s4desc: 'Receive your ticket by SMS. Safe travels!' },
    footer: { tagline: "Cameroon bus & train ticketing platform.", rights: '2026 NyangaVoyage. All rights reserved.' },
  },
}

const BUS_CITIES = ['Yaounde','Douala','Bafoussam','Bamenda','Garoua','Maroua','Ngaoundere','Bertoua','Ebolowa','Kribi','Limbe','Buea']
const TRAIN_STATIONS = ['Douala','Yaounde','Ngaoundere','Belabo','Kumba']

const BUS_ROUTES = [
  { from: 'Yaounde', to: 'Douala',     km: 240,  time: '4h',    price: 3500 },
  { from: 'Douala',  to: 'Bamenda',    km: 330,  time: '5h30',  price: 4500 },
  { from: 'Yaounde', to: 'Bafoussam',  km: 300,  time: '5h',    price: 4500 },
  { from: 'Yaounde', to: 'Bamenda',    km: 360,  time: '6h',    price: 5000 },
  { from: 'Douala',  to: 'Limbe',      km: 70,   time: '1h30',  price: 1500 },
  { from: 'Yaounde', to: 'Kribi',      km: 170,  time: '3h',    price: 3000 },
  { from: 'Yaounde', to: 'Bertoua',    km: 350,  time: '5h',    price: 5000 },
  { from: 'Douala',  to: 'Buea',       km: 70,   time: '1h30',  price: 1500 },
  { from: 'Yaounde', to: 'Ngaoundere', km: 590,  time: '10h',   price: 7500 },
  { from: 'Yaounde', to: 'Garoua',     km: 780,  time: '13h',   price: 8500 },
  { from: 'Yaounde', to: 'Ebolowa',    km: 160,  time: '2h30',  price: 2500 },
  { from: 'Douala',  to: 'Bafoussam',  km: 250,  time: '4h30',  price: 4000 },
]

const TRAIN_ROUTES = [
  { from: 'Douala',  to: 'Yaounde',    km: 263, time: '4h45', depart: '06:30', arrive: '11:15',   price: 3500,  type: 'express',  typeEn: 'Express',  classes: ['2nd','Premium','1st'] },
  { from: 'Yaounde', to: 'Ngaoundere', km: 667, time: '13h',  depart: '18:10', arrive: '07:00+1', price: 10000, type: 'nuit',     typeEn: 'Night',    classes: ['2nd','1st','Couchette'] },
  { from: 'Douala',  to: 'Kumba',      km: 200, time: '5h',   depart: '07:30', arrive: '12:30',   price: 1500,  type: 'omnibus',  typeEn: 'Omnibus',  classes: ['2nd'] },
]

export default function HomePage() {
  const router = useRouter()
  const [lang, setLang] = useState<'fr'|'en'>('fr')
  const [mode, setMode] = useState<'bus'|'train'>('bus')
  const [busFrom, setBusFrom] = useState('')
  const [busTo, setBusTo] = useState('')
  const [busDate, setBusDate] = useState('')
  const [busClass, setBusClass] = useState('')
  const [trainFrom, setTrainFrom] = useState('')
  const [trainTo, setTrainTo] = useState('')
  const [trainDate, setTrainDate] = useState('')
  const [trainClass, setTrainClass] = useState('')
  const t = T[lang]

  const handleBusSearch = () => {
    if (!busFrom || !busTo || !busDate) return
    const p = new URLSearchParams({ origin: busFrom, destination: busTo, date: busDate, ...(busClass && { class: busClass }) })
    router.push('/results?' + p.toString())
  }

  const handleTrainSearch = () => {
    if (!trainFrom || !trainTo || !trainDate) return
    const p = new URLSearchParams({ origin: trainFrom, destination: trainTo, date: trainDate, ...(trainClass && { class: trainClass }) })
    router.push('/train-results?' + p.toString())
  }

  const getTrainBadge = (type: string) =>
    type === 'nuit' ? 'nv-badge-couchette' : type === 'express' ? 'nv-badge-first' : 'nv-badge-second'

  const getTrainLabel = (r: typeof TRAIN_ROUTES[0]) =>
    lang === 'fr' ? r.type.charAt(0).toUpperCase() + r.type.slice(1) : r.typeEn

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '14px 20px',
    background: active ? 'var(--nv-bg-surface)' : 'var(--nv-gray-50)',
    border: 'none',
    borderBottom: active ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    fontFamily: 'var(--nv-font-body)', fontSize: '15px', fontWeight: active ? 700 : 400,
    color: active ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    marginBottom: '-1.5px',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)' }}>

      {/* NAVBAR */}
      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <a href="/" className="nv-nav-logo">NyangaVoyage</a>
          <div className="nv-nav-links">
            <a href="/search" className="nv-nav-link">{t.nav.routes}</a>
            <span className="nv-nav-link">{t.nav.agencies}</span>
            <span className="nv-nav-link">{t.nav.about}</span>
          </div>
          <div className="nv-nav-right">
            <div className="nv-lang-toggle">
              <button className={'nv-lang-btn' + (lang === 'fr' ? ' active' : '')} onClick={() => setLang('fr')}>FR</button>
              <button className={'nv-lang-btn' + (lang === 'en' ? ' active' : '')} onClick={() => setLang('en')}>EN</button>
            </div>
            <Link href="/agency/login" className="nv-btn nv-btn-primary nv-btn-sm">{t.nav.agencyPortal}</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, var(--nv-green-50) 0%, #fff 55%)', borderBottom: '1.5px solid var(--nv-border)', padding: '64px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600), var(--nv-green-500))' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(22,163,74,0.04) 28px, rgba(22,163,74,0.04) 29px)', pointerEvents: 'none' }} />
        <div className="nv-container">

          <div style={{ marginBottom: '20px' }}>
            <span className="nv-badge nv-badge-green" style={{ fontSize: '12px', padding: '5px 14px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--nv-green-500)', display: 'inline-block', marginRight: 6 }} />
              {t.hero.badge}
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: 'clamp(38px, 5.5vw, 58px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05, color: 'var(--nv-gray-900)', marginBottom: '16px', maxWidth: '640px' }}>
            {t.hero.headline1}<br />{t.hero.headline2}<br />
            <span style={{ color: 'var(--nv-green-600)' }}>{t.hero.headline3}</span>
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--nv-text-secondary)', maxWidth: '480px', lineHeight: 1.7, marginBottom: '36px' }}>{t.hero.sub}</p>

          {/* Search Card */}
          <div className="nv-card" style={{ maxWidth: '820px', padding: '0', overflow: 'hidden', boxShadow: 'var(--nv-shadow-lg)' }}>
            <div style={{ display: 'flex', borderBottom: '1.5px solid var(--nv-border)' }}>
              <button style={tabStyle(mode === 'bus')} onClick={() => setMode('bus')}>Bus</button>
              <button style={tabStyle(mode === 'train')} onClick={() => setMode('train')}>Train</button>
            </div>
            <div style={{ padding: '24px 28px' }}>
              {mode === 'bus' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.from}</label>
                    <select className="nv-select" value={busFrom} onChange={e => setBusFrom(e.target.value)}>
                      <option value="">{t.search.selectFrom}</option>
                      {BUS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.to}</label>
                    <select className="nv-select" value={busTo} onChange={e => setBusTo(e.target.value)}>
                      <option value="">{t.search.selectTo}</option>
                      {BUS_CITIES.filter(c => c !== busFrom).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.date}</label>
                    <input type="date" className="nv-input" value={busDate} onChange={e => setBusDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.class}</label>
                    <select className="nv-select" value={busClass} onChange={e => setBusClass(e.target.value)}>
                      <option value="">{t.search.classes.all}</option>
                      <option value="Normal">{t.search.classes.normal}</option>
                      <option value="Classic">{t.search.classes.classic}</option>
                      <option value="VIP">{t.search.classes.vip}</option>
                    </select>
                  </div>
                  <button className="nv-btn nv-btn-primary" onClick={handleBusSearch} style={{ height: '42px', paddingLeft: '24px', paddingRight: '24px' }}>
                    {t.search.search} &rarr;
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.trainFrom}</label>
                    <select className="nv-select" value={trainFrom} onChange={e => setTrainFrom(e.target.value)}>
                      <option value="">{t.search.selectTrainFrom}</option>
                      {TRAIN_STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.trainTo}</label>
                    <select className="nv-select" value={trainTo} onChange={e => setTrainTo(e.target.value)}>
                      <option value="">{t.search.selectTrainTo}</option>
                      {TRAIN_STATIONS.filter(s => s !== trainFrom).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.date}</label>
                    <input type="date" className="nv-input" value={trainDate} onChange={e => setTrainDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.search.class}</label>
                    <select className="nv-select" value={trainClass} onChange={e => setTrainClass(e.target.value)}>
                      <option value="">{t.search.classes.all}</option>
                      <option value="2nd">{t.search.classes.second}</option>
                      <option value="1st">{t.search.classes.first}</option>
                      <option value="Couchette">{t.search.classes.couchette}</option>
                    </select>
                  </div>
                  <button className="nv-btn nv-btn-primary" onClick={handleTrainSearch} style={{ height: '42px', paddingLeft: '24px', paddingRight: '24px' }}>
                    {t.search.search} &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
            {[
              { val: '3',   label: t.stats.agencies },
              { val: '12',  label: t.stats.cities },
              { val: 'SMS', label: t.stats.sms },
              { val: 'MTN', label: t.stats.momo },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {i > 0 && <div style={{ width: '1px', height: '32px', background: 'var(--nv-border)', marginRight: '16px' }} />}
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--nv-gray-900)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginTop: '3px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PARTNERS */}
      <section style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '18px 0' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{t.partners}</span>
            {['Buca Voyages', 'Garanti Express', 'Vatican Express'].map(a => (
              <div key={a} style={{ background: 'var(--nv-green-50)', border: '1px solid var(--nv-green-200)', borderRadius: 'var(--nv-radius-full)', padding: '6px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--nv-green-800)' }}>
                {a}
              </div>
            ))}
            <div style={{ background: 'var(--nv-gold-50)', border: '1px solid var(--nv-gold-200)', borderRadius: 'var(--nv-radius-full)', padding: '6px 16px', fontSize: '13px', fontWeight: 500, color: 'var(--nv-gold-700)' }}>
              Camrail
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="nv-section" style={{ background: 'var(--nv-bg-page)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)', marginBottom: '32px' }}>
            {t.features.title.split('NyangaVoyage')[0]}
            <span style={{ color: 'var(--nv-green-600)' }}>NyangaVoyage</span>
            {t.features.title.split('NyangaVoyage')[1]}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '900px' }}>
            {[
              { num: '1', title: t.features.f1title, desc: t.features.f1desc, bg: 'var(--nv-green-50)', border: 'var(--nv-green-200)', color: 'var(--nv-green-700)' },
              { num: '2', title: t.features.f2title, desc: t.features.f2desc, bg: 'var(--nv-gold-50)',  border: 'var(--nv-gold-200)',  color: 'var(--nv-gold-700)' },
              { num: '3', title: t.features.f3title, desc: t.features.f3desc, bg: '#eff6ff',            border: '#bfdbfe',             color: '#1e40af' },
            ].map((f, i) => (
              <div key={i} className="nv-card" style={{ padding: '24px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: f.bg, border: '1.5px solid ' + f.border, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 800, color: f.color }}>
                  {f.num}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUS ROUTES */}
      <section className="nv-section-sm" style={{ background: 'var(--nv-bg-surface)', borderTop: '1.5px solid var(--nv-border)', borderBottom: '1.5px solid var(--nv-border)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)', marginBottom: '24px' }}>
            {t.busRoutes.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {BUS_ROUTES.map((r, i) => (
              <div key={i} className="nv-card nv-card-hover"
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => { setBusFrom(r.from); setBusTo(r.to); setMode('bus'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                    {r.from} <span style={{ color: 'var(--nv-green-500)' }}>&rarr;</span> {r.to}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginTop: '3px' }}>{r.km} km &middot; {r.time}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>{t.busRoutes.from}</div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{r.price.toLocaleString('fr-CM')}</div>
                  <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAIN ROUTES */}
      <section className="nv-section-sm" style={{ background: 'var(--nv-bg-page)' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)' }}>
              {t.trainRoutes.title}
            </h2>
            <span className="nv-badge nv-badge-gold" style={{ marginLeft: 'auto' }}>Camrail</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
            {TRAIN_ROUTES.map((r, i) => (
              <div key={i} className="nv-card nv-card-hover" style={{ padding: '20px 24px' }}
                onClick={() => { setTrainFrom(r.from); setTrainTo(r.to); setMode('train'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                      {r.from} <span style={{ color: 'var(--nv-green-500)' }}>&rarr;</span> {r.to}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginTop: '3px' }}>
                      {r.km} km &middot; Depart {r.depart} &middot; Arrivee {r.arrive}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={'nv-badge ' + getTrainBadge(r.type)}>{getTrainLabel(r)}</span>
                    {r.classes.map(c => (
                      <span key={c} className={'nv-badge ' + (c === 'Couchette' ? 'nv-badge-couchette' : c === '1st' || c === 'Premium' ? 'nv-badge-first' : 'nv-badge-second')}>{c}</span>
                    ))}
                    <span style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>&middot; {r.time}</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)' }}>{t.trainRoutes.from}</div>
                    <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-green-600)' }}>{r.price.toLocaleString('fr-CM')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)' }}>FCFA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="nv-section" style={{ background: 'var(--nv-bg-surface)', borderTop: '1.5px solid var(--nv-border)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--nv-gray-900)', marginBottom: '36px', textAlign: 'center' }}>
            {t.howItWorks.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
            {[
              { num: '01', title: t.howItWorks.s1title, desc: t.howItWorks.s1desc },
              { num: '02', title: t.howItWorks.s2title, desc: t.howItWorks.s2desc },
              { num: '03', title: t.howItWorks.s3title, desc: t.howItWorks.s3desc },
              { num: '04', title: t.howItWorks.s4title, desc: t.howItWorks.s4desc },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nv-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--nv-font-display)' }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="nv-footer">
        <div className="nv-container">
          <div className="nv-footer-inner">
            <div>
              <div className="nv-footer-logo">NyangaVoyage</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{t.footer.tagline}</div>
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>&copy; {t.footer.rights}</div>
          </div>
        </div>
      </footer>

    </div>
  )
}
`;
fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log('Done - ' + content.length + ' chars written');
