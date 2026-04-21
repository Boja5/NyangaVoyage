const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/page.tsx — Complete homepage with ALL working buttons
// ============================================================
const homePage = `'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    badge: '12 villes - 3 agences - Bus et Train',
    headline1: 'Voyagez partout', headline2: 'au Cameroun,', headline3: 'facilement.',
    sub: 'Reservez votre billet de bus ou de train en quelques clics. Paiement MTN Mobile Money. Confirmation par SMS.',
    from: 'Depart', to: 'Destination', date: 'Date', class: 'Classe', search: 'Rechercher',
    selectFrom: 'Choisir la ville', selectTo: 'Choisir la destination',
    trainFrom: 'Gare de depart', trainTo: 'Gare arrivee',
    selectTrainFrom: 'Choisir la gare', selectTrainTo: 'Choisir la gare arrivee',
    classes: { all: 'Toutes les classes', normal: 'Normal', vip: 'VIP', classic: 'Classic', second: '2eme Classe', first: '1ere Classe', couchette: 'Couchette' },
    stats: { agencies: 'Agences', cities: 'Villes', sms: 'Ticket SMS', momo: 'MTN MoMo' },
    partners: 'Nos partenaires',
    f1title: 'Reservation rapide', f1desc: 'Choisissez votre siege et payez en moins de 2 minutes.',
    f2title: 'Ticket par SMS', f2desc: 'Recevez votre billet directement par SMS.',
    f3title: 'MTN Mobile Money', f3desc: 'Paiement 100% mobile, accessible partout au Cameroun.',
    whyTitle: 'Pourquoi NyangaVoyage ?',
    busTitle: 'Trajets bus populaires', trainTitle: 'Trajets train Camrail',
    fromPrice: 'A partir de',
    howTitle: 'Comment ca marche ?',
    s1: 'Recherchez', s1d: 'Ville de depart, destination et date.',
    s2: 'Choisissez', s2d: 'Selectionnez votre bus ou train et siege.',
    s3: 'Payez', s3d: 'Reglez via MTN Mobile Money.',
    s4: 'Voyagez', s4d: 'Recevez votre billet par SMS !',
    footerTag: 'La billetterie bus et train du Cameroun.',
    footerRights: '2026 NyangaVoyage. Tous droits reserves.',
  },
  en: {
    badge: '12 cities - 3 agencies - Bus and Train',
    headline1: 'Travel anywhere', headline2: 'in Cameroon,', headline3: 'easily.',
    sub: 'Book your bus or train ticket in a few clicks. Pay with MTN Mobile Money. Instant SMS confirmation.',
    from: 'From', to: 'To', date: 'Date', class: 'Class', search: 'Search',
    selectFrom: 'Choose city', selectTo: 'Choose destination',
    trainFrom: 'Departure station', trainTo: 'Arrival station',
    selectTrainFrom: 'Choose station', selectTrainTo: 'Choose arrival station',
    classes: { all: 'All classes', normal: 'Normal', vip: 'VIP', classic: 'Classic', second: '2nd Class', first: '1st Class', couchette: 'Couchette' },
    stats: { agencies: 'Agencies', cities: 'Cities', sms: 'SMS ticket', momo: 'MTN MoMo' },
    partners: 'Our partners',
    f1title: 'Fast booking', f1desc: 'Choose your seat and pay in under 2 minutes.',
    f2title: 'SMS ticket', f2desc: 'Receive your ticket directly by SMS.',
    f3title: 'MTN Mobile Money', f3desc: '100% mobile payment, available everywhere in Cameroon.',
    whyTitle: 'Why NyangaVoyage?',
    busTitle: 'Popular bus routes', trainTitle: 'Camrail train routes',
    fromPrice: 'From',
    howTitle: 'How does it work?',
    s1: 'Search', s1d: 'Enter departure, destination and date.',
    s2: 'Choose', s2d: 'Select your bus or train and seat.',
    s3: 'Pay', s3d: 'Pay via MTN Mobile Money.',
    s4: 'Travel', s4d: 'Receive your ticket by SMS!',
    footerTag: "Cameroon bus and train ticketing platform.",
    footerRights: '2026 NyangaVoyage. All rights reserved.',
  },
}

const BUS_CITIES = ['Yaounde','Douala','Bafoussam','Bamenda','Garoua','Maroua','Ngaoundere','Bertoua','Ebolowa','Kribi','Limbe','Buea']
const TRAIN_STATIONS = ['Douala','Yaounde','Ngaoundere','Kumba']

const BUS_ROUTES = [
  { from:'Yaounde', to:'Douala',     km:240, time:'4h',   price:3500 },
  { from:'Douala',  to:'Bamenda',    km:330, time:'5h30', price:4500 },
  { from:'Yaounde', to:'Bafoussam',  km:300, time:'5h',   price:4500 },
  { from:'Yaounde', to:'Bamenda',    km:360, time:'6h',   price:5000 },
  { from:'Douala',  to:'Limbe',      km:70,  time:'1h30', price:1500 },
  { from:'Yaounde', to:'Kribi',      km:170, time:'3h',   price:3000 },
  { from:'Yaounde', to:'Bertoua',    km:350, time:'5h',   price:5000 },
  { from:'Douala',  to:'Buea',       km:70,  time:'1h30', price:1500 },
  { from:'Yaounde', to:'Ngaoundere', km:590, time:'10h',  price:7500 },
  { from:'Yaounde', to:'Garoua',     km:780, time:'13h',  price:8500 },
  { from:'Yaounde', to:'Ebolowa',    km:160, time:'2h30', price:2500 },
  { from:'Douala',  to:'Bafoussam',  km:250, time:'4h30', price:4000 },
]

const TRAIN_ROUTES = [
  { from:'Douala',  to:'Yaounde',    km:263, time:'4h45', dep:'06:30', arr:'11:15',   price:3500,  type:'express', typeEn:'Express', classes:['2nd','Premium','1st'] },
  { from:'Yaounde', to:'Ngaoundere', km:667, time:'13h',  dep:'18:10', arr:'07:00+1', price:10000, type:'nuit',    typeEn:'Night',   classes:['2nd','1st','Couchette'] },
  { from:'Douala',  to:'Kumba',      km:200, time:'5h',   dep:'07:30', arr:'12:30',   price:1500,  type:'omnibus', typeEn:'Omnibus', classes:['2nd'] },
]

export default function HomePage() {
  const router = useRouter()
  const { lang } = useLang()
  const [isMounted, setIsMounted] = useState(false)
  const [mode, setMode] = useState<'bus'|'train'>('bus')
  const [busFrom, setBusFrom] = useState('')
  const [busTo, setBusTo] = useState('')
  const [busDate, setBusDate] = useState('')
  const [busClass, setBusClass] = useState('')
  const [trainFrom, setTrainFrom] = useState('')
  const [trainTo, setTrainTo] = useState('')
  const [trainDate, setTrainDate] = useState('')
  const [trainClass, setTrainClass] = useState('')
  const [busError, setBusError] = useState('')
  const [trainError, setTrainError] = useState('')

  useEffect(() => { setIsMounted(true) }, [])
  const t = T[isMounted ? lang : 'fr']

  function handleBusSearch() {
    if (!busFrom || !busTo || !busDate) {
      setBusError(lang === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields')
      return
    }
    setBusError('')
    const params = new URLSearchParams({ origin: busFrom, destination: busTo, date: busDate })
    if (busClass) params.set('class', busClass)
    router.push('/results?' + params.toString())
  }

  function handleTrainSearch() {
    if (!trainFrom || !trainTo || !trainDate) {
      setTrainError(lang === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields')
      return
    }
    setTrainError('')
    const params = new URLSearchParams({ origin: trainFrom, destination: trainTo, date: trainDate })
    if (trainClass) params.set('class', trainClass)
    router.push('/train-results?' + params.toString())
  }

  function handleBusRouteClick(from: string, to: string) {
    setBusFrom(from)
    setBusTo(to)
    setMode('bus')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleTrainRouteClick(from: string, to: string) {
    setTrainFrom(from)
    setTrainTo(to)
    setMode('train')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getTrainBadgeClass = (type: string) =>
    type === 'nuit' ? 'nv-badge-couchette' : type === 'express' ? 'nv-badge-first' : 'nv-badge-second'

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '12px 16px',
    background: active ? 'var(--nv-bg-surface)' : 'var(--nv-gray-50)',
    border: 'none',
    borderBottom: active ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    fontFamily: 'var(--nv-font-body)', fontSize: '15px',
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer', transition: 'all 150ms ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '-1.5px',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)' }}>
      <Navbar />

      {/* ---- HERO ---- */}
      <section style={{ background: 'linear-gradient(160deg, var(--nv-green-50) 0%, #fff 55%)', borderBottom: '1.5px solid var(--nv-border)', padding: 'clamp(32px,6vw,64px) 0 clamp(28px,5vw,56px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600), var(--nv-green-500))' }} />
        <div className="nv-container">

          <div style={{ marginBottom: '16px' }}>
            <span className="nv-badge nv-badge-green" style={{ fontSize: '11px', padding: '4px 12px' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--nv-green-500)', display:'inline-block', marginRight:5 }} />
              {t.badge}
            </span>
          </div>

          <h1 style={{ fontFamily:'var(--nv-font-display)', fontSize:'clamp(32px,8vw,58px)', fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05, color:'var(--nv-gray-900)', marginBottom:'12px', maxWidth:'640px' }}>
            {t.headline1}<br />{t.headline2}<br />
            <span style={{ color:'var(--nv-green-600)' }}>{t.headline3}</span>
          </h1>
          <p style={{ fontSize:'clamp(13px,3.5vw,16px)', color:'var(--nv-text-secondary)', maxWidth:'480px', lineHeight:1.6, marginBottom:'28px' }}>{t.sub}</p>

          {/* Search Card */}
          <div className="nv-card" style={{ maxWidth:'860px', padding:'0', overflow:'hidden', boxShadow:'var(--nv-shadow-lg)' }}>
            <div style={{ display:'flex', borderBottom:'1.5px solid var(--nv-border)' }}>
              <button style={tabStyle(mode === 'bus')} onClick={() => { setMode('bus'); setBusError('') }}>Bus</button>
              <button style={tabStyle(mode === 'train')} onClick={() => { setMode('train'); setTrainError('') }}>Train</button>
            </div>

            <div style={{ padding:'clamp(16px,4vw,24px) clamp(16px,4vw,28px)' }}>
              {mode === 'bus' ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.from}</label>
                      <select className="nv-select" value={busFrom} onChange={e => setBusFrom(e.target.value)}>
                        <option value="">{t.selectFrom}</option>
                        {BUS_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.to}</label>
                      <select className="nv-select" value={busTo} onChange={e => setBusTo(e.target.value)}>
                        <option value="">{t.selectTo}</option>
                        {BUS_CITIES.filter(c => c !== busFrom).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.date}</label>
                      <input type="date" className="nv-input" value={busDate} onChange={e => setBusDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.class}</label>
                      <select className="nv-select" value={busClass} onChange={e => setBusClass(e.target.value)}>
                        <option value="">{t.classes.all}</option>
                        <option value="Normal">{t.classes.normal}</option>
                        <option value="Classic">{t.classes.classic}</option>
                        <option value="VIP">{t.classes.vip}</option>
                      </select>
                    </div>
                  </div>
                  {busError && <div className="nv-alert nv-alert-error" style={{ padding:'10px 14px' }}><div style={{ fontSize:'13px' }}>{busError}</div></div>}
                  <button
                    className="nv-btn nv-btn-primary nv-btn-full"
                    style={{ height:'48px', fontSize:'16px', fontWeight:700 }}
                    onClick={handleBusSearch}
                  >
                    {t.search} &rarr;
                  </button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.trainFrom}</label>
                      <select className="nv-select" value={trainFrom} onChange={e => setTrainFrom(e.target.value)}>
                        <option value="">{t.selectTrainFrom}</option>
                        {TRAIN_STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.trainTo}</label>
                      <select className="nv-select" value={trainTo} onChange={e => setTrainTo(e.target.value)}>
                        <option value="">{t.selectTrainTo}</option>
                        {TRAIN_STATIONS.filter(s => s !== trainFrom).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.date}</label>
                      <input type="date" className="nv-input" value={trainDate} onChange={e => setTrainDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">{t.class}</label>
                      <select className="nv-select" value={trainClass} onChange={e => setTrainClass(e.target.value)}>
                        <option value="">{t.classes.all}</option>
                        <option value="2nd">{t.classes.second}</option>
                        <option value="1st">{t.classes.first}</option>
                        <option value="Couchette">{t.classes.couchette}</option>
                      </select>
                    </div>
                  </div>
                  {trainError && <div className="nv-alert nv-alert-error" style={{ padding:'10px 14px' }}><div style={{ fontSize:'13px' }}>{trainError}</div></div>}
                  <button
                    className="nv-btn nv-btn-primary nv-btn-full"
                    style={{ height:'48px', fontSize:'16px', fontWeight:700 }}
                    onClick={handleTrainSearch}
                  >
                    {t.search} &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginTop:'28px', maxWidth:'480px' }}>
            {[{val:'3',label:t.stats.agencies},{val:'12',label:t.stats.cities},{val:'SMS',label:t.stats.sms},{val:'MTN',label:t.stats.momo}].map((s,i)=>(
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--nv-font-display)', fontSize:'clamp(16px,4vw,22px)', fontWeight:700, color:'var(--nv-gray-900)', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'clamp(10px,2.5vw,12px)', color:'var(--nv-text-secondary)', marginTop:'3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- PARTNERS ---- */}
      <section style={{ background:'var(--nv-bg-surface)', borderBottom:'1.5px solid var(--nv-border)', padding:'14px 0' }}>
        <div className="nv-container">
          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
            <span style={{ fontSize:'10px', fontWeight:600, color:'var(--nv-text-muted)', letterSpacing:'0.08em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{t.partners}</span>
            {['Buca Voyages','Garanti Express','Vatican Express'].map(a=>(
              <div key={a} style={{ background:'var(--nv-green-50)', border:'1px solid var(--nv-green-200)', borderRadius:'var(--nv-radius-full)', padding:'5px 12px', fontSize:'12px', fontWeight:500, color:'var(--nv-green-800)', whiteSpace:'nowrap' }}>{a}</div>
            ))}
            <div style={{ background:'var(--nv-gold-50)', border:'1px solid var(--nv-gold-200)', borderRadius:'var(--nv-radius-full)', padding:'5px 12px', fontSize:'12px', fontWeight:500, color:'var(--nv-gold-700)', whiteSpace:'nowrap' }}>Camrail</div>
          </div>
        </div>
      </section>

      {/* ---- WHY ---- */}
      <section className="nv-section" style={{ background:'var(--nv-bg-page)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily:'var(--nv-font-display)', fontSize:'clamp(20px,5vw,28px)', fontWeight:700, color:'var(--nv-gray-900)', marginBottom:'24px' }}>
            {t.whyTitle.includes('NyangaVoyage') ? <>{t.whyTitle.split('NyangaVoyage')[0]}<span style={{ color:'var(--nv-green-600)' }}>NyangaVoyage</span>{t.whyTitle.split('NyangaVoyage')[1]}</> : t.whyTitle}
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'12px' }}>
            {[
              {num:'1',title:t.f1title,desc:t.f1desc,bg:'var(--nv-green-50)',border:'var(--nv-green-200)',color:'var(--nv-green-700)'},
              {num:'2',title:t.f2title,desc:t.f2desc,bg:'var(--nv-gold-50)',border:'var(--nv-gold-200)',color:'var(--nv-gold-700)'},
              {num:'3',title:t.f3title,desc:t.f3desc,bg:'#eff6ff',border:'#bfdbfe',color:'#1e40af'},
            ].map((f,i)=>(
              <div key={i} className="nv-card" style={{ padding:'20px' }}>
                <div style={{ width:'40px',height:'40px',borderRadius:'10px',background:f.bg,border:'1.5px solid '+f.border,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'12px',fontFamily:'var(--nv-font-display)',fontSize:'18px',fontWeight:800,color:f.color }}>{f.num}</div>
                <div style={{ fontSize:'14px',fontWeight:600,color:'var(--nv-gray-900)',marginBottom:'5px' }}>{f.title}</div>
                <div style={{ fontSize:'13px',color:'var(--nv-text-secondary)',lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- BUS ROUTES ---- */}
      <section className="nv-section-sm" style={{ background:'var(--nv-bg-surface)', borderTop:'1.5px solid var(--nv-border)', borderBottom:'1.5px solid var(--nv-border)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily:'var(--nv-font-display)', fontSize:'clamp(18px,4.5vw,22px)', fontWeight:700, color:'var(--nv-gray-900)', marginBottom:'16px' }}>{t.busTitle}</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'10px' }}>
            {BUS_ROUTES.map((r,i)=>(
              <button
                key={i}
                onClick={() => handleBusRouteClick(r.from, r.to)}
                style={{ background:'var(--nv-bg-surface)', border:'1.5px solid var(--nv-border)', borderRadius:'var(--nv-radius-lg)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', textAlign:'left', transition:'all 200ms ease', fontFamily:'var(--nv-font-body)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--nv-green-300)'; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--nv-border)'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}
              >
                <div>
                  <div style={{ fontFamily:'var(--nv-font-display)',fontSize:'14px',fontWeight:700,color:'var(--nv-gray-900)' }}>{r.from} <span style={{ color:'var(--nv-green-500)' }}>&rarr;</span> {r.to}</div>
                  <div style={{ fontSize:'11px',color:'var(--nv-text-muted)',marginTop:'2px' }}>{r.km} km &middot; {r.time}</div>
                </div>
                <div style={{ textAlign:'right',flexShrink:0,marginLeft:'8px' }}>
                  <div style={{ fontSize:'10px',color:'var(--nv-text-muted)' }}>{t.fromPrice}</div>
                  <div style={{ fontFamily:'var(--nv-font-display)',fontSize:'15px',fontWeight:700,color:'var(--nv-green-600)' }}>{r.price.toLocaleString('fr-CM')}</div>
                  <div style={{ fontSize:'10px',color:'var(--nv-text-muted)' }}>FCFA</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- TRAIN ROUTES ---- */}
      <section className="nv-section-sm" style={{ background:'var(--nv-bg-page)' }}>
        <div className="nv-container">
          <div style={{ display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px' }}>
            <h2 style={{ fontFamily:'var(--nv-font-display)',fontSize:'clamp(18px,4.5vw,22px)',fontWeight:700,color:'var(--nv-gray-900)' }}>{t.trainTitle}</h2>
            <span className="nv-badge nv-badge-gold" style={{ marginLeft:'auto' }}>Camrail</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
            {TRAIN_ROUTES.map((r,i)=>(
              <button
                key={i}
                onClick={() => handleTrainRouteClick(r.from, r.to)}
                style={{ background:'var(--nv-bg-surface)', border:'1.5px solid var(--nv-border)', borderRadius:'var(--nv-radius-lg)', padding:'16px 18px', cursor:'pointer', textAlign:'left', transition:'all 200ms ease', fontFamily:'var(--nv-font-body)', width:'100%' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--nv-green-300)'; (e.currentTarget as HTMLElement).style.transform='translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--nv-border)'; (e.currentTarget as HTMLElement).style.transform='translateY(0)' }}
              >
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',flexWrap:'wrap' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--nv-font-display)',fontSize:'clamp(15px,4vw,18px)',fontWeight:700,color:'var(--nv-gray-900)',marginBottom:'3px' }}>
                      {r.from} <span style={{ color:'var(--nv-green-500)' }}>&rarr;</span> {r.to}
                    </div>
                    <div style={{ fontSize:'12px',color:'var(--nv-text-secondary)',marginBottom:'8px' }}>
                      {r.km} km &middot; {r.dep} &rarr; {r.arr} &middot; {r.time}
                    </div>
                    <div style={{ display:'flex',gap:'6px',flexWrap:'wrap' }}>
                      <span className={'nv-badge '+getTrainBadgeClass(r.type)}>{isMounted && lang==='en' ? r.typeEn : r.type.charAt(0).toUpperCase()+r.type.slice(1)}</span>
                      {r.classes.map(c=>(
                        <span key={c} className={'nv-badge '+(c==='Couchette'?'nv-badge-couchette':c==='1st'||c==='Premium'?'nv-badge-first':'nv-badge-second')}>{c}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign:'right',flexShrink:0 }}>
                    <div style={{ fontSize:'10px',color:'var(--nv-text-muted)' }}>{t.fromPrice}</div>
                    <div style={{ fontFamily:'var(--nv-font-display)',fontSize:'clamp(16px,4vw,20px)',fontWeight:700,color:'var(--nv-green-600)' }}>{r.price.toLocaleString('fr-CM')}</div>
                    <div style={{ fontSize:'10px',color:'var(--nv-text-muted)' }}>FCFA</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="nv-section" style={{ background:'var(--nv-bg-surface)',borderTop:'1.5px solid var(--nv-border)' }}>
        <div className="nv-container">
          <h2 style={{ fontFamily:'var(--nv-font-display)',fontSize:'clamp(20px,5vw,28px)',fontWeight:700,color:'var(--nv-gray-900)',marginBottom:'28px',textAlign:'center' }}>{t.howTitle}</h2>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'20px',maxWidth:'600px',margin:'0 auto' }}>
            {[
              {num:'01',title:t.s1,desc:t.s1d},
              {num:'02',title:t.s2,desc:t.s2d},
              {num:'03',title:t.s3,desc:t.s3d},
              {num:'04',title:t.s4,desc:t.s4d},
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ width:'48px',height:'48px',borderRadius:'50%',background:'var(--nv-green-600)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px',fontFamily:'var(--nv-font-display)',fontSize:'16px',fontWeight:800,color:'#fff' }}>{s.num}</div>
                <div style={{ fontSize:'14px',fontWeight:600,color:'var(--nv-gray-900)',marginBottom:'4px' }}>{s.title}</div>
                <div style={{ fontSize:'12px',color:'var(--nv-text-secondary)',lineHeight:1.5 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="nv-footer">
        <div className="nv-container">
          <div className="nv-footer-inner">
            <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="8" fill="#0f172a"/>
                <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
                <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
                <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
                <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
              </svg>
              <div className="nv-footer-logo">NyangaVoyage</div>
            </div>
            <div style={{ fontSize:'12px',color:'rgba(255,255,255,0.35)' }}>&copy; {t.footerRights}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
`;

fs.writeFileSync(path.join('app', 'page.tsx'), homePage, 'utf8');
console.log('Written: app/page.tsx - all buttons working');

// ============================================================
// Also fix globals.css to hide lang toggle
// ============================================================
let css = fs.readFileSync(path.join('app', 'globals.css'), 'utf8');
if (!css.includes('nv-lang-toggle { display: none')) {
  css += '\n.nv-lang-toggle { display: none !important; }\n';
  fs.writeFileSync(path.join('app', 'globals.css'), css, 'utf8');
  console.log('Updated: globals.css - language toggle hidden');
}

console.log('\nAll done! Fixed:');
console.log('- Bus search button works');
console.log('- Train search button works');
console.log('- Bus route cards are now buttons that work on click');
console.log('- Train route cards are now buttons that work on click');
console.log('- Language toggle hidden (auto-detected from device)');
console.log('- Error messages shown if fields are empty');
