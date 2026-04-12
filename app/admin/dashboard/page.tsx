'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Agency {
  id: string
  name: string
  phone: string | null
  user_id: string | null
  is_admin: boolean
}

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
  seats: { seat_number: number } | null
}

interface Stats {
  totalAgencies: number
  totalTrips: number
  totalBookings: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const router = useRouter()

  const [stats, setStats]           = useState<Stats>({ totalAgencies: 0, totalTrips: 0, totalBookings: 0, totalRevenue: 0 })
  const [agencies, setAgencies]     = useState<Agency[]>([])
  const [bookings, setBookings]     = useState<Booking[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState<'overview' | 'agencies' | 'bookings'>('overview')

  // Add agency form state
  const [showAddForm, setShowAddForm]   = useState(false)
  const [newName, setNewName]           = useState('')
  const [newEmail, setNewEmail]         = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [newPhone, setNewPhone]         = useState('')
  const [addError, setAddError]         = useState('')
  const [addSuccess, setAddSuccess]     = useState('')
  const [adding, setAdding]             = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    setLoading(true)

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }

    // Verify admin
    const { data: adminRecord } = await supabase
      .from('agencies')
      .select('is_admin')
      .eq('user_id', user.id)
      .eq('is_admin', true)
      .single()

    if (!adminRecord) { router.push('/admin/login'); return }

    // Load all real agencies (not admin record)
    const { data: agenciesData } = await supabase
      .from('agencies')
      .select('*')
      .eq('is_admin', false)
      .order('name', { ascending: true })

    setAgencies(agenciesData || [])

    // Count total trips
    const { count: tripCount } = await supabase
      .from('trips')
      .select('*', { count: 'exact', head: true })

    // Count total bookings and calculate revenue
    const { data: allBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          origin, destination, departure_time, bus_class, price,
          agencies ( name )
        ),
        seats ( seat_number )
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    setBookings(allBookings || [])

    // Calculate total revenue
    const revenue = (allBookings || []).reduce((sum, b) => {
      return sum + (b.trips?.price || 0)
    }, 0)

    setStats({
      totalAgencies: agenciesData?.length || 0,
      totalTrips: tripCount || 0,
      totalBookings: allBookings?.length || 0,
      totalRevenue: revenue,
    })

    setLoading(false)
  }

  async function handleAddAgency() {
    if (!newName.trim())     { setAddError('Please enter agency name.'); return }
    if (!newEmail.trim())    { setAddError('Please enter agency email.'); return }
    if (!newPassword.trim()) { setAddError('Please enter a password.'); return }

    setAddError('')
    setAdding(true)

    // Step 1: Create the auth user for this agency using Supabase Admin API
    // We use signUp here — in production you'd use the admin API
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password: newPassword.trim(),
    })

    if (signUpError || !signUpData.user) {
      setAddError('Failed to create login: ' + (signUpError?.message || 'unknown error'))
      setAdding(false)
      return
    }

    // Step 2: Insert the agency record linked to the new auth user
    const { error: insertError } = await supabase
      .from('agencies')
      .insert({
        name:    newName.trim(),
        phone:   newPhone.trim() || null,
        user_id: signUpData.user.id,
        is_admin: false,
      })

    if (insertError) {
      setAddError('Failed to create agency: ' + insertError.message)
      setAdding(false)
      return
    }

    // Success — reset form and reload
    setAddSuccess(`Agency "${newName}" created successfully!`)
    setShowAddForm(false)
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewPhone('')
    setAdding(false)
    await loadDashboard()
    setTimeout(() => setAddSuccess(''), 4000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function formatPrice(amount: number): string {
    return new Intl.NumberFormat('fr-CM').format(amount) + ' FCFA'
  }

  function formatDateTime(dt: string): string {
    return new Date(dt).toLocaleString('fr-CM', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading admin panel...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-400 text-sm">NyangaVoyage — Full Overview</p>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition">
            Sign Out
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 mb-8 sm:grid-cols-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-green-600 mb-1">{stats.totalAgencies}</p>
            <p className="text-gray-400 text-xs">Agencies</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-blue-500 mb-1">{stats.totalTrips}</p>
            <p className="text-gray-400 text-xs">Trips</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-3xl font-bold text-purple-500 mb-1">{stats.totalBookings}</p>
            <p className="text-gray-400 text-xs">Bookings</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-lg font-bold text-yellow-500 mb-1">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-gray-400 text-xs">Revenue</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'agencies', 'bookings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">Platform Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total agencies</span>
                <span className="font-semibold text-gray-800">{stats.totalAgencies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active trips in database</span>
                <span className="font-semibold text-gray-800">{stats.totalTrips}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Confirmed bookings</span>
                <span className="font-semibold text-gray-800">{stats.totalBookings}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-500">Total platform revenue</span>
                <span className="font-bold text-green-600">{formatPrice(stats.totalRevenue)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── AGENCIES TAB ── */}
        {activeTab === 'agencies' && (
          <div>

            {/* SUCCESS MESSAGE */}
            {addSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
                ✓ {addSuccess}
              </div>
            )}

            {/* ADD AGENCY BUTTON */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-500 text-sm">{agencies.length} agencies registered</p>
              <button
                onClick={() => { setShowAddForm(!showAddForm); setAddError('') }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition"
              >
                {showAddForm ? 'Cancel' : '+ Add Agency'}
              </button>
            </div>

            {/* ADD AGENCY FORM */}
            {showAddForm && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-4">Add New Agency</h3>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Agency Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Express Voyages"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Phone (optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="e.g. 6XX XXX XXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Login Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. express@nyangavoyage.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-1 font-medium">Login Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Share this email and password with the agency so they can log in
                  </p>
                </div>

                {addError && (
                  <p className="text-red-500 text-sm mb-4">{addError}</p>
                )}

                <button
                  onClick={handleAddAgency}
                  disabled={adding}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition"
                >
                  {adding ? 'Creating...' : 'Create Agency'}
                </button>
              </div>
            )}

            {/* AGENCIES LIST */}
            <div className="flex flex-col gap-3">
              {agencies.map(agency => (
                <div key={agency.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{agency.name}</p>
                      <p className="text-gray-400 text-sm">{agency.phone || 'No phone'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      agency.user_id
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {agency.user_id ? 'Active' : 'No login'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ── BOOKINGS TAB ── */}
        {activeTab === 'bookings' && (
          <div className="flex flex-col gap-4">
            {bookings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400">No bookings yet across the platform</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-green-600 tracking-wider">{booking.booking_ref}</p>
                      <p className="text-gray-400 text-xs">{formatDateTime(booking.created_at)}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                      {booking.status}
                    </span>
                  </div>
                  {booking.trips && (
                    <div className="border-t border-gray-50 pt-3">
                      <p className="font-semibold text-gray-800 mb-1">
                        {booking.trips.origin} → {booking.trips.destination}
                      </p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400 text-sm">{booking.trips.agencies?.name}</p>
                          <p className="text-gray-400 text-sm">
                            {booking.trips.bus_class} · Seat {booking.seats?.seat_number ?? '—'}
                          </p>
                        </div>
                        <p className="text-green-600 font-bold">{formatPrice(booking.trips.price)}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </main>
  )
}