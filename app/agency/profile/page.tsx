'use client'

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
