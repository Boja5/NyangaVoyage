
/*
 * ============================================================
 * FILE: app/layout.tsx
 * WHAT THIS FILE DOES:
 *   This is the ROOT LAYOUT — it wraps EVERY page in the app.
 *   Think of it like a picture frame that holds all pages.
 *   It does 3 important things:
 *   1. Loads the Google Fonts (Syne for headings, DM Sans for body text)
 *   2. Sets the browser tab title and the WhatsApp/Facebook preview image
 *   3. Wraps everything in LangProvider so ALL pages share the same language (FR/EN)
 *
 * WHY IT EXISTS:
 *   In Next.js, layout.tsx is special — it runs on EVERY page automatically.
 *   Without it, each page would need its own font loading and language setup.
 *   By putting it here once, every page inherits it automatically.
 *
 * KEY CONCEPTS:
 *   - metadata: controls what appears in browser tabs and social media previews
 *   - LangProvider: a React "context" that shares language state across all pages
 *   - crossOrigin: required by Google Fonts for security
 * ============================================================
 */

import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

const BASE_URL = 'https://nyanga-voyages.vercel.app'

export const metadata: Metadata = {
  title: 'NyangaVoyage — Bus & Train au Cameroun',
  description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS. 12 villes desservies.',
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.svg',
  },
  openGraph: {
    title: 'NyangaVoyage — Bus & Train au Cameroun',
    description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS.',
    url: BASE_URL,
    siteName: 'NyangaVoyage',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'NyangaVoyage — Bus & Train au Cameroun',
      },
    ],
    locale: 'fr_CM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyangaVoyage — Bus & Train au Cameroun',
    description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <meta name="theme-color" content="#0f172a" />
        <meta property="og:image" content={`${BASE_URL}/og-image.svg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NyangaVoyage" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={`${BASE_URL}/og-image.svg`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LangProvider>
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
