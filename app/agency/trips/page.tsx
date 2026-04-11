'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Trip {
  id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  total_seats: number
  price: number
}

interface Agency {
  id: string
  name: string
}

// All cities available for routes
const CITIES = [
  'Yaounde', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua',
  'Maroua', 'Ngaoundere', 'Bertoua', 'Ebolowa', 'Kribi', 'Limbe', 'Buea'
]

export default function AgencyTripsPage() {
  const router = useRouter()

  const [agency, setAgency]       = useState<Agency | null>(null)
  const [trips, setTrips]         = useState<Trip[]>([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false) // toggle add trip form
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Form fields for adding a new trip
  const [origin, setOrigin]           = useState('Yaounde')
  const [destination, setDestination] = useState('Douala')
  const [date, setDate]               = useState('')
  const [time, setTime]               = useState('08:00')
  const [busClass, setBusClass]       = useState('Classic')
  const [totalSeats, setTotalSeats]   = useState('55')
  const [price, setPrice]             = useState('')

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

    // Load this agency's trips
    await loadTrips(agencyData.id)
    setLoading(false)
  }

  async function loadTrips(agencyId: string) {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('agency_id', agencyId)
      .order('departure_time', { ascending: true })

    setTrips(data || [])
  }

  async function handleAddTrip() {
    // Validation
    if (!date)          { setError('Please select a departure date.'); return }
    if (!price.trim())  { setError('Please enter a price.'); return }
    if (origin === destination) { setError('Origin and destination cannot be the same.'); return }

    setError('')
    setSaving(true)

    // Combine date and time into a full timestamp
    const departureTime = new Date(`${date}T${time}:00`).toISOString()

    // Insert the new trip into the database
    const { error: insertError } = await supabase
      .from('trips')
      .insert({
        agency_id:      agency!.id,
        origin,
        destination,
        departure_time: departureTime,
        bus_class:      busClass,
        total_seats:    parseInt(totalSeats),
        price:          parseInt(price),
      })

    if (insertError) {
      setError('Failed to add trip: ' + insertError.message)
      setSaving(false)
      return
    }

    // Success — reload trips and reset form
    setSuccess('Trip added successfully!')
    setShowForm(false)
    setSaving(false)
    setDate('')
    setPrice('')
    await loadTrips(agency!.id)

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleCancelTrip(tripId: string) {
    // Delete the trip (and its seats will need to be cleaned up too)
    await supabase.from('seats').delete().eq('trip_id', tripId)
    await supabase.from('trips').delete().eq('id', tripId)
    await loadTrips(agency!.id)
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

  const classBadge: Record<string, string> = {
    VIP:     'bg-yellow-100 text-yellow-700',
    Normal:  'bg-blue-100 text-blue-700',
    Classic: 'bg-gray-100 text-gray-600',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading trips...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <button onClick={() => router.push('/agency/dashboard')} className="text-green-600 text-sm mb-1">
              ← Back to dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Manage Trips</h1>
            <p className="text-gray-400 text-sm">{agency?.name}</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError('') }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
          >
            {showForm ? 'Cancel' : '+ Add Trip'}
          </button>
        </div>

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm">
            ✓ {success}
          </div>
        )}

        {/* ADD TRIP FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Trip</h2>

            {/* ORIGIN & DESTINATION */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Origin</label>
                <select
                  value={origin}
                  onChange={e => setOrigin(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Destination</label>
                <select
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                >
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* DATE & TIME */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Departure Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            {/* CLASS & SEATS */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Bus Class</label>
                <select
                  value={busClass}
                  onChange={e => setBusClass(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                >
                  <option value="Classic">Classic</option>
                  <option value="Normal">Normal</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1 font-medium">Total Seats</label>
                <input
                  type="number"
                  value={totalSeats}
                  onChange={e => setTotalSeats(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
                />
              </div>
            </div>

            {/* PRICE */}
            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1 font-medium">Price (FCFA)</label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {/* SUBMIT */}
            <button
              onClick={handleAddTrip}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition"
            >
              {saving ? 'Saving...' : 'Add Trip'}
            </button>
          </div>
        )}

        {/* TRIPS LIST */}
        {trips.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No trips yet</p>
            <p className="text-gray-300 text-sm">Click "+ Add Trip" to schedule your first trip</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {trips.map(trip => (
              <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-800">
                      {trip.origin} → {trip.destination}
                    </p>
                    <p className="text-gray-400 text-sm">{formatDateTime(trip.departure_time)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${classBadge[trip.bus_class]}`}>
                    {trip.bus_class}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-green-600 font-bold">{formatPrice(trip.price)}</p>
                  <p className="text-gray-300 text-sm">{trip.total_seats} seats</p>
                  <button
                    onClick={() => handleCancelTrip(trip.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition"
                  >
                    Cancel Trip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}