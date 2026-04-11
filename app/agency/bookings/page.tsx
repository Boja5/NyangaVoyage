'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Booking {
  id: string
  booking_ref: string
  status: string
  created_at: string
  trips: {
    origin: string
    destination: string
    departure_time: string
    bus_class: string
    price: number
  } | null
  seats: {
    seat_number: number
  } | null
}

interface Agency {
  id: string
  name: string
}

export default function AgencyBookingsPage() {
  const router = useRouter()

  const [agency, setAgency]     = useState<Agency | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    loadPage()
  }, [])

  async function loadPage() {
    setLoading(true)

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }

    // Get agency
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!agencyData) { router.push('/agency/login'); return }
    setAgency(agencyData)

    // Get all trip IDs for this agency
    const { data: agencyTrips } = await supabase
      .from('trips')
      .select('id')
      .eq('agency_id', agencyData.id)

    const tripIds = agencyTrips?.map(t => t.id) || []

    if (tripIds.length === 0) {
      // No trips yet so no bookings
      setLoading(false)
      return
    }

    // Get all bookings for those trips, joining trip and seat details
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          origin,
          destination,
          departure_time,
          bus_class,
          price
        ),
        seats (
          seat_number
        )
      `)
      .in('trip_id', tripIds)
      .order('created_at', { ascending: false }) // newest bookings first

    setBookings(bookingsData || [])
    setLoading(false)
  }

  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  function formatBookingDate(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading bookings...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <button onClick={() => router.push('/agency/dashboard')} className="text-green-600 text-sm mb-1">
            ← Back to dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
          <p className="text-gray-400 text-sm">{agency?.name} · {bookings.length} total bookings</p>
        </div>

        {/* NO BOOKINGS */}
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No bookings yet</p>
            <p className="text-gray-300 text-sm">Bookings will appear here once passengers start booking your trips</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

                {/* BOOKING REF + DATE */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {/* Booking reference in green — easy to match at the bus station */}
                    <p className="font-bold text-green-600 text-lg tracking-wider">
                      {booking.booking_ref}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Booked on {formatBookingDate(booking.created_at)}
                    </p>
                  </div>
                  {/* Status badge */}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-500'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* TRIP DETAILS */}
                {booking.trips && (
                  <div className="border-t border-gray-50 pt-3">
                    <p className="font-semibold text-gray-800 mb-1">
                      {booking.trips.origin} → {booking.trips.destination}
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">
                          {formatDateTime(booking.trips.departure_time)}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {booking.trips.bus_class} · Seat {booking.seats?.seat_number ?? '—'}
                        </p>
                      </div>
                      <p className="text-green-600 font-bold">
                        {formatPrice(booking.trips.price)}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}