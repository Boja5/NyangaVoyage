'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function TrainCheckoutInner() {
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
  const seat = searchParams.get('seat') || ''
  const compartment = searchParams.get('compartment') || ''

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [momoNumber, setMomoNumber] = useState('')
  const [paying, setPaying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (countdown <= 0) return
    if (countdown === 1) finishBooking()
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Veuillez entrer votre nom complet'
    if (!phone.trim() || phone.length < 9) e.phone = 'Numero de telephone invalide'
    if (!momoNumber.trim() || momoNumber.length < 9) e.momoNumber = 'Numero MTN MoMo invalide'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePay() {
    if (!validate()) return
    localStorage.setItem('nv_passenger_name', fullName)
    localStorage.setItem('nv_passenger_phone', phone)
    localStorage.setItem('nv_train_booking', JSON.stringify({
      origin, destination, date, className, depart, arrive,
      duration, km, price, seat, compartment,
      passengerName: fullName, passengerPhone: phone,
    }))
    setPaying(true)
    setCountdown(5)
  }

  function finishBooking() {
    const ref = 'TR' + Math.random().toString(36).slice(2, 8).toUpperCase()
    router.push('/ticket/train/' + ref)
  }

  if (paying) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)', background: 'var(--nv-bg-page)' }}>
      <div className="nv-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div className="nv-spinner nv-spinner-lg" style={{ margin: '0 auto 24px' }} />
        <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>
          Paiement en cours...
        </div>
        <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>
          Notification MTN MoMo envoyee au +237 {momoNumber}
        </div>
        <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--nv-green-600)' }}>
          {countdown}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--nv-text-muted)', marginTop: '8px' }}>
          Confirmation dans {countdown} seconde{countdown > 1 ? 's' : ''}...
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-right">
            <span className="nv-badge nv-badge-gold">Camrail</span>
          </div>
        </div>
      </nav>

      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '14px 0' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {['Recherche', 'Choix de la place', 'Paiement', 'Billet'].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {i > 0 && <span style={{ color: 'var(--nv-text-muted)' }}>&rarr;</span>}
                <span style={{
                  fontWeight: i === 2 ? 600 : 400,
                  color: i === 2 ? 'var(--nv-green-600)' : i < 2 ? 'var(--nv-text-secondary)' : 'var(--nv-text-muted)',
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="nv-container" style={{ padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>

          {/* FORM */}
          <div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '24px' }}>
              Informations passager
            </h1>

            <div className="nv-card" style={{ padding: '28px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="nv-form-group">
                  <label className="nv-label">Nom complet</label>
                  <input
                    type="text"
                    className={'nv-input' + (errors.fullName ? ' nv-input-error' : '')}
                    placeholder="Ex: Jean-Pierre Mbida"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                  {errors.fullName && <div className="nv-error-msg">{errors.fullName}</div>}
                </div>
                <div className="nv-form-group">
                  <label className="nv-label">Numero de telephone</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '10px 14px', background: 'var(--nv-gray-100)', border: '1.5px solid var(--nv-border)', borderRadius: 'var(--nv-radius-md)', fontSize: '14px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>
                      +237
                    </div>
                    <input
                      type="tel"
                      className={'nv-input' + (errors.phone ? ' nv-input-error' : '')}
                      placeholder="6XXXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/D/g, ''))}
                      maxLength={9}
                    />
                  </div>
                  {errors.phone && <div className="nv-error-msg">{errors.phone}</div>}
                </div>
              </div>
            </div>

            <div className="nv-card" style={{ padding: '28px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>
                Paiement MTN Mobile Money
              </div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '18px' }}>
                Paiement accepte via MTN MoMo ou Orange Money uniquement (Camrail).
              </div>
              <div className="nv-form-group">
                <label className="nv-label">Numero MTN MoMo</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ padding: '10px 14px', background: 'var(--nv-gold-50)', border: '1.5px solid var(--nv-gold-200)', borderRadius: 'var(--nv-radius-md)', fontSize: '14px', color: 'var(--nv-gold-700)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    MTN +237
                  </div>
                  <input
                    type="tel"
                    className={'nv-input' + (errors.momoNumber ? ' nv-input-error' : '')}
                    placeholder="6XXXXXXXX"
                    value={momoNumber}
                    onChange={e => setMomoNumber(e.target.value.replace(/D/g, ''))}
                    maxLength={9}
                  />
                </div>
                {errors.momoNumber && <div className="nv-error-msg">{errors.momoNumber}</div>}
              </div>
              <div className="nv-alert nv-alert-warning" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '13px' }}>
                  Mode demo — aucun vrai paiement ne sera effectue.
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="nv-card" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Recapitulatif Camrail
              </div>

              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
                {origin} &rarr; {destination}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>
                {date && new Date(date).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Depart', value: depart },
                  { label: 'Arrivee', value: arrive },
                  { label: 'Duree', value: duration },
                  { label: 'Distance', value: km + ' km' },
                  { label: 'Classe', value: className },
                  { label: className.includes('Couchette') ? 'Couchette' : 'Place', value: 'N' + seat + (compartment ? ' - Comp. ' + compartment : '') },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--nv-text-secondary)' }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1.5px solid var(--nv-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Total</span>
                <span style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-green-600)' }}>
                  {price.toLocaleString('fr-CM')} FCFA
                </span>
              </div>

              <button className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" onClick={handlePay}>
                Payer {price.toLocaleString('fr-CM')} FCFA &rarr;
              </button>
            </div>

            <Link href="javascript:history.back()" className="nv-btn nv-btn-secondary nv-btn-full" style={{ textAlign: 'center' }}>
              &larr; Retour
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrainCheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <TrainCheckoutInner />
    </Suspense>
  )
}
