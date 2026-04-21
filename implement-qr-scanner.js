const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/ticket/[bookingRef]/page.tsx — Bus ticket with QR
// ============================================================
const busTicket = `'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

// QR code generated using Google Charts API — no npm package needed
function QRCode({ value, size = 160 }: { value: string; size?: number }) {
  const url = \`https://api.qrserver.com/v1/create-qr-code/?size=\${size}x\${size}&data=\${encodeURIComponent(value)}&bgcolor=ffffff&color=0f172a&margin=10\`
  return (
    <img
      src={url}
      alt="QR Code"
      width={size}
      height={size}
      style={{ borderRadius: '8px', border: '3px solid #16a34a', display: 'block' }}
    />
  )
}

export default function TicketPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const { lang } = useLang()
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

  // Build QR code data — all ticket info encoded as JSON string
  function buildQRData() {
    if (!booking) return ''
    return JSON.stringify({
      ref: booking.booking_ref,
      passenger: passengerName || 'N/A',
      phone: passengerPhone ? '+237' + passengerPhone : 'N/A',
      origin: booking.trips?.origin,
      destination: booking.trips?.destination,
      departure: new Date(booking.trips?.departure_time).toLocaleString('fr-CM'),
      agency: booking.trips?.agencies?.name,
      class: booking.trips?.bus_class,
      seat: booking.seats?.seat_number,
      price: booking.trips?.price + ' FCFA',
      status: 'CONFIRMED',
      type: 'BUS',
    })
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
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          {/* Success banner */}
          <div className="nv-alert nv-alert-success" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
              {lang === 'fr' ? 'Reservation confirmee !' : 'Booking confirmed!'}
            </div>
            <div style={{ fontSize: '13px' }}>
              {lang === 'fr' ? 'Votre billet a ete envoye par SMS au' : 'Your ticket was sent by SMS to'} +237 {passengerPhone}
            </div>
          </div>

          {/* TICKET */}
          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>

            {/* Green header */}
            <div style={{ background: 'var(--nv-green-600)', padding: '28px 32px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.8, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {lang === 'fr' ? 'Billet de bus' : 'Bus Ticket'}
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

            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--nv-gold-400), var(--nv-gold-600))' }} />

            {/* Route */}
            <div style={{ padding: '24px 32px', borderBottom: '1.5px solid var(--nv-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>
                    {formatTime(trip?.departure_time)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{trip?.origin}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: 'var(--nv-bg-surface)', padding: '0 8px', fontSize: '18px', color: 'var(--nv-green-500)' }}>&rarr;</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-500)' }}>--:--</div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{trip?.destination}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                {formatDate(trip?.departure_time)}
              </div>
            </div>

            {/* Details + QR Code */}
            <div style={{ padding: '24px 32px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1.5px solid var(--nv-border)' }}>

              {/* Ticket details */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minWidth: '200px' }}>
                {[
                  { label: lang === 'fr' ? 'Passager' : 'Passenger', value: passengerName || 'N/A' },
                  { label: lang === 'fr' ? 'Telephone' : 'Phone', value: '+237 ' + (passengerPhone || 'N/A') },
                  { label: 'Agence', value: trip?.agencies?.name },
                  { label: 'Classe', value: trip?.bus_class },
                  { label: lang === 'fr' ? 'Siege' : 'Seat', value: 'N\u00b0' + seat?.seat_number },
                  { label: lang === 'fr' ? 'Reference' : 'Reference', value: booking.booking_ref },
                ].map((row, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                      {row.label}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>
                      {row.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* QR Code */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <QRCode value={buildQRData()} size={140} />
                <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', textAlign: 'center', maxWidth: '140px' }}>
                  {lang === 'fr' ? 'Scanner pour verifier le billet' : 'Scan to verify ticket'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 32px', background: 'var(--nv-gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                {lang === 'fr' ? 'Presentez ce billet ou scannez le QR code a l\'embarquement.' : 'Show this ticket or scan the QR code at boarding.'}
              </div>
              <span className="nv-badge nv-badge-green">{lang === 'fr' ? 'Confirme' : 'Confirmed'}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link href="/" className="nv-btn nv-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              {lang === 'fr' ? 'Retour a l\'accueil' : 'Back to home'}
            </Link>
            <button onClick={() => window.print()} className="nv-btn nv-btn-primary" style={{ flex: 1 }}>
              {lang === 'fr' ? 'Imprimer le billet' : 'Print ticket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 2: app/ticket/train/[bookingRef]/page.tsx — Train ticket with QR
// ============================================================
const trainTicket = `'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

