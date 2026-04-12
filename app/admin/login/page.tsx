'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    if (!email.trim())    { setError('Please enter your email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }

    setError('')
    setLoading(true)

    // Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (authError || !data.user) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    // Check this user is actually the admin
    const { data: adminRecord } = await supabase
      .from('agencies')
      .select('is_admin')
      .eq('user_id', data.user.id)
      .eq('is_admin', true)
      .single()

    if (!adminRecord) {
      setError('You do not have admin access.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Success — go to admin dashboard
    router.push('/admin/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-green-700 mb-1">NyangaVoyage</h1>
          <p className="text-gray-500 text-sm">Admin Panel</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Sign In</h2>

          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@nyangavoyage.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          <a href="/" className="text-green-600 hover:underline">← Back to passenger app</a>
        </p>

      </div>
    </main>
  )
}