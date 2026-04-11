'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Trip {
  id: string
  origin: string
  destination: string
  departure_time: string
  bus_class: string
  total_seats: number
  price: number
  agencies: { name: string; logo_url: string | null }
}

export default function ResultsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const origin = params.get('origin')
  const destination = params.get('destination')
  const date = params.get('date')

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchTrips() {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('*, agencies(name, logo_url)')
        .eq('origin', origin)
        .eq('destination', destination)
        .order('departure_time', { ascending: true })
      if (!error) {
        setTrips(data || [])
      } else {
        console.error('Supabase error:', error)
      }
      setLoading(false)
    }
    if (origin && destination) fetchTrips()
  }, [origin, destination, date])

  function getTimeband(departure: string) {
    const hour = new Date(departure).getHours()
    if (hour >= 5 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    return 'evening'
  }

  function formatTime(departure: string) {
    return new Date(departure).toLocaleTimeString('fr-CM', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatPrice(price: number) {
    return price.toLocaleString('fr-CM') + ' FCFA'
  }

  const filtered =
    filter === 'all'
      ? trips
      : trips.filter(t => getTimeband(t.departure_time) === filter)

  const classBadge: Record<string, string> = {
    VIP: 'bg-yellow-100 text-yellow-800',
    Normal: 'bg-blue-100 text-blue-800',
    Classic: 'bg-gray-100 text-gray-700'
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md mx-auto">

        <button
          onClick={() => router.back()}
          className="text-green-600 text-sm mb-4 flex items-center gap-1"
        >
          Back
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {origin} {destination}
          </h2>
          <p className="text-gray-400 text-sm">
            {date &&
              new Date(date).toLocaleDateString('fr-CM', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
          </p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {['all', 'morning', 'afternoon', 'evening'].map(band => (
            <button
              key={band}
              onClick={() => setFilter(band)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                filter === band
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {band === 'all'
                ? 'All times'
                : band.charAt(0).toUpperCase() + band.slice(1)}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20 text-gray-400">
            Searching buses...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No buses found</p>
            <p className="text-gray-300 text-sm">
              Try a different date or time filter
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {filtered.map(trip => (
            <div
              key={trip.id}
              onClick={() => router.push(`/seats/${trip.id}`)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-green-300 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800 text-lg">
                    {formatTime(trip.departure_time)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {trip.agencies?.name}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    classBadge[trip.bus_class] || classBadge.Classic
                  }`}
                >
                  {trip.bus_class}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-green-600 font-bold text-xl">
                  {formatPrice(trip.price)}
                </p>
                <p className="text-gray-300 text-sm">
                  {trip.total_seats} seats total
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
