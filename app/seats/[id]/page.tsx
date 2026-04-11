'use client' // This page runs in the browser (not on the server) because it uses clicks, timers, and state

import React, { useEffect, useState } from 'react' // React.use() needed to unwrap params in Next.js 16
import { useRouter } from 'next/navigation'         // useRouter = lets us navigate to other pages
import { supabase } from '@/lib/supabase'           // our database connection

// ── TYPE DEFINITIONS ──────────────────────────────────────────────────────────
// These describe the shape of data we get back from the database

interface Trip {
  id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  total_seats: number
  price: number
  agencies: { name: string } | null // the agency this trip belongs to
}

interface Seat {
  id: string
  seat_number: number
  status: 'available' | 'locked' | 'booked' // only these 3 values are allowed
  locked_until: string | null
  locked_by: string | null
}

// ── HELPER: generate a random ID to represent this browser session ────────────
// We use this to track which seats THIS user has locked
function getSessionId(): string {
  // Check if we already made an ID and stored it
  let id = localStorage.getItem('session_id')
  if (!id) {
    // If not, make a new random one and save it
    id = crypto.randomUUID()
    localStorage.setItem('session_id', id)
  }
  return id
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────
export default function SeatsPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 16, params is now a Promise — we must unwrap it with React.use()
  // before we can read the id from the URL
  const { id } = React.use(params)

  const router = useRouter() // used to navigate to checkout later

  // ── STATE (variables that when changed, cause the page to re-render) ─────────
  const [trip, setTrip] = useState<Trip | null>(null)                // the trip details
  const [seats, setSeats] = useState<Seat[]>([])                     // all seats for this trip
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)// seat the user clicked
  const [timeLeft, setTimeLeft] = useState(600)                      // 10 minutes = 600 seconds
  const [loading, setLoading] = useState(true)                       // show loading while fetching

  const sessionId = getSessionId() // get or create this browser's session ID

  // ── LOAD DATA WHEN PAGE OPENS ─────────────────────────────────────────────
  useEffect(() => {
    loadTripAndSeats()
  }, []) // empty [] means "run this once when the page first loads"

  async function loadTripAndSeats() {
    setLoading(true)

    // Fetch the trip details from Supabase, including the agency name
    const { data: tripData } = await supabase
      .from('trips')
      .select('*, agencies(name)') // * = all trip columns, agencies(name) = join to get agency name
      .eq('id', id)                // only the trip matching our URL id
      .single()                    // we expect exactly one result

    if (!tripData) {
      // If no trip found, go back to homepage
      router.push('/')
      return
    }

    setTrip(tripData) // save the trip into state so we can display it

    // Now check if seats already exist for this trip
    const { data: existingSeats } = await supabase
      .from('seats')
      .select('*')
      .eq('trip_id', id)

    if (existingSeats && existingSeats.length > 0) {
      // Seats already exist — just use them
      setSeats(existingSeats)
    } else {
      // No seats yet — create them now (first time this trip is viewed)
      await generateSeats(tripData.total_seats)
    }

    setLoading(false)
  }

  // ── GENERATE SEATS IN DATABASE ────────────────────────────────────────────
  // This runs only once per trip, the first time anyone views the seat map
  async function generateSeats(totalSeats: number) {
    // Build an array of seat objects, one for each seat number
    const seatRows = Array.from({ length: totalSeats }, (_, i) => ({
      trip_id: id,          // link each seat to this trip
      seat_number: i + 1,   // seat numbers start at 1, not 0
      status: 'available',  // all seats start as available
    }))

    // Insert all seats into the database at once
    const { data } = await supabase.from('seats').insert(seatRows).select()
    if (data) setSeats(data) // save newly created seats into state
  }

  // ── COUNTDOWN TIMER ───────────────────────────────────────────────────────
  // Starts counting down when a seat is selected
  useEffect(() => {
    if (!selectedSeat) return // don't start timer if no seat is selected

    setTimeLeft(600) // reset to 10 minutes every time a new seat is picked

    // setInterval runs the function every 1000ms (every 1 second)
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)   // stop the timer
          unlockSeat()           // release the seat if time runs out
          setSelectedSeat(null)  // deselect the seat
          return 0
        }
        return prev - 1 // subtract 1 second
      })
    }, 1000)

    // Cleanup: stop the timer if the component unmounts or seat changes
    return () => clearInterval(timer)
  }, [selectedSeat]) // re-run this effect whenever selectedSeat changes

  // ── HANDLE SEAT CLICK ─────────────────────────────────────────────────────
  async function handleSeatClick(seat: Seat) {
    // Don't allow clicking booked seats or seats locked by someone else
    if (seat.status === 'booked') return
    if (seat.status === 'locked' && seat.locked_by !== sessionId) return

    // If this seat is already selected (user clicks it again), deselect it
    if (selectedSeat?.id === seat.id) {
      await unlockSeat()
      setSelectedSeat(null)
      return
    }

    // If user had a different seat selected before, unlock it first
    if (selectedSeat) {
      await unlockSeat()
    }

    // Lock the new seat for 10 minutes so others can't take it
    const lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString() // now + 10 minutes

    await supabase
      .from('seats')
      .update({
        status: 'locked',
        locked_by: sessionId,      // record who locked it
        locked_until: lockedUntil, // record when the lock expires
      })
      .eq('id', seat.id) // only update this specific seat

    // Update the seat in our local state too (so the color changes immediately)
    setSeats(prev =>
      prev.map(s =>
        s.id === seat.id
          ? { ...s, status: 'locked', locked_by: sessionId, locked_until: lockedUntil }
          : s
      )
    )

    setSelectedSeat({ ...seat, status: 'locked', locked_by: sessionId }) // mark as selected
  }

  // ── UNLOCK A SEAT ─────────────────────────────────────────────────────────
  // Called when: user deselects, timer runs out, or user leaves page
  async function unlockSeat() {
    if (!selectedSeat) return

    await supabase
      .from('seats')
      .update({ status: 'available', locked_by: null, locked_until: null })
      .eq('id', selectedSeat.id)
      .eq('locked_by', sessionId) // only unlock if WE are the ones who locked it

    // Update local state to show seat as available again
    setSeats(prev =>
      prev.map(s =>
        s.id === selectedSeat.id
          ? { ...s, status: 'available', locked_by: null, locked_until: null }
          : s
      )
    )
  }

  // ── PROCEED TO CHECKOUT ───────────────────────────────────────────────────
  function goToCheckout() {
    if (!selectedSeat) return
    // Navigate to checkout, passing trip and seat info in the URL
    router.push(`/checkout?tripId=${id}&seatId=${selectedSeat.id}&seatNumber=${selectedSeat.seat_number}`)
  }

  // ── HELPER: format time as mm:ss ──────────────────────────────────────────
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0') // minutes
    const s = (seconds % 60).toString().padStart(2, '0')           // seconds
    return `${m}:${s}`
  }

  // ── HELPER: format price in FCFA ──────────────────────────────────────────
  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  // ── HELPER: format departure time ─────────────────────────────────────────
  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ── SEAT COLOR based on status ────────────────────────────────────────────
  function seatColor(seat: Seat): string {
    if (seat.status === 'booked') return 'bg-red-400 cursor-not-allowed'
    if (seat.status === 'locked' && seat.locked_by !== sessionId) return 'bg-yellow-400 cursor-not-allowed'
    if (selectedSeat?.id === seat.id) return 'bg-blue-500 text-white'
    return 'bg-green-100 hover:bg-green-300 cursor-pointer'
  }

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading seats...
      </div>
    )
  }

  if (!trip) return null // safety check — if no trip loaded, show nothing

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* ── BACK BUTTON ── */}
        <button onClick={() => router.back()} className="text-green-600 text-sm mb-4 flex items-center gap-1">
          ← Back to results
        </button>

        {/* ── TRIP SUMMARY CARD ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          {/* Route: Origin → Destination */}
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {trip.origin} → {trip.destination}
          </h2>
          {/* Agency name and bus class */}
          <p className="text-gray-400 text-sm mb-1">{trip.agencies?.name} · {trip.bus_class}</p>
          {/* Departure time */}
          <p className="text-gray-500 text-sm">{formatDateTime(trip.departure_time)}</p>
          {/* Price */}
          <p className="text-green-600 font-bold text-lg mt-2">{formatPrice(trip.price)}</p>
        </div>

        {/* ── SEAT LEGEND ── */}
        <div className="flex gap-4 text-xs text-gray-500 mb-4 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-green-100 inline-block border"/> Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-blue-500 inline-block"/> Selected
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-yellow-400 inline-block"/> Locked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-red-400 inline-block"/> Booked
          </span>
        </div>

        {/* ── SEAT GRID ── */}
        {/* grid-cols-4 = 4 seats per row (like a real bus layout) */}
        {/* gap-2 = small space between seats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {seats
            .sort((a, b) => a.seat_number - b.seat_number) // sort by seat number ascending
            .map(seat => (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className={`rounded-xl py-3 text-sm font-semibold border transition ${seatColor(seat)}`}
              >
                {seat.seat_number} {/* show the seat number inside the button */}
              </button>
            ))}
        </div>

        {/* ── SELECTED SEAT INFO + TIMER ── */}
        {selectedSeat && (
          <div className="bg-white rounded-2xl border border-green-200 p-5 mb-4 shadow-sm">
            <p className="text-gray-700 font-semibold mb-1">
              Seat {selectedSeat.seat_number} selected
            </p>
            {/* Countdown timer — turns red when under 2 minutes */}
            <p className={`text-sm font-mono ${timeLeft < 120 ? 'text-red-500' : 'text-gray-400'}`}>
              Reserved for: {formatTime(timeLeft)}
            </p>
          </div>
        )}

        {/* ── PROCEED TO CHECKOUT BUTTON ── */}
        {/* Only shows when a seat is selected */}
        {selectedSeat && (
          <button
            onClick={goToCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-2xl text-lg transition"
          >
            Proceed to Checkout →
          </button>
        )}

      </div>
    </main>
  )
}