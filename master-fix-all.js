const fs = require('fs');
const path = require('path');

// ============================================================
// STEP 1: Update lib/i18n.tsx
// Auto-detect browser/phone language, remove manual toggle
// ============================================================
const i18n = `'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Lang = 'fr' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
}>({ lang: 'fr', setLang: () => {} })

function detectLanguage(): Lang {
  if (typeof window === 'undefined') return 'fr'
  // Check browser/phone language setting
  const browserLang = navigator.language || (navigator as any).userLanguage || 'fr'
  // If browser is set to English return EN, otherwise default to FR
  if (browserLang.toLowerCase().startsWith('en')) return 'en'
  return 'fr'
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Auto-detect phone/browser language on first load
    const detected = detectLanguage()
    setLangState(detected)
    setMounted(true)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
  }

  return (
    <LangContext.Provider value={{ lang: mounted ? lang : 'fr', setLang }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
`;
fs.writeFileSync(path.join('lib', 'i18n.tsx'), i18n, 'utf8');
console.log('Written: lib/i18n.tsx - auto language detection');

// ============================================================
// STEP 2: Update Navbar - remove language toggle
// ============================================================
const navbar = `'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/lib/i18n'

export default function Navbar() {
  const { lang } = useLang()
  const pathname = usePathname()
  const isAgency = pathname?.startsWith('/agency')
  const isAdmin  = pathname?.startsWith('/admin')

  const Logo = () => (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
        <rect width="32" height="32" rx="8" fill="#0f172a"/>
        <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
        <line x1="16" y1="9" x2="16" y2="7" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <line x1="20" y1="10" x2="21.5" y2="8.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <line x1="12" y1="10" x2="10.5" y2="8.5" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
        <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
        <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
        <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
        <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
        <rect x="23" y="25" width="1.5" height="1.5" rx="0.3" fill="#fef08a"/>
        <text x="11" y="6" fontFamily="Georgia,serif" fontSize="5" fontWeight="700" fontStyle="italic" fill="#4ade80">N</text>
        <text x="16" y="6" fontFamily="Georgia,serif" fontSize="5" fontWeight="700" fontStyle="italic" fill="#fbbf24">V</text>
      </svg>
      <span className="nv-nav-logo">NyangaVoyage</span>
    </Link>
  )

  if (isAgency) return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div className="nv-nav-links">
          <Link href="/agency/dashboard" className={'nv-nav-link' + (pathname === '/agency/dashboard' ? ' active' : '')}>{lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}</Link>
          <Link href="/agency/trips"     className={'nv-nav-link' + (pathname === '/agency/trips'     ? ' active' : '')}>{lang === 'fr' ? 'Mes trajets' : 'My trips'}</Link>
          <Link href="/agency/bookings"  className={'nv-nav-link' + (pathname === '/agency/bookings'  ? ' active' : '')}>{lang === 'fr' ? 'Reservations' : 'Bookings'}</Link>
          <Link href="/agency/scan"      className={'nv-nav-link' + (pathname === '/agency/scan'      ? ' active' : '')} style={{ color: 'var(--nv-green-600)', fontWeight: 600 }}>{lang === 'fr' ? 'Scanner' : 'Scan'}</Link>
          <Link href="/agency/profile"   className={'nv-nav-link' + (pathname === '/agency/profile'   ? ' active' : '')}>{lang === 'fr' ? 'Mon profil' : 'My profile'}</Link>
        </div>
        <div className="nv-nav-right" />
      </div>
    </nav>
  )

  if (isAdmin) return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin</div>
        <div className="nv-nav-right" />
      </div>
    </nav>
  )

  return (
    <nav className="nv-nav">
      <div className="nv-nav-inner">
        <Logo />
        <div className="nv-nav-links">
          <Link href="/search"   className={'nv-nav-link' + (pathname === '/search'   ? ' active' : '')}>{lang === 'fr' ? 'Trajets' : 'Routes'}</Link>
          <Link href="/agencies" className={'nv-nav-link' + (pathname === '/agencies' ? ' active' : '')}>{lang === 'fr' ? 'Agences' : 'Agencies'}</Link>
        </div>
        <div className="nv-nav-right">
          <Link href="/agency/login" className="nv-btn nv-btn-primary nv-btn-sm">{lang === 'fr' ? 'Espace Agence' : 'Agency Portal'}</Link>
        </div>
      </div>
    </nav>
  )
}
`;
fs.writeFileSync(path.join('components', 'Navbar.tsx'), navbar, 'utf8');
console.log('Written: components/Navbar.tsx - no language toggle');