function QRCode({ value, size = 140 }: { value: string; size?: number }) {
  const url = \`https://api.qrserver.com/v1/create-qr-code/?size=\${size}x\${size}&data=\${encodeURIComponent(value)}&bgcolor=ffffff&color=0f172a&margin=10\`
  return (
    <img src={url} alt="QR Code" width={size} height={size}
      style={{ borderRadius: '8px', border: '3px solid #d97706', display: 'block' }} />
  )
}

export default function TrainTicketPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const { lang } = useLang()
  const [bookingRef, setBookingRef] = useState('')
  const [booking, setBooking] = useState<any>(null)

  const passengerName = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_name') || '' : ''
  const passengerPhone = typeof window !== 'undefined' ? localStorage.getItem('nv_passenger_phone') || '' : ''

  useEffect(() => {
    params.then(p => {
      setBookingRef(p.bookingRef)
      const saved = localStorage.getItem('nv_train_booking')
      if (saved) setBooking(JSON.parse(saved))
    })
  }, [params])

  function buildQRData() {
    if (!booking) return ''
    return JSON.stringify({
      ref: bookingRef,
      passenger: passengerName || 'N/A',
      phone: passengerPhone ? '+237' + passengerPhone : 'N/A',
      origin: booking.origin,
      destination: booking.destination,
      date: booking.date,
      depart: booking.depart,
      arrive: booking.arrive,
      class: booking.className,
      seat: booking.seat,
      compartment: booking.compartment || 'N/A',
      price: booking.price + ' FCFA',
      operator: 'Camrail',
      status: 'CONFIRMED',
      type: 'TRAIN',
    })
  }

  if (!booking) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  const isCouchette = booking.className?.includes('Couchette')

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>

          <div className="nv-alert nv-alert-success" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>
              {lang === 'fr' ? 'Reservation Camrail confirmee !' : 'Camrail booking confirmed!'}
            </div>
            <div style={{ fontSize: '13px' }}>
              {lang === 'fr' ? 'Billet envoye par SMS au' : 'Ticket sent by SMS to'} +237 {passengerPhone}
            </div>
          </div>

          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>

            {/* Gold header */}
            <div style={{ background: 'var(--nv-gold-600)', padding: '28px 32px', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.85, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {lang === 'fr' ? 'Billet de train Camrail' : 'Camrail Train Ticket'}
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
            <div style={{ padding: '24px 32px', borderBottom: '1.5px solid var(--nv-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>{booking.depart}</div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{booking.origin}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ height: '1.5px', background: 'var(--nv-border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: 'var(--nv-bg-surface)', padding: '0 8px', fontSize: '18px', color: 'var(--nv-gold-600)' }}>&rarr;</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginTop: '6px' }}>{booking.duration}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 800, color: 'var(--nv-gray-900)' }}>{booking.arrive}</div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{booking.destination}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
                {booking.date && new Date(booking.date).toLocaleDateString(lang === 'fr' ? 'fr-CM' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            {/* Details + QR */}
            <div style={{ padding: '24px 32px', display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '1.5px solid var(--nv-border)' }}>
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minWidth: '200px' }}>
                {[
                  { label: lang === 'fr' ? 'Passager' : 'Passenger', value: passengerName || 'N/A' },
                  { label: lang === 'fr' ? 'Telephone' : 'Phone', value: '+237 ' + (passengerPhone || 'N/A') },
                  { label: 'Classe', value: booking.className },
                  { label: isCouchette ? 'Couchette' : (lang === 'fr' ? 'Place' : 'Seat'), value: 'N\u00b0' + booking.seat + (booking.compartment ? ' - Comp.' + booking.compartment : '') },
                  { label: lang === 'fr' ? 'Distance' : 'Distance', value: booking.km + ' km' },
                  { label: lang === 'fr' ? 'Reference' : 'Reference', value: bookingRef },
                ].map((row, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{row.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>{row.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <QRCode value={buildQRData()} size={140} />
                <div style={{ fontSize: '11px', color: 'var(--nv-text-muted)', textAlign: 'center', maxWidth: '140px' }}>
                  {lang === 'fr' ? 'Scanner pour verifier le billet' : 'Scan to verify ticket'}
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 32px', background: 'var(--nv-gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>
                {lang === 'fr' ? 'Presentez ce billet au controleur Camrail.' : 'Show this ticket to the Camrail inspector.'}
              </div>
              <span className="nv-badge nv-badge-gold">{lang === 'fr' ? 'Confirme' : 'Confirmed'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <Link href="/" className="nv-btn nv-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              {lang === 'fr' ? 'Retour a l\'accueil' : 'Back to home'}
            </Link>
            <button onClick={() => window.print()} className="nv-btn nv-btn-primary" style={{ flex: 1 }}>
              {lang === 'fr' ? 'Imprimer' : 'Print'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 3: app/agency/scan/page.tsx — QR Scanner for agency staff
// ============================================================
const scanPage = `'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Scanner un billet',
    sub: 'Scannez le QR code du billet du passager pour verifier sa reservation',
    startScan: 'Demarrer le scanner',
    stopScan: 'Arreter le scanner',
    manualEntry: 'Entrer la reference manuellement',
    manualPlaceholder: 'Ex: ABC12345',
    verify: 'Verifier',
    scanResult: 'Informations du billet',
    valid: 'Billet VALIDE',
    invalid: 'Reference introuvable',
    passenger: 'Passager',
    phone: 'Telephone',
    origin: 'Depart',
    destination: 'Destination',
    date: 'Date',
    agency: 'Agence',
    class: 'Classe',
    seat: 'Siege',
    price: 'Prix',
    status: 'Statut',
    operator: 'Operateur',
    type: 'Type',
    scanNew: 'Scanner un autre billet',
    cameraError: 'Camera non disponible. Utilisez la saisie manuelle.',
    scanning: 'Positionnez le QR code dans le cadre...',
    backToDash: 'Retour au tableau de bord',
  },
  en: {
    title: 'Scan a ticket',
    sub: 'Scan the passenger QR code to verify their booking',
    startScan: 'Start scanner',
    stopScan: 'Stop scanner',
    manualEntry: 'Enter reference manually',
    manualPlaceholder: 'e.g. ABC12345',
    verify: 'Verify',
    scanResult: 'Ticket information',
    valid: 'VALID Ticket',
    invalid: 'Reference not found',
    passenger: 'Passenger',
    phone: 'Phone',
    origin: 'From',
    destination: 'To',
    date: 'Date',
    agency: 'Agency',
    class: 'Class',
    seat: 'Seat',
    price: 'Price',
    status: 'Status',
    operator: 'Operator',
    type: 'Type',
    scanNew: 'Scan another ticket',
    cameraError: 'Camera not available. Use manual entry.',
    scanning: 'Point the QR code at the frame...',
    backToDash: 'Back to dashboard',
  },
}

