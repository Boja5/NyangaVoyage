'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { title: 'Espace Agence', sub: 'Connectez-vous pour gerer vos trajets et reservations', email: 'Adresse email', password: 'Mot de passe', login: 'Se connecter', logging: 'Connexion...', error: 'Email ou mot de passe incorrect.', noAgency: 'Aucune agence associee a ce compte.', isAdmin: 'Vous etes administrateur ?', adminLink: 'Acces admin' },
  en: { title: 'Agency Portal', sub: 'Sign in to manage your trips and bookings', email: 'Email address', password: 'Password', login: 'Sign in', logging: 'Signing in...', error: 'Incorrect email or password.', noAgency: 'No agency linked to this account.', isAdmin: 'Are you an administrator?', adminLink: 'Admin access' },
}

export default function AgencyLoginPage() {
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
    const { data: agency } = await supabase.from('agencies').select('*').eq('user_id', authData.user.id).eq('is_admin', false).single()
    if (!agency) { setError(t.noAgency); await supabase.auth.signOut(); setLoading(false); return }
    router.push('/agency/dashboard')
  }

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--nv-green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: '#fff' }}>A</div>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '6px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>
          <div className="nv-card" style={{ padding: '32px' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="nv-form-group">
                <label className="nv-label">{t.email}</label>
                <input type="email" className="nv-input" placeholder="agence@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
            {t.isAdmin} <Link href="/admin/login" style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{t.adminLink}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
