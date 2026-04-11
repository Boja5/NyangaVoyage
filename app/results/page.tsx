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
  total_seats: number
  price: number
  agencies: { name: string } | null
}

// ── INNER COMPONENT ───────────────────────────────────────────────────────────
function ResultsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const origin      = searchParams.get('origin')      || ''
  const destination = searchParams.get('destination') || ''
  const date        = searchParams.get('date')        || ''

  const [trips, setTrips]   = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    if (origin && destination && date) fetchTrips()
  }, [origin, destination, date])

  async function fetchTrips() {
    setLoading(true)

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data, error } = await supabase
      .from('trips')
      .select('*, agencies(name)')
      .eq('origin', origin)
      .eq('destination', destination)
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .order('departure_time', { ascending: true })

    if (!error) {
      setTrips(data || [])
    } else {
      console.error('Supabase error:', error)
    }
    setLoading(false)
  }

  function getTimeBand(dt: string): string {
    const hour = new Date(dt).getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
  }

  const filtered = filter === 'all'
    ? trips
    : trips.filter(t => getTimeBand(t.departure_time) === filter)

  function formatTime(dt: string): string {
    return new Date(dt).toLocaleTimeString('fr-CM', {
      hour: '2-digit', minute: '2-digit'
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* BACK BUTTON */}
        <button onClick={() => router.back()} className="text-green-600 text-sm mb-4">
          ← Back to search
        </button>

        {/* ROUTE HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {origin} → {destination}
          </h1>
          <p className="text-gray-400 text-sm mt-1">{date}</p>
        </div>

        {/* TIME FILTERS */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'morning', 'afternoon', 'evening'].map(band => (
            <button key={band} onClick={() => setFilter(band)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === band
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}>
              {band === 'all' ? 'All times' : band.charAt(0).toUpperCase() + band.slice(1)}
            </button>
          ))}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Searching buses...</div>
        )}

        {/* NO RESULTS */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No buses found</p>
            <p className="text-gray-300 text-sm">Try a different date or time filter</p>
          </div>
        )}

        {/* TRIP CARDS */}
        <div className="flex flex-col gap-4">
          {filtered.map(trip => (
            <div key={trip.id}
              onClick={() => router.push(`/seats/${trip.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-green-300 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800 text-lg">{formatTime(trip.departure_time)}</p>
                  <p className="text-gray-400 text-sm">{trip.agencies?.name}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${classBadge[trip.bus_class] || classBadge.Classic}`}>
                  {trip.bus_class}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-green-600 font-bold text-xl">{formatPrice(trip.price)}</p>
                <p className="text-gray-300 text-sm">{trip.total_seats} seats total</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}

// ── OUTER WRAPPER ─────────────────────────────────────────────────────────────
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    }>
      <ResultsInner />
    </Suspense>
  )
}