const fs = require('fs');
const path = require('path');

// ============================================================
// FILE 1: app/agency/scan/page.tsx
// Real QR scanner that looks up booking from Supabase
// ============================================================
const scanPage = `'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Scanner un billet',
    sub: 'Scannez le QR code ou entrez la reference du billet',
    startScan: 'Demarrer le scanner',
    stopScan: 'Arreter le scanner',
    manualEntry: 'Entrer la reference manuellement',
    placeholder: 'Ex: GGAO1ERT',
    verify: 'Verifier',
    valid: 'Billet VALIDE',
    invalid: 'Billet introuvable ou invalide',
    passenger: 'Passager',
    phone: 'Telephone',
    origin: 'Depart',
    destination: 'Destination',
    date: 'Date',
    agency: 'Agence',
    class: 'Classe',
    seat: 'Siege',
    price: 'Prix',
    type: 'Type',
    ref: 'Reference',
    scanNew: 'Scanner un autre billet',
    back: 'Retour au tableau de bord',
    scanning: 'Pointez le QR code vers la camera...',
    cameraError: 'Camera non disponible. Utilisez la saisie manuelle.',
    loading: 'Verification en cours...',
  },
  en: {
    title: 'Scan a ticket',
    sub: 'Scan the QR code or enter the ticket reference',
    startScan: 'Start scanner',
    stopScan: 'Stop scanner',
    manualEntry: 'Enter reference manually',
    placeholder: 'e.g. GGAO1ERT',
    verify: 'Verify',
    valid: 'VALID Ticket',
    invalid: 'Ticket not found or invalid',
    passenger: 'Passenger',
    phone: 'Phone',
    origin: 'From',
    destination: 'To',
    date: 'Date',
    agency: 'Agency',
    class: 'Class',
    seat: 'Seat',
    price: 'Price',
    type: 'Type',
    ref: 'Reference',
    scanNew: 'Scan another ticket',
    back: 'Back to dashboard',
    scanning: 'Point the QR code at the camera...',
    cameraError: 'Camera not available. Use manual entry.',
    loading: 'Verifying...',
  },
}

export default function AgencyScanPage() {
  const { lang } = useLang()
  const t = T[lang]
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [manualRef, setManualRef] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<any>(null)

  useEffect(() => { return () => stopScanner() }, [])

  // ---- Look up booking from Supabase by reference ----
  async function lookupBooking(ref: string) {
    setLoading(true)
    setError('')
    setResult(null)

    const cleanRef = ref.trim().toUpperCase()

    // First try bus bookings
    const { data: busBooking } = await supabase
      .from('bookings')
      .select('*, trips(origin, destination, departure_time, bus_class, price, agencies(name)), seats(seat_number)')
      .eq('booking_ref', cleanRef)
      .single()

    if (busBooking) {
      setResult({
        ref: busBooking.booking_ref,
        passenger: busBooking.passenger_name || 'N/A',
        phone: busBooking.passenger_phone || 'N/A',
        origin: busBooking.trips?.origin,
        destination: busBooking.trips?.destination,
        date: new Date(busBooking.trips?.departure_time).toLocaleDateString('fr-CM'),
        agency: busBooking.trips?.agencies?.name,
        class: busBooking.trips?.bus_class,
        seat: 'N' + String.fromCharCode(176) + busBooking.seats?.seat_number,
        price: (busBooking.trips?.price || 0).toLocaleString('fr-CM') + ' FCFA',
        type: 'BUS',
        status: busBooking.status?.toUpperCase(),
      })
      setLoading(false)
      return
    }

    // If not found in bus bookings, try QR data directly (train bookings from localStorage via QR)
    setError(t.invalid)
    setLoading(false)
  }

  // ---- Process QR code data (JSON encoded in QR) ----
  function processQRData(raw: string) {
    try {
      // Try parsing as JSON first (our QR format)
      const data = JSON.parse(raw)
      if (data.ref) {
        // Look up the reference in Supabase to get real data
        lookupBooking(data.ref)
        return
      }
    } catch {
      // Not JSON, treat as plain booking reference
    }
    // Try as plain reference string
    if (raw.length >= 6 && raw.length <= 12) {
      lookupBooking(raw)
    } else {
      setError(t.invalid)
    }
  }

  async function startScanner() {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setScanning(true)
      setCameraError(false)

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue
              stopScanner()
              processQRData(raw)
            }
          } catch {}
        }, 500)
      }
    } catch {
      setCameraError(true)
      setScanning(false)
    }
  }

  function stopScanner() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setScanning(false)
  }

  function handleManualVerify() {
    if (!manualRef.trim()) return
    lookupBooking(manualRef)
  }

  const isValid = result?.status === 'CONFIRMED'

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />
      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <Link href="/agency/dashboard" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>
              &larr; {t.back}
            </Link>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginTop: '12px', marginBottom: '6px' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>

          {!result && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Camera Scanner */}
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  QR Scanner
                </div>

                {cameraError && (
                  <div className="nv-alert nv-alert-warning" style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '13px' }}>{t.cameraError}</div>
                  </div>
                )}

                <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', aspectRatio: '1', maxWidth: '300px', margin: '0 auto 16px' }}>
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }} playsInline muted />
                  {!scanning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '64px' }}>&#9635;</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '0 20px' }}>{t.startScan}</div>
                    </div>
                  )}
                  {scanning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#16a34a', opacity: 0.7 }} />
                      </div>
                    </div>
                  )}
                </div>

                <button className={'nv-btn nv-btn-full ' + (scanning ? 'nv-btn-secondary' : 'nv-btn-primary')} onClick={scanning ? stopScanner : startScanner} style={{ height: '48px', fontSize: '15px' }}>
                  {scanning ? t.stopScan : t.startScan}
                </button>
              </div>

              {/* Manual entry */}
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>{t.manualEntry}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="nv-input"
                    placeholder={t.placeholder}
                    value={manualRef}
                    onChange={e => setManualRef(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleManualVerify()}
                    style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.08em' }}
                  />
                  <button className="nv-btn nv-btn-primary" onClick={handleManualVerify} style={{ whiteSpace: 'nowrap' }}>
                    {t.verify}
                  </button>
                </div>
                {error && (
                  <div className="nv-alert nv-alert-error" style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '13px' }}>{error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '16px' }}>
              <div className="nv-spinner nv-spinner-lg" />
              <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.loading}</div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div>
              {/* Valid/Invalid banner */}
              <div style={{
                padding: '20px 24px', borderRadius: '12px', marginBottom: '20px',
                background: isValid ? '#f0fdf4' : '#fef2f2',
                border: '2px solid ' + (isValid ? '#16a34a' : '#f87171'),
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                  background: isValid ? '#16a34a' : '#ef4444',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', color: 'white', fontWeight: 800,
                }}>
                  {isValid ? '\u2713' : '\u2717'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: isValid ? '#15803d' : '#dc2626' }}>
                    {isValid ? t.valid : t.invalid}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>
                    {t.ref}: <strong>{result.ref}</strong>
                  </div>
                </div>
              </div>

              {/* Ticket details */}
              <div className="nv-card" style={{ padding: '24px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                  TICKET INFORMATION
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    { label: t.passenger,   value: result.passenger },
                    { label: t.phone,       value: result.phone },
                    { label: t.origin,      value: result.origin },
                    { label: t.destination, value: result.destination },
                    { label: t.class,       value: result.class },
                    { label: t.seat,        value: result.seat },
                    { label: t.price,       value: result.price },
                    { label: t.type,        value: result.type },
                  ].map((row, i) => (
                    <div key={i} style={{ padding: '12px', background: 'var(--nv-gray-50)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--nv-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--nv-gray-900)' }}>
                        {row.value || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="nv-btn nv-btn-primary nv-btn-full"
                style={{ height: '48px', fontSize: '15px' }}
                onClick={() => { setResult(null); setManualRef(''); setError('') }}
              >
                {t.scanNew}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================
// FILE 2: Update bus checkout to save passenger info in booking
// The issue is passenger_name and passenger_phone aren't saved
// ============================================================
const checkoutPatch = `
// IMPORTANT: Run this SQL in Supabase to add passenger columns if missing:
// ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_name text;
// ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_phone text;
`;

const scanDir = path.join('app', 'agency', 'scan');
if (!fs.existsSync(scanDir)) fs.mkdirSync(scanDir, { recursive: true });
fs.writeFileSync(path.join(scanDir, 'page.tsx'), scanPage, 'utf8');
console.log('Written: app/agency/scan/page.tsx - real Supabase lookup');

fs.writeFileSync('SUPABASE_SQL_FIX.txt', checkoutPatch, 'utf8');
console.log('Written: SUPABASE_SQL_FIX.txt');

console.log('\nNow run this SQL in Supabase editor:');
console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_name text;');
console.log('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS passenger_phone text;');
