'use client'

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

      <div className="nv-container" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
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
            <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--nv-border)' }}>
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
