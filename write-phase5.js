const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/checkout/page.tsx
// ============================================================
const checkoutPage = `'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function CheckoutInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const tripId = searchParams.get('tripId') || ''
  const seatId = searchParams.get('seatId') || ''
  const seatNumber = searchParams.get('seatNumber') || ''

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [momoNumber, setMomoNumber] = useState('')
  const [paying, setPaying] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!tripId) return
    supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('id', tripId)
      .single()
      .then(({ data }) => {
        setTrip(data)
        setLoading(false)
      })
  }, [tripId])

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
    setPaying(true)
    setCountdown(5)
  }

  async function finishBooking() {
    try {
      const bookingRef = Math.random().toString(36).slice(2, 10).toUpperCase()

      await supabase.from('seats').update({
        status: 'booked',
        locked_until: null,
        locked_by: null,
      }).eq('id', seatId)

      const { data: booking } = await supabase.from('bookings').insert({
        trip_id: tripId,
        seat_id: seatId,
        status: 'confirmed',
        booking_ref: bookingRef,
      }).select().single()

      if (booking) {
        router.push('/ticket/' + booking.booking_ref)
      }
    } catch (err) {
      console.error(err)
      setPaying(false)
      setCountdown(0)
    }
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  if (!trip) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', fontFamily: 'var(--nv-font-body)' }}>
      <div style={{ fontSize: '18px', fontWeight: 600 }}>Trajet introuvable</div>
      <Link href="/" className="nv-btn nv-btn-primary">Retour</Link>
    </div>
  )

  if (paying) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'var(--nv-font-body)', background: 'var(--nv-bg-page)' }}>
      <div className="nv-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
        <div className="nv-spinner nv-spinner-lg" style={{ margin: '0 auto 24px' }} />
        <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '8px' }}>
          Paiement en cours...
        </div>
        <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>
          Une notification MTN MoMo a ete envoyee au +237 {momoNumber}
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
        </div>
      </nav>

      <div style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', padding: '14px 0' }}>
        <div className="nv-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {['Recherche', 'Choix du siege', 'Paiement', 'Billet'].map((step, i) => (
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
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
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
                Entrez votre numero MTN MoMo. Une notification de paiement sera envoyee sur ce numero.
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
                    onChange={e => setMomoNumber(e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                  />
                </div>
                {errors.momoNumber && <div className="nv-error-msg">{errors.momoNumber}</div>}
              </div>
              <div className="nv-alert nv-alert-warning" style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '13px' }}>
                  Mode demo — aucun vrai paiement ne sera effectue. Cliquez Payer pour simuler la transaction.
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <div className="nv-card" style={{ padding: '24px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                Recapitulatif
              </div>

              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
                {trip.origin} &rarr; {trip.destination}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '20px' }}>
                {formatDate(trip.departure_time)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { label: 'Agence', value: trip.agencies?.name },
                  { label: 'Depart', value: formatTime(trip.departure_time) },
                  { label: 'Classe', value: trip.bus_class },
                  { label: 'Siege', value: 'N' + seatNumber },
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
                  {trip.price.toLocaleString('fr-CM')} FCFA
                </span>
              </div>

              <button className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" onClick={handlePay}>
                Payer {trip.price.toLocaleString('fr-CM')} FCFA &rarr;
              </button>
            </div>

            <Link href={'javascript:history.back()'} className="nv-btn nv-btn-secondary nv-btn-full" style={{ textAlign: 'center' }}>
              &larr; Retour
            </Link>
          </div>

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
      <CheckoutInner />
    </Suspense>
  )
}
`;