// ============================================================
// STEP 3: app/agency/profile/page.tsx
// Agency profile page with photo upload + bus photos
// ============================================================
const agencyProfile = `'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Mon profil', sub: 'Gerez les informations et les photos de votre agence',
    profilePhoto: 'Photo de profil', uploadProfile: 'Changer la photo', noPhoto: 'Aucune photo',
    busPhotos: 'Photos de vos bus', uploadBus: 'Ajouter une photo de bus',
    busPhotoHint: 'Ajoutez des photos de vos bus pour rassurer vos passagers',
    agencyName: 'Nom de l agence', phone: 'Telephone', email: 'Email',
    save: 'Enregistrer', saving: 'Enregistrement...', saved: 'Profil mis a jour !',
    deletePhoto: 'Supprimer', uploading: 'Chargement...',
    maxPhotos: 'Maximum 6 photos de bus',
    back: 'Retour au tableau de bord',
  },
  en: {
    title: 'My profile', sub: 'Manage your agency information and photos',
    profilePhoto: 'Profile photo', uploadProfile: 'Change photo', noPhoto: 'No photo',
    busPhotos: 'Bus photos', uploadBus: 'Add a bus photo',
    busPhotoHint: 'Add photos of your buses to reassure your passengers',
    agencyName: 'Agency name', phone: 'Phone', email: 'Email',
    save: 'Save', saving: 'Saving...', saved: 'Profile updated!',
    deletePhoto: 'Delete', uploading: 'Uploading...',
    maxPhotos: 'Maximum 6 bus photos',
    back: 'Back to dashboard',
  },
}

export default function AgencyProfilePage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const profileInputRef = useRef<HTMLInputElement>(null)
  const busInputRef = useRef<HTMLInputElement>(null)

  const [agency, setAgency] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Photos stored in localStorage (demo mode — no Supabase storage needed)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [busPhotos, setBusPhotos] = useState<string[]>([])

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)
    setName(ag.name || '')
    setPhone(ag.phone || '')

    // Load photos from localStorage
    const savedProfile = localStorage.getItem('agency_profile_photo_' + ag.id)
    const savedBus = localStorage.getItem('agency_bus_photos_' + ag.id)
    if (savedProfile) setProfilePhoto(savedProfile)
    if (savedBus) setBusPhotos(JSON.parse(savedBus))
    setLoading(false)
  }

  async function handleSave() {
    if (!agency) return
    setSaving(true)
    await supabase.from('agencies').update({ name, phone }).eq('id', agency.id)
    setSavedMsg(t.saved)
    setTimeout(() => setSavedMsg(''), 3000)
    setSaving(false)
  }

  function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleProfilePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !agency) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      setProfilePhoto(dataUrl)
      localStorage.setItem('agency_profile_photo_' + agency.id, dataUrl)
    } catch {}
    setUploading(false)
    if (profileInputRef.current) profileInputRef.current.value = ''
  }

  async function handleBusPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !agency) return
    if (busPhotos.length >= 6) return
    setUploading(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const newPhotos = [...busPhotos, dataUrl]
      setBusPhotos(newPhotos)
      localStorage.setItem('agency_bus_photos_' + agency.id, JSON.stringify(newPhotos))
    } catch {}
    setUploading(false)
    if (busInputRef.current) busInputRef.current.value = ''
  }

  function deleteBusPhoto(index: number) {
    const newPhotos = busPhotos.filter((_, i) => i !== index)
    setBusPhotos(newPhotos)
    if (agency) localStorage.setItem('agency_bus_photos_' + agency.id, JSON.stringify(newPhotos))
  }

  function deleteProfilePhoto() {
    setProfilePhoto(null)
    if (agency) localStorage.removeItem('agency_profile_photo_' + agency.id)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="nv-spinner nv-spinner-lg" />
    </div>
  )

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <a href="/agency/dashboard" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>
              &larr; {t.back}
            </a>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginTop: '12px', marginBottom: '4px' }}>{t.title}</h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>

          {/* Profile photo section */}
          <div className="nv-card" style={{ padding: '28px', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '20px' }}>{t.profilePhoto}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>

              {/* Profile photo display */}
              <div style={{ position: 'relative' }}>
                {profilePhoto ? (
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={profilePhoto} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--nv-green-400)' }} />
                    <button onClick={deleteProfilePhoto} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>x</button>
                  </div>
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--nv-gray-100)', border: '3px dashed var(--nv-gray-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '28px' }}>&#128736;</div>
                    <div style={{ fontSize: '10px', color: 'var(--nv-text-muted)', textAlign: 'center' }}>{t.noPhoto}</div>
                  </div>
                )}
              </div>

              <div>
                <button className="nv-btn nv-btn-secondary" onClick={() => profileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? t.uploading : t.uploadProfile}
                </button>
                <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)', marginTop: '6px' }}>JPG, PNG &middot; Max 5MB</div>
                <input ref={profileInputRef} type="file" accept="image/*" onChange={handleProfilePhotoUpload} style={{ display: 'none' }} />
              </div>
            </div>
          </div>

          {/* Agency info */}
          <div className="nv-card" style={{ padding: '28px', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '20px' }}>
              {lang === 'fr' ? 'Informations de l agence' : 'Agency information'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="nv-form-group">
                <label className="nv-label">{t.agencyName}</label>
                <input type="text" className="nv-input" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="nv-form-group">
                <label className="nv-label">{t.phone}</label>
                <input type="tel" className="nv-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+237 6XXXXXXXX" />
              </div>
            </div>
            {savedMsg && <div className="nv-alert nv-alert-success" style={{ marginTop: '16px' }}><div style={{ fontSize: '13px' }}>{savedMsg}</div></div>}
            <button className="nv-btn nv-btn-primary" style={{ marginTop: '20px' }} onClick={handleSave} disabled={saving}>
              {saving ? t.saving : t.save}
            </button>
          </div>

          {/* Bus photos */}
          <div className="nv-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '4px' }}>{t.busPhotos}</h2>
                <p style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.busPhotoHint}</p>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--nv-text-muted)' }}>{busPhotos.length}/6 &middot; {t.maxPhotos}</div>
            </div>

            {/* Bus photo grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>

              {busPhotos.map((photo, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid var(--nv-border)' }}>
                  <img src={photo} alt={'Bus ' + (i + 1)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => deleteBusPhoto(i)}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', color: 'white', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                  >x</button>
                  <div style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '11px', color: 'white', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', padding: '2px 6px' }}>
                    {lang === 'fr' ? 'Bus' : 'Bus'} {i + 1}
                  </div>
                </div>
              ))}

              {/* Add photo button */}
              {busPhotos.length < 6 && (
                <div
                  onClick={() => busInputRef.current?.click()}
                  style={{ aspectRatio: '16/9', borderRadius: '10px', border: '2px dashed var(--nv-green-300)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '8px', background: 'var(--nv-green-50)', transition: 'all 150ms ease' }}
                >
                  <div style={{ fontSize: '28px', color: 'var(--nv-green-500)' }}>+</div>
                  <div style={{ fontSize: '12px', color: 'var(--nv-green-600)', fontWeight: 600, textAlign: 'center', padding: '0 8px' }}>{uploading ? t.uploading : t.uploadBus}</div>
                  <input ref={busInputRef} type="file" accept="image/*" onChange={handleBusPhotoUpload} style={{ display: 'none' }} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
`;

