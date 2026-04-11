'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AgencyLoginPage() {
  const router = useRouter()

  // State for form fields and UI
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    // Basic validation
    if (!email.trim())    { setError('Please enter your email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }

    setError('')
    setLoading(true)

    // Sign in with Supabase Auth using email and password
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (authError || !data.user) {
      // Wrong email or password
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    // Check that this user is actually linked to an agency
    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name')
      .eq('user_id', data.user.id) // find agency where user_id matches logged in user
      .single()

    if (!agency) {
      // User exists in auth but is not an agency
      setError('No agency account found for this email.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Success — go to the dashboard
    router.push('/agency/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-green-700 mb-1">NyangaVoyage</h1>
          <p className="text-gray-500 text-sm">Agency Portal</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <h2 className="text-xl font-bold text-gray-800 mb-6">Sign in to your account</h2>

          {/* EMAIL INPUT */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. buca@nyangavoyage.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          {/* PASSWORD INPUT */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} // allow pressing Enter to login
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </div>

        {/* BACK LINK */}
        <p className="text-center text-sm text-gray-400 mt-6">
          <a href="/" className="text-green-600 hover:underline">← Back to passenger app</a>
        </p>

      </div>
    </main>
  )
}