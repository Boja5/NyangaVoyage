
/*
 * ============================================================
 * FILE: app/admin/login/page.tsx
 * URL: /admin/login
 * WHAT THIS FILE DOES:
 *   Login page for the PLATFORM ADMINISTRATOR (NyangaVoyage staff).
 *   Different from agency login — the admin can see ALL agencies
 *   and ALL bookings across the entire platform.
 *
 * HOW IT DIFFERS FROM AGENCY LOGIN:
 *   Checks is_admin = TRUE in the agencies table.
 *   If someone tries to log in with agency credentials here,
 *   they get "Acces administrateur refuse."
 *
 * ADMIN CREDENTIALS (for demo):
 *   Email:    admin@nyangavoyage.com
 *   Password: Admin2026!
 * ============================================================
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Acces Administrateur', sub: 'Panneau de gestion NyangaVoyage', email: 'Adresse email', password: 'Mot de passe', login: 'Se connecter', logging: 'Connexion...', error: 'Email ou mot de passe incorrect.', denied: 'Acces administrateur refuse.', back: 'Retour espace agence' },
  en: { title: 'Administrator Access', sub: 'NyangaVoyage management panel', email: 'Email address', password: 'Password', login: 'Sign in', logging: 'Signing in...', error: 'Incorrect email or password.', denied: 'Administrator access denied.', back: 'Back to agency portal' },
}

export default function AdminLoginPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError || !authData.user) { setError(t.error); setLoading(false); return }
    const { data: adminRecord } = await supabase.from('agencies').select('*').eq('user_id', authData.user.id).eq('is_admin', true).single()
    if (!adminRecord) { setError(t.denied); await supabase.auth.signOut(); setLoading(false); return }
    router.push('/admin/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-gray-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>S</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>
          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">{t.email}</label>
                <input type="email" className="nv-input" placeholder="admin@nyangavoyage.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">{t.password}</label>
                <input type="password" className="nv-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <div className="nv-alert nv-alert-error"><div style={{ fontSize: '13px' }}>{error}</div></div>}
              <button type="submit" className="nv-btn nv-btn-primary nv-btn-full nv-btn-lg" disabled={loading}>{loading ? t.logging : t.login}</button>
            </form>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--nv-text-secondary)' }}>
            <Link href="/agency/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{t.back}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
