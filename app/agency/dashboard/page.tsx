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

  const [agency, setAgency]   = useState<Agency | null>(null)
  const [stats, setStats]     = useState<Stats>({ totalTrips: 0, totalBookings: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Not logged in — send to login page
      router.push('/agency/login')
      return
    }

    // Get the agency linked to this user
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('user_id', user.id)
      .single()

    if (!agencyData) {
      router.push('/agency/login')
      return
    }

    setAgency(agencyData)

    // Count total trips for this agency
    const { count: tripCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })
      .eq('agency_id', agencyData.id)

    // Get all trip IDs for this agency so we can count bookings
    const { data: agencyTrips } = await supabase
      .from('trips')
      .select('id, price')
      .eq('agency_id', agencyData.id)

    const tripIds = agencyTrips?.map(t => t.id) || []

    // Count bookings on those trips
    let bookingCount = 0
    let revenues