// ============================================================
// FILE 2: app/ticket/[bookingRef]/page.tsx
// ============================================================
const ticketPage = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TicketPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const router = useRouter()
  const [bookingRef, setBookingRef] = useState('')
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [smsSent, setSmsSent] = useState(false)
  const passengerName = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_name') || '' : ''
  const passengerPhone = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_phone') || '' : ''

  useEffect(() => {
    params.then(p => setBookingRef(p.bookingRef))
  }, [params])

  useEffect(() => {
    if (!bookingRef) return
    supabase
      .from('bookings')
      .select('*, trips(*, agencies(name)), seats(seat_number)')
      .eq('booking_ref', bookingRef)
      .single()
      .then(({ data }) => {
        setBooking(data)
        setLoading(false)
      })
  }, [bookingRef])

  useEffect(() => {
    if (!booking || smsSent) return
    const key = 'sms_sent_' + bookingRef
    if (localStorage.getItem(key)) return
    sendSMS()
    localStorage.setItem(key, '1')
    setSmsSent(true)
  }, [booking])

  async function sendSMS() {
    if (!booking) return
    try {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: passengerPhone,
          bookingRef: booking.booking_ref,
          origin: booking.trips?.origin,
          destination: booking.trips?.destination,
          departure: new Date(booking.trips?.departure_time).toLocaleString('fr-CM'),
          agency: booking.trips?.agencies?.name,
          busClass: booking.trips?.bus_class,
          seat: booking.seats?.seat_number,
          price: booking.trips?.price,
        }),
      })
    } catch (err) {
      console.error('SMS error:', err)
    }
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  if (!booking) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px', fontFamily: 'var(--nv-font-body)' }}>
      <div style={{ fontSize: '18px', fontWeight: 600 }}>Billet introuvable</div>
      <Link href="/" className="nv-btn nv-btn-primary">Retour</Link>
    </div>
  )

  const trip = booking.trips
  const seat = booking.seats

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-right">
            <button onClick={() => window.print()} className="nv-btn nv-btn-secondary nv-btn-sm">
              Imprimer le billet
            </button>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          {/* Success banner */}
          <div className="nv-alert nv-alert-success" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                Reservation confirmee !
              </div>
              <div style={{ fontSize: '13px' }}>
                Votre billet a ete envoye par SMS au +237 {passengerPhone}
              </div>
            </div>
          </div>

          {/* TICKET */}
          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>

            {/* Green header */}
            <div style={{ background: 'var(--nv-green-600)', padding: '28px 32px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Billet de bus
                  </div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {booking.booking_ref}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '2px' }}>NyangaVoyage</div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700 }}>
                    {trip?.price?.toLocaleString('fr-CM')} FCFA
                  </div>
                </div>
              </div>
            </div>

            {/* Gold accent bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600))' }} />

            {/* Route */}
            <div style={{ padding: '28px 32px', borderBottom: '1.5px solid var(--nv-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>
                    {formatTime(trip?.departure_time)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{trip?.origin}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--nv-bg-surface)', padding: '0 8px', fontSize: '18px', color: 'var(--nv-green-500)' }}>
                      &rarr;
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-500)' }}>
                    --:--
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{trip?.destination}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                {formatDate(trip?.departure_time)}
              </div>
            </div>

            {/* Details grid */}
            <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1.5px solid var(--nv-border)' }}>
              {[
                { label: 'Passager', value: passengerName || 'N/A' },
                { label: 'Telephone', value: '+237 ' + (passengerPhone || 'N/A') },
                { label: 'Agence', value: trip?.agencies?.name },
                { label: 'Classe', value: trip?.bus_class },
                { label: 'Siege', value: 'N' + seat?.seat_number },
                { label: 'Reference', value: booking.booking_ref },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 32px', background: 'var(--nv-gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                Presentez ce billet ou le SMS de confirmation a l'embarquement.
              </div>
              <span className={'nv-badge nv-badge-green'}>Confirme</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link href="/" className="nv-btn nv-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Retour a l'accueil
            </Link>
            <Link href="/search" className="nv-btn nv-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Nouveau trajet
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 3: app/train-checkout/page.tsx
// ============================================================
const trainCheckoutPage = `'use client'

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
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
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
                    onChange={e => setMomoNumber(e.target.value.replace(/\D/g, ''))}
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
`;

// ============================================================
// FILE 4: app/ticket/train/[bookingRef]/page.tsx
// ============================================================
const trainTicketPage = `'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function TrainTicketPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const [bookingRef, setBookingRef] = useState('')
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    params.then(p => {
      setBookingRef(p.bookingRef)
      const saved = localStorage.getItem('nv_train_booking')
      if (saved) setBooking(JSON.parse(saved))
    })
  }, [params])

  const passengerName = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_name') || '' : ''
  const passengerPhone = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_phone') || '' : ''

  if (!booking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  const isCouchette = booking.className?.includes('Couchette')

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>

      <nav className="nv-nav">
        <div className="nv-nav-inner">
          <Link href="/" className="nv-nav-logo">NyangaVoyage</Link>
          <div className="nv-nav-right">
            <span className="nv-badge nv-badge-gold">Camrail</span>
            <button onClick={() => window.print()} className="nv-btn nv-btn-secondary nv-btn-sm">
              Imprimer
            </button>
          </div>
        </div>
      </nav>

      <div className="nv-container" style={{ padding: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>

          <div className="nv-alert nv-alert-success" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
                Reservation Camrail confirmee !
              </div>
              <div style={{ fontSize: '13px' }}>
                Votre billet a ete envoye par SMS au +237 {passengerPhone}
              </div>
            </div>
          </div>

          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>

            {/* Gold header for train */}
            <div style={{ background: 'var(--nv-gold-600)', padding: '28px 32px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.85, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Billet de train Camrail
                  </div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    {bookingRef}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', opacity: 0.85, marginBottom: '2px' }}>NyangaVoyage x Camrail</div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '20px', fontWeight: 700 }}>
                    {booking.price?.toLocaleString('fr-CM')} FCFA
                  </div>
                </div>
              </div>
            </div>

            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--nv-green-400), var(--nv-green-600))' }} />

            {/* Route */}
            <div style={{ padding: '28px 32px', borderBottom: '1.5px solid var(--nv-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>
                    {booking.depart}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{booking.origin}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'var(--nv-bg-surface)', padding: '0 8px', fontSize: '18px', color: 'var(--nv-gold-600)' }}>
                      &rarr;
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginTop: '6px' }}>{booking.duration}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>
                    {booking.arrive}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{booking.destination}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                {booking.date && new Date(booking.date).toLocaleDateString('fr-CM', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom: '1.5px solid var(--nv-border)' }}>
              {[
                { label: 'Passager', value: passengerName || 'N/A' },
                { label: 'Telephone', value: '+237 ' + (passengerPhone || 'N/A') },
                { label: 'Classe', value: booking.className },
                { label: isCouchette ? 'Couchette N' : 'Place N', value: booking.seat + (booking.compartment ? ' - Comp. ' + booking.compartment : '') },
                { label: 'Distance', value: booking.km + ' km' },
                { label: 'Reference', value: bookingRef },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                    {row.label}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 32px', background: 'var(--nv-gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                Presentez ce billet au controleur Camrail a bord du train.
              </div>
              <span className="nv-badge nv-badge-gold">Confirme</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link href="/" className="nv-btn nv-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              Retour a l'accueil
            </Link>
            <Link href="/search" className="nv-btn nv-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
              Nouveau trajet
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// Write all files
fs.writeFileSync(path.join('app', 'checkout', 'page.tsx'), checkoutPage, 'utf8');
console.log('Written: app/checkout/page.tsx');

const ticketDir = path.join('app', 'ticket', '[bookingRef]');
if (!fs.existsSync(ticketDir)) fs.mkdirSync(ticketDir, { recursive: true });
fs.writeFileSync(path.join(ticketDir, 'page.tsx'), ticketPage, 'utf8');
console.log('Written: app/ticket/[bookingRef]/page.tsx');

const trainCheckoutDir = path.join('app', 'train-checkout');
if (!fs.existsSync(trainCheckoutDir)) fs.mkdirSync(trainCheckoutDir, { recursive: true });
fs.writeFileSync(path.join(trainCheckoutDir, 'page.tsx'), trainCheckoutPage, 'utf8');
console.log('Written: app/train-checkout/page.tsx');

const trainTicketDir = path.join('app', 'ticket', 'train', '[bookingRef]');
if (!fs.existsSync(trainTicketDir)) fs.mkdirSync(trainTicketDir, { recursive: true });
fs.writeFileSync(path.join(trainTicketDir, 'page.tsx'), trainTicketPage, 'utf8');
console.log('Written: app/ticket/train/[bookingRef]/page.tsx');

console.log('Phase 5 complete!');
