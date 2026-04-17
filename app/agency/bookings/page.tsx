'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function AgencyBookingsPage() {
  const router = useRouter()
  const [agency, setAgency] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)

    const { data: trips } = await supabase.from('trips').select('id').eq('agency_id', ag.id)
    const tripIds = (trips || []).map((t: any) => t.id)

    if (tripIds.length > 0) {
      const { data } = await supabase
        .from('bookings')
        .select('*, trips(origin, destination, departure_time, bus_class, price, agencies(name)), seats(seat_number)')
        .in('trip_id', tripIds)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false })
      setBookings(data || [])
    }
    setLoading(false)
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString('fr-CM', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
            Reservations
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>
            {bookings.length} reservation{bookings.length !== 1 ? 's' : ''} confirmee{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>Aucune reservation</div>
            <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>Les reservations de vos passagers apparaitront ici.</div>
          </div>
        ) : (
          <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                    {['Reference', 'Date reserv.', 'Trajet', 'Depart', 'Classe', 'Siege', 'Prix'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>
                        {b.trips?.origin} &rarr; {b.trips?.destination}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>
                        {formatDate(b.trips?.departure_time)} {formatTime(b.trips?.departure_time)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                          {b.trips?.bus_class}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)' }}>N{b.seats?.seat_number}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>
                        {b.trips?.price?.toLocaleString('fr-CM')} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
