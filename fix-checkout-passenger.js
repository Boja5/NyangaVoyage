const fs = require('fs');
const path = require('path');

const checkout = `'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Informations passager',
    summary: 'Recapitulatif',
    name: 'Nom complet', namePlaceholder: 'Votre nom complet',
    phone: 'Numero de telephone', phonePlaceholder: '6XXXXXXXX',
    pay: 'Payer', paying: 'Paiement en cours...',
    momo: 'Paiement MTN Mobile Money',
    momoDesc: 'Entrez le numero MTN MoMo pour le paiement',
    momoNum: 'Numero MTN MoMo', momoPlaceholder: '6XXXXXXXX',
    processing: 'Traitement du paiement...',
    confirm: 'Confirmer le paiement',
    agency: 'Agence', class: 'Classe', seat: 'Siege', total: 'Total',
    from: 'Depart', to: 'Destination', date: 'Date',
    fillAll: 'Veuillez remplir tous les champs',
    back: 'Retour',
    departure: 'Depart',
  },
  en: {
    title: 'Passenger information',
    summary: 'Summary',
    name: 'Full name', namePlaceholder: 'Your full name',
    phone: 'Phone number', phonePlaceholder: '6XXXXXXXX',
    pay: 'Pay', paying: 'Processing payment...',
    momo: 'MTN Mobile Money Payment',
    momoDesc: 'Enter your MTN MoMo number for payment',
    momoNum: 'MTN MoMo number', momoPlaceholder: '6XXXXXXXX',
    processing: 'Processing payment...',
    confirm: 'Confirm payment',
    agency: 'Agency', class: 'Class', seat: 'Seat', total: 'Total',
    from: 'From', to: 'To', date: 'Date',
    fillAll: 'Please fill all fields',
    back: 'Back',
    departure: 'Departure',
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]

  const tripId   = searchParams.get('tripId') || ''
  const seatId   = searchParams.get('seatId') || ''
  const seatNum  = searchParams.get('seatNumber') || ''

  const [trip, setTrip] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [momoNum, setMomoNum] = useState('')
  const [step, setStep] = useState<'info'|'payment'|'processing'>('info')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(5)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore saved passenger info
    const savedName = localStorage.getItem('nv_passenger_name')
    const savedPhone = localStorage.getItem('nv_passenger_phone')
    if (savedName) setName(savedName)
    if (savedPhone) setPhone(savedPhone)
    fetchTrip()
  }, [tripId])

  async function fetchTrip() {
    if (!tripId) return
    const { data } = await supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('id', tripId)
      .single()
    setTrip(data)
    setLoading(false)
  }

  function handleInfoSubmit() {
    if (!name.trim() || !phone.trim()) {
      setError(t.fillAll)
      return
    }
    setError('')
    // Save passenger info to localStorage
    localStorage.setItem('nv_passenger_name', name.trim())
    localStorage.setItem('nv_passenger_phone', phone.trim())
    setMomoNum(phone.trim())
    setStep('payment')
  }

  async function handlePayment() {
    if (!momoNum.trim()) {
      setError(t.fillAll)
      return
    }
    setError('')
    setStep('processing')

    // Simulate MTN MoMo countdown
    let count = 5
    setCountdown(count)
    const timer = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(timer)
        confirmBooking()
      }
    }, 1000)
  }

  async function confirmBooking() {
    // Generate booking reference
    const ref = Math.random().toString(36).substring(2, 6).toUpperCase() +
                Math.random().toString(36).substring(2, 6).toUpperCase()

    // Lock the seat
    await supabase
      .from('seats')
      .update({ status: 'booked', locked_until: null })
      .eq('id', seatId)

    // Create booking with passenger name and phone saved
    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        seat_id: seatId,
        booking_ref: ref,
        passenger_name: name.trim(),
        passenger_phone: '+237' + phone.trim().replace(/^(\+237|237)/, ''),
        status: 'confirmed',
      })

    if (bookingError) {
      console.error('Booking error:', bookingError)
    }

    // Save to localStorage for ticket display
    localStorage.setItem('nv_passenger_name', name.trim())
    localStorage.setItem('nv_passenger_phone', phone.trim())

    router.push('/ticket/' + ref)
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>

        {/* Breadcrumb */}
        <div className="nv-breadcrumb" style={{ marginBottom: '24px' }}>
          <Link href="/" style={{ color: 'var(--nv-text-secondary)' }}>&larr; {t.back}</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', maxWidth: '900px', alignItems: 'start' }} className="nv-checkout-layout">

          {/* Left: Form */}
          <div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
              {['info', 'payment', 'processing'].map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: step === s ? 'var(--nv-green-600)' : (i < ['info','payment','processing'].indexOf(step) ? 'var(--nv-green-200)' : 'var(--nv-gray-200)'),
                    color: step === s ? '#fff' : 'var(--nv-text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  {i < 2 && <div style={{ width: '32px', height: '2px', background: 'var(--nv-gray-200)' }} />}
                </div>
              ))}
            </div>

            {/* Step 1: Passenger info */}
            {step === 'info' && (
              <div className="nv-card" style={{ padding: '28px' }}>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '24px' }}>
                  {t.title}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.name}</label>
                    <input
                      type="text"
                      className="nv-input"
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="nv-form-group">
                    <label className="nv-label">{t.phone}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ padding: '10px 12px', border: '1.5px solid var(--nv-border)', borderRadius: 'var(--nv-radius-md)', background: 'var(--nv-gray-50)', fontSize: '14px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                        +237
                      </div>
                      <input
                        type="tel"
                        className="nv-input"
                        placeholder={t.phonePlaceholder}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                </div>
                {error && <div className="nv-alert nv-alert-error" style={{ marginTop: '16px' }}><div style={{ fontSize: '13px' }}>{error}</div></div>}
                <button className="nv-btn nv-btn-primary nv-btn-full" style={{ marginTop: '24px', height: '48px', fontSize: '15px', fontWeight: 700 }} onClick={handleInfoSubmit}>
                  {t.pay} {trip?.price?.toLocaleString('fr-CM')} FCFA &rarr;
                </button>
              </div>
            )}

            {/* Step 2: MTN MoMo payment */}
            {step === 'payment' && (
              <div className="nv-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>&#128242;</div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>{t.momo}</h2>
                    <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.momoDesc}</div>
                  </div>
                </div>
                <div className="nv-form-group" style={{ marginBottom: '20px' }}>
                  <label className="nv-label">{t.momoNum}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ padding: '10px 12px', border: '1.5px solid var(--nv-border)', borderRadius: 'var(--nv-radius-md)', background: 'var(--nv-gray-50)', fontSize: '14px', color: 'var(--nv-text-secondary)', display: 'flex', alignItems: 'center' }}>+237</div>
                    <input type="tel" className="nv-input" value={momoNum} onChange={e => setMomoNum(e.target.value)} placeholder={t.momoPlaceholder} style={{ flex: 1 }} />
                  </div>
                </div>
                {error && <div className="nv-alert nv-alert-error" style={{ marginBottom: '16px' }}><div style={{ fontSize: '13px' }}>{error}</div></div>}
                <div style={{ background: 'var(--nv-green-50)', border: '1.5px solid var(--nv-green-200)', borderRadius: 'var(--nv-radius-md)', padding: '14px 16px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--nv-green-700)' }}>
                    {lang === 'fr' ? 'Montant a debiter:' : 'Amount to debit:'} <strong>{trip?.price?.toLocaleString('fr-CM')} FCFA</strong>
                  </div>
                </div>
                <button className="nv-btn nv-btn-primary nv-btn-full" style={{ height: '48px', fontSize: '15px', fontWeight: 700 }} onClick={handlePayment}>
                  {t.confirm} — {trip?.price?.toLocaleString('fr-CM')} FCFA
                </button>
              </div>
            )}

            {/* Step 3: Processing */}
            {step === 'processing' && (
              <div className="nv-card" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="nv-spinner nv-spinner-lg" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>
                  {t.processing}
                </h2>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '48px', fontWeight: 800, color: 'var(--nv-green-600)', marginTop: '16px' }}>
                  {countdown}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginTop: '8px' }}>
                  {lang === 'fr' ? 'Confirmation dans' : 'Confirming in'} {countdown}s
                </div>
              </div>
            )}
          </div>

          {/* Right: Summary */}
          {trip && (
            <div className="nv-card nv-checkout-summary" style={{ padding: '24px', position: 'sticky', top: '80px' }}>
              <h3 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                {t.summary}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: t.from,     value: trip.origin },
                  { label: t.to,       value: trip.destination },
                  { label: t.departure,value: formatTime(trip.departure_time) + ' — ' + formatDate(trip.departure_time) },
                  { label: t.agency,   value: trip.agencies?.name },
                  { label: t.class,    value: trip.bus_class },
                  { label: t.seat,     value: 'N\u00b0' + seatNum },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--nv-text-secondary)', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--nv-gray-900)', textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ height: '1.5px', background: 'var(--nv-border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>{t.total}</span>
                  <span style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--nv-green-600)' }}>
                    {trip.price?.toLocaleString('fr-CM')} FCFA
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="nv-spinner nv-spinner-lg" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
`;

const checkoutDir = path.join('app', 'checkout');
if (!fs.existsSync(checkoutDir)) fs.mkdirSync(checkoutDir, { recursive: true });
fs.writeFileSync(path.join(checkoutDir, 'page.tsx'), checkout, 'utf8');
console.log('Written: app/checkout/page.tsx');
console.log('Passenger name and phone are now saved to Supabase bookings table.');
console.log('\nMake sure you ran this SQL in Supabase:');
console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_name text;');
console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_phone text;');
