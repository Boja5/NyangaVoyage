'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Trip {
  id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  price: number
  agencies: { name: string } | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read the three values passed from the seat map page via the URL
  const tripId     = searchParams.get('tripId')
  const seatId     = searchParams.get('seatId')
  const seatNumber = searchParams.get('seatNumber')

  const [trip, setTrip]         = useState<Trip | null>(null)
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone]       = useState('')
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!tripId) { router.push('/'); return }
    loadTrip()
  }, [])

  async function loadTrip() {
    setLoading(true)
    const { data } = await supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('id', tripId)
      .single()

    if (!data) { router.push('/'); return }
    setTrip(data)
    setLoading(false)
  }

  async function handlePay() {
    // Validate inputs
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!phone.trim())    { setError('Please enter your phone number.'); return }

    setError('')
    setPaying(true)

    // For MVP we skip auth entirely — create booking with no user_id
    // We store the passenger name and phone directly on the booking
    // First we need to add those columns — but to keep it simple for MVP,
    // we just create the booking and store name/phone in localStorage
    localStorage.setItem('passenger_name', fullName.trim())
    localStorage.setItem('passenger_phone', phone.trim())

    // Create the booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,       // which trip
        seat_id: seatId,       // which seat
        status: 'confirmed',   // immediately confirmed for MVP
        // user_id is intentionally omitted — not using auth for MVP
      })
      .select()
      .single()

    if (bookingError || !booking) {
      // Show the actual error so we can debug it
      setError('Booking failed: ' + (bookingError?.message || 'unknown error'))
      setPaying(false)
      return
    }

    // Mark the seat as booked so no one else can take it
    await supabase
      .from('seats')
      .update({ status: 'booked', locked_by: null, locked_until: null })
      .eq('id', seatId)

    // Go to the ticket page with the booking reference
    router.push(`/ticket/${booking.booking_ref}`)
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    )
  }

  if (!trip) return null

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* ── BACK BUTTON ── */}
        <button onClick={() => router.back()} className="text-green-600 text-sm mb-4">
          ← Back to seats
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        {/* ── TRIP SUMMARY ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Trip Summary
          </h2>
          <p className="text-lg font-bold text-gray-800 mb-1">
            {trip.origin} → {trip.destination}
          </p>
          <p className="text-gray-400 text-sm mb-1">
            {trip.agencies?.name} · {trip.bus_class}
          </p>
          <p className="text-gray-500 text-sm mb-3">
            {formatDateTime(trip.departure_time)}
          </p>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <p className="text-gray-500 text-sm">Seat {seatNumber}</p>
            <p className="text-green-600 font-bold text-xl">{formatPrice(trip.price)}</p>
          </div>
        </div>

        {/* ── PASSENGER DETAILS ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Passenger Details
          </h2>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Jean-Baptiste Mbarga"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 6XX XXX XXX"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
            />
          </div>
        </div>

        {/* ── ERROR MESSAGE ── */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* ── PAY BUTTON ── */}
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-4 rounded-2xl text-lg transition"
        >
          {paying ? 'Processing...' : `Pay ${formatPrice(trip.price)}`}
        </button>

        <p className="text-center text-xs text-gray-300 mt-4">
          Demo mode — no real payment is charged
        </p>

      </div>
    </main>
  )
}