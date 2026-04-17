'use client'

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

      <div className="nv-container" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
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
