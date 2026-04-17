'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'overview' | 'agencies' | 'bookings'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ agencies: 0, trips: 0, bookings: 0, revenue: 0 })
  const [agencies, setAgencies] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [newAgency, setNewAgency] = useState({ name: '', email: '', password: '', phone: '' })
  const [savingAgency, setSavingAgency] = useState(false)
  const [agencyMsg, setAgencyMsg] = useState('')

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/admin/login'); return }
    const { data: adminRecord } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', true).single()
    if (!adminRecord) { router.push('/admin/login'); return }
    loadData()
  }

  async function loadData() {
    const [{ data: agList }, { data: tripList }, { data: bookList }] = await Promise.all([
      supabase.from('agencies').select('*').eq('is_admin', false),
      supabase.from('trips').select('id'),
      supabase.from('bookings').select('*, trips(price)').eq('status', 'confirmed'),
    ])

    const revenue = (bookList || []).reduce((s: number, b: any) => s + (b.trips?.price || 0), 0)
    setStats({ agencies: agList?.length || 0, trips: tripList?.length || 0, bookings: bookList?.length || 0, revenue })
    setAgencies(agList || [])
    setBookings(bookList || [])
    setLoading(false)
  }

  async function handleAddAgency(e: React.FormEvent) {
    e.preventDefault()
    setSavingAgency(true)
    setAgencyMsg('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: newAgency.email,
      password: newAgency.password,
    })

    if (authError || !authData.user) {
      setAgencyMsg('Erreur: ' + (authError?.message || 'Impossible de creer le compte.'))
      setSavingAgency(false)
      return
    }

    await supabase.from('agencies').insert({
      name: newAgency.name,
      phone: newAgency.phone,
      user_id: authData.user.id,
      is_admin: false,
    })

    setAgencyMsg('Agence ' + newAgency.name + ' ajoutee avec succes !')
    setNewAgency({ name: '', email: '', password: '', phone: '' })
    setSavingAgency(false)
    loadData()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString('fr-CM', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  const tabStyle = (t: string): React.CSSProperties => ({
    padding: '10px 20px',
    border: 'none',
    borderBottom: tab === t ? '2.5px solid var(--nv-green-600)' : '2.5px solid transparent',
    background: 'transparent',
    fontFamily: 'var(--nv-font-body)',
    fontSize: '14px',
    fontWeight: tab === t ? 600 : 400,
    color: tab === t ? 'var(--nv-green-600)' : 'var(--nv-text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  })

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px, 5vw, 40px)' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>
            Panneau d'administration
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>Gestion de la plateforme NyangaVoyage</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1.5px solid var(--nv-border)', marginBottom: '32px' }}>
          <button style={tabStyle('overview')} onClick={() => setTab('overview')}>Vue d'ensemble</button>
          <button style={tabStyle('agencies')} onClick={() => setTab('agencies')}>Agences ({stats.agencies})</button>
          <button style={tabStyle('bookings')} onClick={() => setTab('bookings')}>Reservations ({stats.bookings})</button>
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Agences partenaires', value: stats.agencies, color: 'var(--nv-green-600)' },
                { label: 'Trajets programmes', value: stats.trips, color: '#2563eb' },
                { label: 'Reservations confirmees', value: stats.bookings, color: 'var(--nv-gold-600)' },
                { label: 'Revenus totaux (FCFA)', value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-green-700)' },
              ].map((s, i) => (
                <div key={i} className="nv-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENCIES TAB */}
        {tab === 'agencies' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'start' }}>
              {/* Agency list */}
              <div>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Agences enregistrees
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {agencies.map(ag => (
                    <div key={ag.id} className="nv-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--nv-gray-900)', fontSize: '15px' }}>{ag.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>{ag.phone || 'Pas de telephone'}</div>
                      </div>
                      <span className={'nv-badge ' + (ag.user_id ? 'nv-badge-green' : 'nv-badge-gray')}>
                        {ag.user_id ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add agency form */}
              <div>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  Ajouter une agence
                </h2>
                <div className="nv-card" style={{ padding: '24px' }}>
                  <form onSubmit={handleAddAgency} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="nv-form-group">
                      <label className="nv-label">Nom de l'agence</label>
                      <input type="text" className="nv-input" placeholder="Ex: Express Voyages" value={newAgency.name} onChange={e => setNewAgency({...newAgency, name: e.target.value})} required />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Email</label>
                      <input type="email" className="nv-input" placeholder="agence@email.com" value={newAgency.email} onChange={e => setNewAgency({...newAgency, email: e.target.value})} required />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Mot de passe initial</label>
                      <input type="password" className="nv-input" placeholder="Min. 6 caracteres" value={newAgency.password} onChange={e => setNewAgency({...newAgency, password: e.target.value})} required minLength={6} />
                    </div>
                    <div className="nv-form-group">
                      <label className="nv-label">Telephone</label>
                      <input type="tel" className="nv-input" placeholder="+237 6XXXXXXXX" value={newAgency.phone} onChange={e => setNewAgency({...newAgency, phone: e.target.value})} />
                    </div>
                    {agencyMsg && (
                      <div className={'nv-alert ' + (agencyMsg.includes('Erreur') ? 'nv-alert-error' : 'nv-alert-success')}>
                        <div style={{ fontSize: '13px' }}>{agencyMsg}</div>
                      </div>
                    )}
                    <button type="submit" className="nv-btn nv-btn-primary nv-btn-full" disabled={savingAgency}>
                      {savingAgency ? 'Enregistrement...' : 'Ajouter l agence'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
              Toutes les reservations
            </h2>
            {bookings.length === 0 ? (
              <div className="nv-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)' }}>Aucune reservation</div>
              </div>
            ) : (
              <div className="nv-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--nv-gray-50)', borderBottom: '1.5px solid var(--nv-border)' }}>
                        {['Reference', 'Date', 'Trajet', 'Classe', 'Prix', 'Statut'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b, i) => (
                        <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid var(--nv-border)' : 'none' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontFamily: 'var(--nv-font-display)', fontWeight: 700, color: 'var(--nv-green-600)', fontSize: '13px' }}>{b.booking_ref}</span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--nv-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--nv-gray-900)', whiteSpace: 'nowrap' }}>
                            {b.trips?.origin} &rarr; {b.trips?.destination}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className={'nv-badge ' + (b.trips?.bus_class === 'VIP' ? 'nv-badge-vip' : b.trips?.bus_class === 'Classic' ? 'nv-badge-classic' : 'nv-badge-normal')}>
                              {b.trips?.bus_class}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--nv-green-600)', whiteSpace: 'nowrap' }}>
                            {b.trips?.price?.toLocaleString('fr-CM')} FCFA
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span className="nv-badge nv-badge-green">Confirme</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


