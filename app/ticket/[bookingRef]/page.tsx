'use client'

import React, { useEffect, useState } from 'react'
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
    agencies: { name: string } | null
  } | null
  seats: {
    seat_number: number
  } | null
}

export default function TicketPage({ params }: { params: Promise<{ bookingRef: string }> }) {
  const { bookingRef } = React.use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  const passengerName  = typeof window !== 'undefined' ? localStorage.getItem('passenger_name')  || 'Passenger' : 'Passenger'
  const passengerPhone = typeof window !== 'undefined' ? localStorage.getItem('passenger_phone') || '' : ''

  useEffect(() => {
    loadBooking()
  }, [])

  async function loadBooking() {
    setLoading(true)

    const { data } = await supabase
      .from('bookings')
      .select(`*, trips ( origin, destination, departure_time, bus_class, price, agencies ( name ) ), seats ( seat_number )`)
      .eq('booking_ref', bookingRef)
      .single()

    if (!data) { router.push('/'); return }
    setBooking(data)

    // Send SMS confirmation if we have a phone number
    // We only send once — check localStorage flag so it doesn't send on every page refresh
    const smsSent = localStorage.getItem(`sms_sent_${bookingRef}`)
    const phone   = localStorage.getItem('passenger_phone')

    if (!smsSent && phone && data.trips) {
      try {
        await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to:            phone,
            bookingRef:    data.booking_ref,
            origin:        data.trips.origin,
            destination:   data.trips.destination,
            departureTime: data.trips.departure_time,
            agencyName:    data.trips.agencies?.name || '',
            busClass:      data.trips.bus_class,
            seatNumber:    data.seats?.seat_number ?? '—',
          }),
        })
        // Mark as sent so we don't send again on refresh
        localStorage.setItem(`sms_sent_${bookingRef}`, 'true')
      } catch (e) {
        console.error('SMS failed:', e)
      }
    }

    setLoading(false)
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      weekday: 'long', day: 'numeric', month: 'long',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading ticket...
      </div>
    )
  }

  if (!booking || !booking.trips) return null

  const trip = booking.trips

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* SUCCESS BANNER */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Booking Confirmed!</h1>
          <p className="text-gray-400 text-sm">Your ticket has been reserved successfully</p>
          {passengerPhone && (
            <p className="text-green-500 text-xs mt-1">
              📱 SMS confirmation sent to {passengerPhone}
            </p>
          )}
        </div>

        {/* TICKET CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">

          {/* Green header with booking reference */}
          <div className="bg-green-600 px-5 py-4">
            <p className="text-green-100 text-xs uppercase tracking-widest mb-1">Booking Reference</p>
            <p className="text-white text-3xl font-bold tracking-widest">{booking.booking_ref}</p>
          </div>

          <div className="p-5">

            {/* Route */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Route</p>
              <p className="text-xl font-bold text-gray-800">{trip.origin} → {trip.destination}</p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Departure</p>
                <p className="text-sm font-semibold text-gray-700">{formatDateTime(trip.departure_time)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Agency</p>
                <p className="text-sm font-semibold text-gray-700">{trip.agencies?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Class</p>
                <p className="text-sm font-semibold text-gray-700">{trip.bus_class}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Seat</p>
                <p className="text-sm font-semibold text-gray-700">{booking.seats?.seat_number ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Passenger</p>
                <p className="text-sm font-semibold text-gray-700">{passengerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                <p className="text-sm font-semibold text-gray-700">{passengerPhone}</p>
              </div>
            </div>

            {/* Price */}
            <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
              <p className="text-gray-400 text-sm">Total Paid</p>
              <p className="text-green-600 font-bold text-xl">{formatPrice(trip.price)}</p>
            </div>

          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6">
          <p className="text-green-800 text-sm font-semibold mb-2">What to do next:</p>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Show this booking reference at the bus station</li>
            <li>• Arrive at least 30 minutes before departure</li>
            <li>• Bring a valid ID document</li>
          </ul>
        </div>

        {/* BOOK ANOTHER TRIP */}
        <button
          onClick={() => router.push('/')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg transition"
        >
          Book Another Trip
        </button>

      </div>
    </main>
  )
}