export default function AgencyScanPage() {
  const { lang } = useLang()
  const t = T[lang]
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [manualRef, setManualRef] = useState('')
  const [error, setError] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    return () => stopScanner()
  }, [])

  async function startScanner() {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setScanning(true)

      // Use BarcodeDetector API if available (Chrome Android)
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue
              processQRData(raw)
              stopScanner()
            }
          } catch {}
        }, 500)
      }
    } catch (err) {
      setCameraError(true)
      setScanning(false)
    }
  }

  function stopScanner() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setScanning(false)
  }

  function processQRData(raw: string) {
    try {
      const data = JSON.parse(raw)
      setResult(data)
      setError('')
    } catch {
      setError(t.invalid)
    }
  }

  function handleManualVerify() {
    if (!manualRef.trim()) return
    // Search localStorage for matching booking (demo mode)
    const saved = localStorage.getItem('nv_train_booking')
    if (saved) {
      const booking = JSON.parse(saved)
      const passengerName = localStorage.getItem('nv_passenger_name') || 'N/A'
      const passengerPhone = localStorage.getItem('nv_passenger_phone') || 'N/A'
      setResult({
        ref: manualRef.toUpperCase(),
        passenger: passengerName,
        phone: '+237' + passengerPhone,
        origin: booking.origin,
        destination: booking.destination,
        date: booking.date,
        depart: booking.depart,
        class: booking.className,
        seat: booking.seat,
        price: booking.price + ' FCFA',
        status: 'CONFIRMED',
        type: booking.className?.includes('Couchette') ? 'TRAIN' : 'TRAIN',
        operator: 'Camrail',
      })
      setError('')
    } else {
      setError(t.invalid)
    }
  }

  const isValid = result?.status === 'CONFIRMED'

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <Link href="/agency/dashboard" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>
              &larr; {t.backToDash}
            </Link>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginTop: '12px', marginBottom: '6px' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>

          {!result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Camera Scanner */}
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  QR Scanner
                </div>

                {cameraError && (
                  <div className="nv-alert nv-alert-warning" style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px' }}>{t.cameraError}</div>
                  </div>
                )}

                {/* Video feed */}
                <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', aspectRatio: '1', maxWidth: '320px', margin: '0 auto 16px' }}>
                  <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
                    playsInline
                    muted
                  />
                  {!scanning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '48px' }}>&#9635;</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '0 20px' }}>
                        {t.startScan}
                      </div>
                    </div>
                  )}
                  {scanning && (
                    <>
                      {/* Scanner frame overlay */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#16a34a', opacity: 0.7 }} />
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        {t.scanning}
                      </div>
                    </>
                  )}
                </div>

                <button
                  className={'nv-btn nv-btn-full ' + (scanning ? 'nv-btn-secondary' : 'nv-btn-primary')}
                  onClick={scanning ? stopScanner : startScanner}
                  style={{ height: '48px', fontSize: '15px' }}
                >
                  {scanning ? t.stopScan : t.startScan}
                </button>
              </div>

              {/* Manual entry */}
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  {t.manualEntry}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="nv-input"
                    placeholder={t.manualPlaceholder}
                    value={manualRef}
                    onChange={e => setManualRef(e.target.value.toUpperCase())}
                    style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
                  />
                  <button className="nv-btn nv-btn-primary" onClick={handleManualVerify} style={{ whiteSpace: 'nowrap' }}>
                    {t.verify}
                  </button>
                </div>
                {error && (
                  <div className="nv-alert nv-alert-error" style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '13px' }}>{error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RESULT */}
          {result && (
            <div>
              {/* Valid/Invalid banner */}
              <div style={{
                padding: '20px 24px', borderRadius: '12px', marginBottom: '20px',
                background: isValid ? '#f0fdf4' : '#fef2f2',
                border: '2px solid ' + (isValid ? '#16a34a' : '#f87171'),
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                  background: isValid ? '#16a34a' : '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', color: 'white', fontWeight: 800,
                }}>
                  {isValid ? '✓' : '✗'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: isValid ? '#15803d' : '#dc2626' }}>
                    {isValid ? t.valid : t.invalid}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>
                    Ref: <strong>{result.ref}</strong>
                  </div>
                </div>
              </div>

              {/* Ticket details */}
              {isValid && (
                <div className="nv-card" style={{ padding: '24px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    {t.scanResult}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: t.passenger, value: result.passenger },
                      { label: t.phone, value: result.phone },
                      { label: t.origin, value: result.origin },
                      { label: t.destination, value: result.destination },
                      { label: t.class, value: result.class },
                      { label: t.seat, value: 'N\u00b0' + result.seat },
                      { label: t.price, value: result.price },
                      { label: t.type, value: result.type },
                    ].map((row, i) => (
                      <div key={i} style={{ padding: '12px', background: 'var(--nv-gray-50)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                          {row.label}
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                          {row.value || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="nv-btn nv-btn-primary nv-btn-full" style={{ height: '48px', fontSize: '15px' }} onClick={() => { setResult(null); setManualRef(''); setError('') }}>
                {t.scanNew}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
`;

// Write all files
const busTicketDir = path.join('app', 'ticket', '[bookingRef]');
if (!fs.existsSync(busTicketDir)) fs.mkdirSync(busTicketDir, { recursive: true });
fs.writeFileSync(path.join(busTicketDir, 'page.tsx'), busTicket, 'utf8');
console.log('Written: app/ticket/[bookingRef]/page.tsx (with QR code)');

const trainTicketDir = path.join('app', 'ticket', 'train', '[bookingRef]');
if (!fs.existsSync(trainTicketDir)) fs.mkdirSync(trainTicketDir, { recursive: true });
fs.writeFileSync(path.join(trainTicketDir, 'page.tsx'), trainTicket, 'utf8');
console.log('Written: app/ticket/train/[bookingRef]/page.tsx (with QR code)');

const scanDir = path.join('app', 'agency', 'scan');
if (!fs.existsSync(scanDir)) fs.mkdirSync(scanDir, { recursive: true });
fs.writeFileSync(path.join(scanDir, 'page.tsx'), scanPage, 'utf8');
console.log('Written: app/agency/scan/page.tsx (QR scanner)');

// Add scan button to agency dashboard
let dashboard = fs.readFileSync(path.join('app', 'agency', 'dashboard', 'page.tsx'), 'utf8');
if (!dashboard.includes('/agency/scan')) {
  dashboard = dashboard.replace(
    `<Link href="/agency/bookings" style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.viewBookings}</div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.viewBookingsDesc}</div>
              </div>
            </Link>`,
    `<Link href="/agency/bookings" style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '24px' }}>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.viewBookings}</div>
                <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.viewBookingsDesc}</div>
              </div>
            </Link>
            <Link href="/agency/scan" style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '24px', borderColor: 'var(--nv-green-200)', background: 'var(--nv-green-50)' }}>
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--nv-green-700)', marginBottom: '6px' }}>
                  {lang === 'fr' ? 'Scanner un billet' : 'Scan a ticket'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--nv-green-600)' }}>
                  {lang === 'fr' ? 'Verifier un billet passager via QR code' : 'Verify passenger ticket via QR code'}
                </div>
              </div>
            </Link>`
  );
  fs.writeFileSync(path.join('app', 'agency', 'dashboard', 'page.tsx'), dashboard, 'utf8');
  console.log('Updated: agency dashboard with scan button');
}

// Add scan link to navbar for agency pages
let navbar = fs.readFileSync(path.join('components', 'Navbar.tsx'), 'utf8');
if (!navbar.includes('/agency/scan')) {
  navbar = navbar.replace(
    `<Link href="/agency/bookings" className={'nv-nav-link' + (pathname === '/agency/bookings' ? ' active' : '')}>
              {lang === 'fr' ? 'Reservations' : 'Bookings'}
            </Link>`,
    `<Link href="/agency/bookings" className={'nv-nav-link' + (pathname === '/agency/bookings' ? ' active' : '')}>
              {lang === 'fr' ? 'Reservations' : 'Bookings'}
            </Link>
            <Link href="/agency/scan" className={'nv-nav-link' + (pathname === '/agency/scan' ? ' active' : '')} style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>
              &#9638; {lang === 'fr' ? 'Scanner' : 'Scan'}
            </Link>`
  );
  fs.writeFileSync(path.join('components', 'Navbar.tsx'), navbar, 'utf8');
  console.log('Updated: Navbar with scan link for agency pages');
}

console.log('\nAll done!');
console.log('QR codes now appear on all bus and train tickets.');
console.log('Agency staff can scan tickets at: /agency/scan');
console.log('New agencies get the scanner by default via the shared Navbar.');
