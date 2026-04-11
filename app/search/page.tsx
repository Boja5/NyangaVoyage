'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CITIES = [
  'Yaounde', 'Douala', 'Bafoussam', 'Bamenda',
  'Garoua', 'Maroua', 'Ngaoundere', 'Bertoua',
  'Ebolowa', 'Kribi', 'Limbe', 'Buea'
]

export default function SearchPage() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]

  function handleSearch() {
    if (!origin || !destination || !date) {
      setError('Please fill in all fields')
      return
    }
    if (origin === destination) {
      setError('Origin and destination cannot be the same')
      return
    }
    setError('')
    router.push(`/results?origin=${origin}&destination=${destination}&date=${date}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md mx-auto">

        <button onClick={() => router.back()} className="text-green-600 text-sm mb-6 flex items-center gap-1">
          ← Back
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">Where are you going?</h2>
        <p className="text-gray-400 text-sm mb-8">Search buses from all agencies in one place</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-5">

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</label>
            <select
              value={origin}
              onChange={e => setOrigin(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-gray-50 focus:outline-none focus:border-green-500"
            >
              <option value="">Select departure city</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</label>
            <select
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-gray-50 focus:outline-none focus:border-green-500"
            >
              <option value="">Select destination city</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-gray-50 focus:outline-none focus:border-green-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={handleSearch}
            className="bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition"
          >
            Search Buses
          </button>

        </div>
      </div>
    </main>
  )
}