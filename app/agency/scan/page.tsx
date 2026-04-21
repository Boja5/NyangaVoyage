'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import Navbar from '@/components/Navbar'

const T = {
  fr: {
    title: 'Scanner un billet',
    sub: 'Scannez le QR code du billet du passager pour verifier sa reservation',
    startScan: 'Demarrer le scanner',
    stopScan: 'Arreter le scanner',
    manualEntry: 'Entrer la reference manuellement',
    manualPlaceholder: 'Ex: ABC12345',
    verify: 'Verifier',
    scanResult: 'Informations du billet',
    valid: 'Billet VALIDE',
    invalid: 'Reference introuvable',
    passenger: 'Passager',
    phone: 'Telephone',
    origin: 'Depart',
    destination: 'Destination',
    date: 'Date',
    agency: 'Agence',
    class: 'Classe',
    seat: 'Siege',
    price: 'Prix',
    status: 'Statut',
    operator: 'Operateur',
    type: 'Type',
    scanNew: 'Scanner un autre billet',
    cameraError: 'Camera non disponible. Utilisez la saisie manuelle.',
    scanning: 'Positionnez le QR code dans le cadre...',
    backToDash: 'Retour au tableau de bord',
  },
  en: {
    title: 'Scan a ticket',
    sub: 'Scan the passenger QR code to verify their booking',
    startScan: 'Start scanner',
    stopScan: 'Stop scanner',
    manualEntry: 'Enter reference manually',
    manualPlaceholder: 'e.g. ABC12345',
    verify: 'Verify',
    scanResult: 'Ticket information',
    valid: 'VALID Ticket',
    invalid: 'Reference not found',
    passenger: 'Passenger',
    phone: 'Phone',
    origin: 'From',
    destination: 'To',
    date: 'Date',
    agency: 'Agency',
    class: 'Class',
    seat: 'Seat',
    price: 'Price',
    status: 'Status',
    operator: 'Operator',
    type: 'Type',
    scanNew: 'Scan another ticket',
    cameraError: 'Camera not available. Use manual entry.',
    scanning: 'Point the QR code at the frame...',
    backToDash: 'Back to dashboard',
  },
}

export default function AgencyScanPage() {
  const { lang } = useLang()
  const t = T[lang]
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [manualRef, setManualRef] = useState('')
  const [error, setError] = useState('')
  const [cameraError, setCameraError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    return () => stopScanner()
  }, [])

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

      // Use BarcodeDetector API if available (Chrome Android)
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        intervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const raw = barcodes[0].rawValue
              processQRData(raw)
              stopScanner()
            }
          } catch {}
        }, 500)
      }
    } catch (err) {
      setCameraError(true)
      setScanning(false)
    }
  }

  function stopScanner() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setScanning(false)
  }

  function processQRData(raw: string) {
    try {
      const data = JSON.parse(raw)
      setResult(data)
      setError('')
    } catch {
      setError(t.invalid)
    }
  }

  function handleManualVerify() {
    if (!manualRef.trim()) return
    // Search localStorage for matching booking (demo mode)
    const saved = localStorage.getItem('nv_train_booking')
    if (saved) {
      const booking = JSON.parse(saved)
      const passengerName = localStorage.getItem('nv_passenger_name') || 'N/A'
      const passengerPhone = localStorage.getItem('nv_passenger_phone') || 'N/A'
      setResult({
        ref: manualRef.toUpperCase(),
        passenger: passengerName,
        phone: '+237' + passengerPhone,
        origin: booking.origin,
        destination: booking.destination,
        date: booking.date,
        depart: booking.depart,
        class: booking.className,
        seat: booking.seat,
        price: booking.price + ' FCFA',
        status: 'CONFIRMED',
        type: booking.className?.includes('Couchette') ? 'TRAIN' : 'TRAIN',
        operator: 'Camrail',
      })
      setError('')
    } else {
      setError(t.invalid)
    }
  }

  const isValid = result?.status === 'CONFIRMED'

  return (
    <div style={{ fontFamily: 'var(--nv-font-body)', minHeight: '100vh', background: 'var(--nv-bg-page)' }}>
      <Navbar />

      <div className="nv-container" style={{ padding: 'clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <Link href="/agency/dashboard" style={{ fontSize: '13px', color: 'var(--nv-text-secondary)', textDecoration: 'none' }}>
              &larr; {t.backToDash}
            </Link>
            <h1 style={{ fontFamily: 'var(--nv-font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--nv-gray-900)', marginTop: '12px', marginBottom: '6px' }}>
              {t.title}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--nv-text-secondary)' }}>{t.sub}</p>
          </div>

          {!result && (
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

                {/* Video feed */}
                <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', aspectRatio: '1', maxWidth: '320px', margin: '0 auto 16px' }}>
                  <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: scanning ? 'block' : 'none' }}
                    playsInline
                    muted
                  />
                  {!scanning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '48px' }}>&#9635;</div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '0 20px' }}>
                        {t.startScan}
                      </div>
                    </div>
                  )}
                  {scanning && (
                    <>
                      {/* Scanner frame overlay */}
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '30px', borderTop: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderLeft: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '30px', height: '30px', borderBottom: '3px solid #16a34a', borderRight: '3px solid #16a34a' }} />
                          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#16a34a', opacity: 0.7 }} />
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                        {t.scanning}
                      </div>
                    </>
                  )}
                </div>

                <button
                  className={'nv-btn nv-btn-full ' + (scanning ? 'nv-btn-secondary' : 'nv-btn-primary')}
                  onClick={scanning ? stopScanner : startScanner}
                  style={{ height: '48px', fontSize: '15px' }}
                >
                  {scanning ? t.stopScan : t.startScan}
                </button>
              </div>

              {/* Manual entry */}
              <div className="nv-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--nv-gray-900)', marginBottom: '16px' }}>
                  {t.manualEntry}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="nv-input"
                    placeholder={t.manualPlaceholder}
                    value={manualRef}
                    onChange={e => setManualRef(e.target.value.toUpperCase())}
                    style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}
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

          {/* RESULT */}
          {result && (
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
                  {isValid ? '✓' : '✗'}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--nv-font-display)', fontSize: '22px', fontWeight: 800, color: isValid ? '#15803d' : '#dc2626' }}>
                    {isValid ? t.valid : t.invalid}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--nv-text-secondary)', marginTop: '2px' }}>
                    Ref: <strong>{result.ref}</strong>
                  </div>
                </div>
              </div>

              {/* Ticket details */}
              {isValid && (
                <div className="nv-card" style={{ padding: '24px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--nv-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
                    {t.scanResult}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { label: t.passenger, value: result.passenger },
                      { label: t.phone, value: result.phone },
                      { label: t.origin, value: result.origin },
                      { label: t.destination, value: result.destination },
                      { label: t.class, value: result.class },
                      { label: t.seat, value: 'N°' + result.seat },
                      { label: t.price, value: result.price },
                      { label: t.type, value: result.type },
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
              )}

              <button className="nv-btn nv-btn-primary nv-btn-full" style={{ height: '48px', fontSize: '15px' }} onClick={() => { setResult(null); setManualRef(''); setError('') }}>
                {t.scanNew}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
