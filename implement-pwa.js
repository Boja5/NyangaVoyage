const fs = require('fs');
const path = require('path');

// ============================================================
// 1. public/manifest.json — Tells the browser this is an app
// ============================================================
const manifest = {
  name: "NyangaVoyage",
  short_name: "NyangaVoyage",
  description: "Reservez votre billet de bus ou de train au Cameroun",
  start_url: "/",
  display: "standalone",
  background_color: "#0f172a",
  theme_color: "#0f172a",
  orientation: "portrait",
  icons: [
    {
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable"
    },
    {
      src: "/icon-192.svg",
      sizes: "192x192",
      type: "image/svg+xml",
      purpose: "any maskable"
    },
    {
      src: "/icon-512.svg",
      sizes: "512x512",
      type: "image/svg+xml",
      purpose: "any maskable"
    }
  ],
  screenshots: [
    {
      src: "/og-image.svg",
      sizes: "1200x630",
      type: "image/svg+xml",
      form_factor: "wide"
    }
  ],
  categories: ["travel", "transportation"],
  lang: "fr"
};

fs.writeFileSync(
  path.join('public', 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);
console.log('Written: public/manifest.json');

// ============================================================
// 2. public/icon-192.svg — 192x192 app icon
// ============================================================
const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="48" fill="#0f172a"/>
  <rect x="6" y="6" width="180" height="180" rx="44" fill="none" stroke="#16a34a" stroke-width="4"/>
  <path d="M30 145 A66 66 0 0 1 162 145" fill="none" stroke="#16a34a" stroke-width="15" stroke-linecap="round"/>
  <path d="M48 121 A60 60 0 0 1 144 121" fill="none" stroke="#22c55e" stroke-width="9" stroke-linecap="round" opacity="0.5"/>
  <circle cx="96" cy="78" r="15" fill="#fbbf24"/>
  <line x1="96" y1="54" x2="96" y2="42" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="120" y1="60" x2="129" y2="51" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <line x1="72" y1="60" x2="63" y2="51" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <rect x="42" y="144" width="108" height="30" rx="9" fill="#16a34a"/>
  <rect x="54" y="132" width="84" height="18" rx="6" fill="#15803d"/>
  <rect x="60" y="144" width="15" height="18" rx="3" fill="#bae6fd" opacity="0.8"/>
  <rect x="84" y="144" width="15" height="18" rx="3" fill="#bae6fd" opacity="0.8"/>
  <rect x="108" y="144" width="15" height="18" rx="3" fill="#bae6fd" opacity="0.8"/>
  <circle cx="60" cy="180" r="11" fill="#1e293b"/>
  <circle cx="60" cy="180" r="6" fill="#374151"/>
  <circle cx="60" cy="180" r="3" fill="#d97706"/>
  <circle cx="132" cy="180" r="11" fill="#1e293b"/>
  <circle cx="132" cy="180" r="6" fill="#374151"/>
  <circle cx="132" cy="180" r="3" fill="#d97706"/>
  <rect x="138" y="150" width="9" height="9" rx="2" fill="#fef08a"/>
  <text x="66" y="36" font-family="Georgia,serif" font-size="30" font-weight="700" font-style="italic" fill="#4ade80">N</text>
  <text x="96" y="36" font-family="Georgia,serif" font-size="30" font-weight="700" font-style="italic" fill="#fbbf24">V</text>
</svg>`;

fs.writeFileSync(path.join('public', 'icon-192.svg'), icon192, 'utf8');
console.log('Written: public/icon-192.svg');

// ============================================================
// 3. public/icon-512.svg — 512x512 app icon
// ============================================================
const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="8" y="8" width="496" height="496" rx="90" fill="none" stroke="#16a34a" stroke-width="8"/>
  <path d="M60 390 A196 196 0 0 1 452 390" fill="none" stroke="#16a34a" stroke-width="36" stroke-linecap="round"/>
  <path d="M100 320 A170 170 0 0 1 412 320" fill="none" stroke="#22c55e" stroke-width="20" stroke-linecap="round" opacity="0.5"/>
  <circle cx="256" cy="200" r="42" fill="#fbbf24"/>
  <line x1="256" y1="140" x2="256" y2="110" stroke="#fbbf24" stroke-width="14" stroke-linecap="round"/>
  <line x1="316" y1="158" x2="338" y2="136" stroke="#fbbf24" stroke-width="14" stroke-linecap="round"/>
  <line x1="196" y1="158" x2="174" y2="136" stroke="#fbbf24" stroke-width="14" stroke-linecap="round"/>
  <rect x="110" y="384" width="292" height="80" rx="18" fill="#16a34a"/>
  <rect x="144" y="352" width="224" height="48" rx="12" fill="#15803d"/>
  <rect x="160" y="386" width="40" height="46" rx="6" fill="#bae6fd" opacity="0.8"/>
  <rect x="224" y="386" width="40" height="46" rx="6" fill="#bae6fd" opacity="0.8"/>
  <rect x="288" y="386" width="40" height="46" rx="6" fill="#bae6fd" opacity="0.8"/>
  <circle cx="160" cy="476" r="28" fill="#1e293b"/>
  <circle cx="160" cy="476" r="16" fill="#374151"/>
  <circle cx="160" cy="476" r="8" fill="#d97706"/>
  <circle cx="352" cy="476" r="28" fill="#1e293b"/>
  <circle cx="352" cy="476" r="16" fill="#374151"/>
  <circle cx="352" cy="476" r="8" fill="#d97706"/>
  <rect x="370" y="398" width="24" height="22" rx="4" fill="#fef08a"/>
  <text x="176" y="96" font-family="Georgia,serif" font-size="80" font-weight="700" font-style="italic" fill="#4ade80">N</text>
  <text x="256" y="96" font-family="Georgia,serif" font-size="80" font-weight="700" font-style="italic" fill="#fbbf24">V</text>
</svg>`;

fs.writeFileSync(path.join('public', 'icon-512.svg'), icon512, 'utf8');
console.log('Written: public/icon-512.svg');

// ============================================================
// 4. public/sw.js — Service Worker (makes app work offline)
// ============================================================
const serviceWorker = `
const CACHE_NAME = 'nyangavoyage-v1';
const STATIC_ASSETS = [
  '/',
  '/search',
  '/agencies',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).catch(() => caches.match('/'));
    })
  );
});
`;

fs.writeFileSync(path.join('public', 'sw.js'), serviceWorker, 'utf8');
console.log('Written: public/sw.js');

// ============================================================
// 5. Update layout.tsx to register PWA
// ============================================================
const layout = `import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

const BASE_URL = 'https://nyanga-voyages.vercel.app'

export const metadata: Metadata = {
  title: 'NyangaVoyage — Bus & Train au Cameroun',
  description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS. 12 villes desservies.',
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NyangaVoyage',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/icon-192.svg',
  },
  openGraph: {
    title: 'NyangaVoyage — Bus & Train au Cameroun',
    description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS.',
    url: BASE_URL,
    siteName: 'NyangaVoyage',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'NyangaVoyage' }],
    locale: 'fr_CM',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NyangaVoyage — Bus & Train au Cameroun',
    description: 'Reservez votre billet de bus ou de train au Cameroun.',
    images: ['/og-image.svg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NyangaVoyage" />
        <meta property="og:image" content={\`\${BASE_URL}/og-image.svg\`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={\`\${BASE_URL}/og-image.svg\`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: \`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        \`}} />
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
console.log('Written: app/layout.tsx with PWA support');

console.log('\nPWA implementation complete!');
console.log('After pushing to Vercel, users can install NyangaVoyage');
console.log('as a real app from their Android or iPhone browser.');
