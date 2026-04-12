'use client'

import React, { useEffect, useState, Suspense } from 'react'
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

// ── INNER COMPONENT ───────────────────────────────────────────────────────────
function CheckoutInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const tripId     = searchParams.get('tripId')
  const seatId     = searchParams.get('seatId')
  const seatNumber = searchParams.get('seatNumber')

  const [trip, setTrip]           = useState<Trip | null>(null)
  const [loading, setLoading]     = useState(true)
  const [fullName, setFullName]   = useState('')
  const [phone, setPhone]         = useState('')
  const [mtnNumber, setMtnNumber] = useState('')
  const [error, setError]         = useState('')

  // Payment flow states
  // idle = form, processing = spinner screen, done = success
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'done'>('idle')
  const [countdown, setCountdown]       = useState(5)

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
    // Validation
    if (!fullName.trim())   { setError('Please enter your full name.'); return }
    if (!phone.trim())      { setError('Please enter your phone number.'); return }
    if (!mtnNumber.trim())  { setError('Please enter your MTN MoMo number.'); return }
    if (mtnNumber.trim().length < 9) { setError('Please enter a valid MTN number.'); return }

    setError('')

    // Save passenger details for ticket page
    localStorage.setItem('passenger_name', fullName.trim())
    localStorage.setItem('passenger_phone', phone.trim())

    // Show the payment pending screen
    setPaymentState('processing')

    // Simulate MTN push notification countdown (5 seconds)
    // When real MTN API is ready, replace this with the actual API call
    let seconds = 5
    const timer = setInterval(() => {
      seconds -= 1
      setCountdown(seconds)
      if (seconds <= 0) {
        clearInterval(timer)
        confirmBooking()
      }
    }, 1000)
  }

  async function confirmBooking() {
    // Create the booking in the database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        trip_id: tripId,
        seat_id: seatId,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError || !booking) {
      setPaymentState('idle')
      setError('Booking failed: ' + (bookingError?.message || 'unknown error'))
      return
    }

    // Mark seat as booked
    await supabase
      .from('seats')
      .update({ status: 'booked', locked_by: null, locked_until: null })
      .eq('id', seatId)

    setPaymentState('done')

    // Redirect to ticket after 1 second
    setTimeout(() => {
      router.push(`/ticket/${booking.booking_ref}`)
    }, 1000)
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

  // ── PAYMENT PROCESSING SCREEN ─────────────────────────────────────────────
  if (paymentState === 'processing') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">

          {/* MTN MOMO LOGO AREA */}
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">📱</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Pending</h2>
          <p className="text-gray-500 mb-2">A payment request has been sent to:</p>
          <p className="text-xl font-bold text-yellow-600 mb-6">{mtnNumber}</p>

          {/* INSTRUCTIONS */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 text-left">
            <p className="text-yellow-800 font-semibold text-sm mb-3">Follow these steps:</p>
            <ol className="text-yellow-700 text-sm space-y-2">
              <li>1. Check your phone for an MTN MoMo notification</li>
              <li>2. Open the MTN MoMo app or dial *126#</li>
              <li>3. Approve the payment of <strong>{formatPrice(trip.price)}</strong></li>
              <li>4. Enter your MTN MoMo PIN to confirm</li>
            </ol>
          </div>

          {/* COUNTDOWN */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-gray-400 text-sm mb-2">Waiting for confirmation...</p>
            {/* Animated spinner */}
            <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-300 text-xs">
              This page will update automatically
            </p>
          </div>

          {/* AMOUNT */}
          <p className="text-gray-400 text-sm">
            Amount: <span className="font-bold text-gray-700">{formatPrice(trip.price)}</span>
          </p>

        </div>
      </main>
    )
  }

  // ── PAYMENT SUCCESS SCREEN ────────────────────────────────────────────────
  if (paymentState === 'done') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Confirmed!</h2>
          <p className="text-gray-400">Redirecting to your ticket...</p>
        </div>
      </main>
    )
  }

  // ── CHECKOUT FORM ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        <button onClick={() => router.back()} className="text-green-600 text-sm mb-4">
          ← Back to seats
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

        {/* TRIP SUMMARY */}
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

        {/* PASSENGER DETAILS */}
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

        {/* MTN MOMO PAYMENT */}
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm p-5 mb-6">

          {/* MTN Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-lg">📱</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-800">MTN Mobile Money</h2>
              <p className="text-gray-400 text-xs">You will receive a push notification</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 font-medium">
              MTN MoMo Number
            </label>
            <div className="flex gap-2">
              {/* Country code prefix */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm text-gray-500 font-medium">
                +237
              </div>
              <input
                type="tel"
                value={mtnNumber}
                onChange={e => setMtnNumber(e.target.value)}
                placeholder="6XX XXX XXX"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enter the MTN number linked to your Mobile Money account
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* PAY BUTTON */}
        <button
          onClick={handlePay}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-4 rounded-2xl text-lg transition flex items-center justify-center gap-2"
        >
          <span>📱</span>
          Pay {formatPrice(trip.price)} with MTN MoMo
        </button>

        <p className="text-center text-xs text-gray-300 mt-4">
          Secured by MTN Mobile Money
        </p>

      </div>
    </main>
  )
}

// ── OUTER WRAPPER WITH SUSPENSE ───────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  )
}