const profileDir = path.join('app', 'agency', 'profile');
if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true });
fs.writeFileSync(path.join(profileDir, 'page.tsx'), agencyProfile, 'utf8');
console.log('Written: app/agency/profile/page.tsx');

// ============================================================
// STEP 4: Update agency dashboard to include profile quick action
// ============================================================
const agencyDashboard = `'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: { hello: 'Bonjour', overview: 'Voici un apercu de votre activite sur NyangaVoyage', trips: 'Trajets actifs', bookings: 'Reservations confirmees', revenue: 'Revenus totaux (FCFA)', actions: 'Actions rapides', manageTrips: 'Gerer les trajets', manageTripsDesc: 'Ajouter, modifier ou supprimer vos trajets', viewBookings: 'Voir les reservations', viewBookingsDesc: 'Consulter toutes les reservations de vos passagers', scanTicket: 'Scanner un billet', scanTicketDesc: 'Verifier un billet passager via QR code', myProfile: 'Mon profil', myProfileDesc: 'Photo de profil et photos de vos bus', logout: 'Deconnexion' },
  en: { hello: 'Hello', overview: 'Here is an overview of your activity on NyangaVoyage', trips: 'Active trips', bookings: 'Confirmed bookings', revenue: 'Total revenue (FCFA)', actions: 'Quick actions', manageTrips: 'Manage trips', manageTripsDesc: 'Add, edit or delete your trips', viewBookings: 'View bookings', viewBookingsDesc: 'See all passenger bookings', scanTicket: 'Scan a ticket', scanTicketDesc: 'Verify a passenger ticket via QR code', myProfile: 'My profile', myProfileDesc: 'Profile photo and bus photos', logout: 'Sign out' },
}

export default function AgencyDashboardPage() {
  const router = useRouter()
  const { lang } = useLang()
  const t = T[lang]
  const [agency, setAgency] = useState<any>(null)
  const [stats, setStats] = useState({ trips: 0, bookings: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  useEffect(() => { checkAuth() }, [])

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/agency/login'); return }
    const { data: ag } = await supabase.from('agencies').select('*').eq('user_id', user.id).eq('is_admin', false).single()
    if (!ag) { router.push('/agency/login'); return }
    setAgency(ag)
    const saved = localStorage.getItem('agency_profile_photo_' + ag.id)
    if (saved) setProfilePhoto(saved)
    const { data: trips } = await supabase.from('trips').select('id').eq('agency_id', ag.id)
    const tripIds = (trips || []).map((t: any) => t.id)
    let bookings: any[] = []
    if (tripIds.length > 0) {
      const { data } = await supabase.from('bookings').select('*, trips(price)').in('trip_id', tripIds).eq('status', 'confirmed')
      bookings = data || []
    }
    const revenue = bookings.reduce((sum: number, b: any) => sum + (b.trips?.price || 0), 0)
    setStats({ trips: trips?.length || 0, bookings: bookings.length, revenue })
    setLoading(false)
  }

  async function handleLogout() { await supabase.auth.signOut(); router.push('/agency/login') }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="nv-spinner nv-spinner-lg" /></div>

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>

        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Agency" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--nv-green-400)', flexShrink: 0 }} />
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--nv-green-100)', border: '3px solid var(--nv-green-300)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: 'var(--nv-green-700)', flexShrink: 0 }}>
                {agency?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '26px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '2px' }}>{t.hello}, {agency?.name}</h1>
              <p style={{ fontSize: '13px', color: 'var(--nv-text-secondary)' }}>{t.overview}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nv-btn nv-btn-secondary nv-btn-sm">{t.logout}</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: t.trips,    value: stats.trips,                           color: 'var(--nv-green-600)' },
            { label: t.bookings, value: stats.bookings,                        color: '#2563eb' },
            { label: t.revenue,  value: stats.revenue.toLocaleString('fr-CM'), color: 'var(--nv-gold-600)' },
          ].map((s, i) => (
            <div key={i} className="nv-card" style={{ padding: '24px' }}>
              <div style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '32px', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.actions}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          {[
            { href: '/agency/trips',    icon: '&#128652;', title: t.manageTrips,  desc: t.manageTripsDesc,  color: 'var(--nv-gray-900)', bg: 'var(--nv-bg-surface)', border: 'var(--nv-border)' },
            { href: '/agency/bookings', icon: '&#128203;', title: t.viewBookings, desc: t.viewBookingsDesc, color: 'var(--nv-gray-900)', bg: 'var(--nv-bg-surface)', border: 'var(--nv-border)' },
            { href: '/agency/scan',     icon: '&#9638;',   title: t.scanTicket,   desc: t.scanTicketDesc,   color: 'var(--nv-green-700)', bg: 'var(--nv-green-50)', border: 'var(--nv-green-300)' },
            { href: '/agency/profile',  icon: '&#128247;', title: t.myProfile,    desc: t.myProfileDesc,    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
          ].map((a, i) => (
            <Link key={i} href={a.href} style={{ textDecoration: 'none' }}>
              <div className="nv-card nv-card-hover" style={{ padding: '22px', borderColor: a.border, background: a.bg }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: a.icon }} />
                <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '15px', fontWeight: 700, color: a.color, marginBottom: '5px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--nv-text-secondary)' }}>{a.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
`;
fs.writeFileSync(path.join('app', 'agency', 'dashboard', 'page.tsx'), agencyDashboard, 'utf8');
console.log('Written: app/agency/dashboard/page.tsx with profile card');

// ============================================================
// STEP 5: Remove lang toggle CSS from globals.css
// ============================================================
let css = fs.readFileSync(path.join('app', 'globals.css'), 'utf8');
// Hide lang toggle visually (keep CSS in case needed later)
if (!css.includes('nv-lang-toggle { display: none')) {
  css = css + `\n/* Language toggle hidden - auto-detected from device */\n.nv-lang-toggle { display: none !important; }\n`;
  fs.writeFileSync(path.join('app', 'globals.css'), css, 'utf8');
  console.log('Updated: globals.css - hidden language toggle');
}

console.log('\n=== ALL DONE ===');
console.log('1. Language now auto-detected from phone/browser settings');
console.log('2. Language toggle removed from all pages');
console.log('3. Agency profile page created with photo upload');
console.log('4. Agency dashboard shows profile photo + profile card');
console.log('5. Bus photos section with up to 6 photos per agency');
console.log('6. Scanner link in agency navbar');
