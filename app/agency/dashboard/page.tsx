'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Agency {
  id: string
  name: string
}

interface Stats {
  totalTrips: number
  totalBookings: number
  totalRevenue: number
}

export default function AgencyDashboard() {
  const router = useRouter()

  const [agency, setAgency] = useState<Agency | null>(null)
  const [stats, setStats] = useState<Stats>({ totalTrips: 0, totalBookings: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }

    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!agencyData) { router.push('/agency/login'); return }
    setAgency(agencyData)

    const { count: tripCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyData.id)

    const { data: agencyTrips } = await supabase
      .from('trips')
      .select('id, price')
      .eq('agency_id', agencyData.id)

    const tripIds = agencyTrips?.map(t => t.id) || []

    let bookingCount = 0
    let revenue = 0

    if (tripIds.length > 0) {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('trip_id', tripIds)
        .eq('status', 'confirmed')

      bookingCount = count || 0

      for (const trip of agencyTrips || []) {
        const { count: tripBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('trip_id', trip.id)
          .eq('status', 'confirmed')

        revenue += (tripBookings || 0) * trip.price
      }
    }

    setStats({
      totalTrips: tripCount || 0,
      totalBookings: bookingCount,
      totalRevenue: revenue,
    })

    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/agency/login')
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading dashboard...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{agency?.name}</h1>
            <p className="text-gray-400 text-sm">Agency Dashboard</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.totalTrips}</p>
            <p className="text-gray-400 text-sm">Total Trips</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-3xl font-bold text-blue-500 mb-1">{stats.totalBookings}</p>
            <p className="text-gray-400 text-sm">Bookings</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-xl font-bold text-yellow-500 mb-1">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-gray-400 text-sm">Revenue</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => router.push('/agency/trips')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-green-300 hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">🚌</div>
            <h3 className="font-bold text-gray-800 mb-1">Manage Trips</h3>
            <p className="text-gray-400 text-sm">Add new trips and view your schedule</p>
          </div>
          <div
            onClick={() => router.push('/agency/bookings')}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:border-green-300 hover:shadow-md transition"
          >
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="font-bold text-gray-800 mb-1">View Bookings</h3>
            <p className="text-gray-400 text-sm">See all passenger bookings</p>
          </div>
        </div>

      </div>
    </main>
  )
}