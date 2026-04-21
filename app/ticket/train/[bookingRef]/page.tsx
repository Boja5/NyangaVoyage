'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

function QRCode({ value, size = 140 }: { value: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=0f172a&margin=10`
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
                  { label: isCouchette ? 'Couchette' : (lang === 'fr' ? 'Place' : 'Seat'), value: 'N°' + booking.seat + (booking.compartment ? ' - Comp.' + booking.compartment : '') },
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
              {lang === 'fr' ? 'Retour a l accueil' : 'Back to home'}
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
