const fs = require('fs');
const path = require('path');

// ============================================================
// OG IMAGE — 1200x630 (WhatsApp, Facebook, Twitter standard)
// Saved as public/og-image.svg
// ============================================================
const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0f172a"/>

  <!-- Subtle grid pattern -->
  <defs>
    <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>

  <!-- Green accent bar left -->
  <rect x="0" y="0" width="8" height="630" fill="#16a34a"/>

  <!-- Gold accent bar bottom -->
  <rect x="0" y="622" width="1200" height="8" fill="#d97706"/>

  <!-- Large sunrise arcs — decorative background -->
  <path d="M 200 580 A 380 380 0 0 1 1000 580" fill="none" stroke="#16a34a" stroke-width="60" stroke-linecap="round" opacity="0.08"/>
  <path d="M 280 580 A 300 300 0 0 1 920 580" fill="none" stroke="#22c55e" stroke-width="30" stroke-linecap="round" opacity="0.06"/>

  <!-- R5 Logo icon large — left side -->
  <g transform="translate(80, 180) scale(7)">
    <rect width="32" height="32" rx="8" fill="#111827"/>
    <rect width="32" height="32" rx="8" fill="none" stroke="#16a34a" stroke-width="1.5"/>
    <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
    <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
    <line x1="16" y1="9" x2="16" y2="7" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
    <line x1="20" y1="10" x2="21.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
    <line x1="12" y1="10" x2="10.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
    <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
    <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
    <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.8"/>
    <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.8"/>
    <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.8"/>
    <circle cx="10" cy="30" r="1.8" fill="#0f172a"/>
    <circle cx="22" cy="30" r="1.8" fill="#0f172a"/>
    <rect x="23" y="25" width="1.5" height="1.5" rx="0.3" fill="#fef08a"/>
    <text x="11" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#4ade80">N</text>
    <text x="16" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#fbbf24">V</text>
  </g>

  <!-- Brand name -->
  <text x="380" y="280" font-family="Georgia, serif" font-size="88" font-weight="700" font-style="italic" fill="#ffffff" letter-spacing="-2">Nyanga</text>
  <text x="380" y="370" font-family="Georgia, serif" font-size="88" font-weight="700" font-style="italic" fill="#16a34a" letter-spacing="-2">Voyage</text>

  <!-- Tagline -->
  <text x="382" y="430" font-family="Arial, sans-serif" font-size="28" fill="#94a3b8" letter-spacing="1">Bus &amp; Train au Cameroun</text>

  <!-- Divider -->
  <rect x="382" y="450" width="120" height="3" rx="2" fill="#d97706"/>

  <!-- Feature pills -->
  <rect x="382" y="470" width="200" height="44" rx="22" fill="#15803d"/>
  <text x="482" y="498" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="white">MTN MoMo</text>

  <rect x="596" y="470" width="180" height="44" rx="22" fill="#1e293b" stroke="#d97706" stroke-width="1.5"/>
  <text x="686" y="498" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#fbbf24">SMS Ticket</text>

  <rect x="790" y="470" width="160" height="44" rx="22" fill="#1e293b" stroke="#16a34a" stroke-width="1.5"/>
  <text x="870" y="498" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#4ade80">12 Villes</text>

  <!-- URL -->
  <text x="382" y="570" font-family="Arial, sans-serif" font-size="24" fill="#475569">nyanga-voyages.vercel.app</text>

  <!-- Decorative bus silhouette right -->
  <g transform="translate(920, 280) scale(3.5)" opacity="0.15">
    <rect x="0" y="20" width="80" height="30" rx="4" fill="#16a34a"/>
    <rect x="4" y="14" width="72" height="12" rx="3" fill="#15803d"/>
    <rect x="8" y="22" width="12" height="12" rx="2" fill="#bae6fd"/>
    <rect x="24" y="22" width="12" height="12" rx="2" fill="#bae6fd"/>
    <rect x="40" y="22" width="12" height="12" rx="2" fill="#bae6fd"/>
    <rect x="56" y="22" width="12" height="12" rx="2" fill="#bae6fd"/>
    <circle cx="16" cy="52" r="8" fill="#1e293b"/>
    <circle cx="16" cy="52" r="5" fill="#374151"/>
    <circle cx="64" cy="52" r="8" fill="#1e293b"/>
    <circle cx="64" cy="52" r="5" fill="#374151"/>
    <rect x="68" y="26" width="8" height="6" rx="1" fill="#fef08a"/>
  </g>
</svg>`;

// Write OG image
fs.writeFileSync(path.join('public', 'og-image.svg'), ogImage, 'utf8');
console.log('Written: public/og-image.svg');

// ============================================================
// Update layout.tsx with full Open Graph + Twitter meta tags
// ============================================================
const layout = `import type { Metadata } from 'next'
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
        <meta property="og:image" content={\`\${BASE_URL}/og-image.svg\`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="NyangaVoyage" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={\`\${BASE_URL}/og-image.svg\`} />
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
`;

fs.writeFileSync(path.join('app', 'layout.tsx'), layout, 'utf8');
console.log('Written: app/layout.tsx with full OG meta tags');
console.log('\nDone! After pushing to Vercel:');
console.log('  - WhatsApp link previews will show the NyangaVoyage card');
console.log('  - Facebook, Twitter, Telegram will show the custom image');
console.log('  - The preview shows the R5 logo, brand name, and key features');
