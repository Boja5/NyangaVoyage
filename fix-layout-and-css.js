const fs = require('fs');

// ============================================================
// Fix layout.tsx - make sure globals.css is imported
// ============================================================
const layout = `import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

const BASE_URL = 'https://nyanga-voyages.vercel.app'

export const metadata: Metadata = {
  title: 'NyangaVoyage — Bus & Train au Cameroun',
  description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS.',
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/icon-192.svg',
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
        <meta property="og:image" content={BASE_URL + '/og-image.svg'} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={BASE_URL + '/og-image.svg'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: "if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }" }} />
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

fs.writeFileSync('app/layout.tsx', layout, 'utf8');
console.log('Written: app/layout.tsx with globals.css import');

// ============================================================
// Write complete globals.css
// ============================================================
const css = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --nv-font-display: 'Syne', sans-serif;
  --nv-font-body: 'DM Sans', sans-serif;
  --nv-green-50: #f0fdf4; --nv-green-100: #dcfce7; --nv-green-200: #bbf7d0;
  --nv-green-300: #86efac; --nv-green-400: #4ade80; --nv-green-500: #22c55e;
  --nv-green-600: #16a34a; --nv-green-700: #15803d; --nv-green-800: #166534;
  --nv-gold-50: #fffbeb; --nv-gold-100: #fef3c7; --nv-gold-200: #fde68a;
  --nv-gold-400: #fbbf24; --nv-gold-500: #f59e0b; --nv-gold-600: #d97706; --nv-gold-700: #b45309;
  --nv-gray-50: #f9fafb; --nv-gray-100: #f3f4f6; --nv-gray-200: #e5e7eb;
  --nv-gray-300: #d1d5db; --nv-gray-400: #9ca3af; --nv-gray-500: #6b7280;
  --nv-gray-600: #4b5563; --nv-gray-700: #374151; --nv-gray-800: #1f2937; --nv-gray-900: #111827;
  --nv-bg-page: #f8fafc; --nv-bg-surface: #ffffff; --nv-border: #e5e7eb;
  --nv-text-primary: #111827; --nv-text-secondary: #6b7280; --nv-text-muted: #9ca3af;
  --nv-radius-sm: 6px; --nv-radius-md: 10px; --nv-radius-lg: 14px;
  --nv-radius-xl: 20px; --nv-radius-full: 9999px;
  --nv-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --nv-shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
  --nv-shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
  --nv-max-width: 1200px;
}

html { font-size: 16px; -webkit-text-size-adjust: 100%; }
body { font-family: var(--nv-font-body); background: var(--nv-bg-page); color: var(--nv-text-primary); line-height: 1.5; -webkit-font-smoothing: antialiased; }
a { text-decoration: none; color: inherit; }
button { font-family: var(--nv-font-body); }

.nv-container { width: 100%; max-width: var(--nv-max-width); margin: 0 auto; padding-left: 40px; padding-right: 40px; }
.nv-section { padding-top: 56px; padding-bottom: 56px; }
.nv-section-sm { padding-top: 32px; padding-bottom: 32px; }

.nv-nav { position: sticky; top: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1.5px solid var(--nv-border); height: 60px; display: flex; align-items: center; }
.nv-nav-inner { width: 100%; max-width: var(--nv-max-width); margin: 0 auto; padding: 0 40px; display: flex; align-items: center; gap: 32px; }
.nv-nav-logo { font-family: var(--nv-font-display); font-size: 20px; font-weight: 800; color: var(--nv-green-600); letter-spacing: -0.02em; flex-shrink: 0; }
.nv-nav-links { display: flex; align-items: center; gap: 4px; flex: 1; }
.nv-nav-link { padding: 6px 12px; border-radius: var(--nv-radius-sm); font-size: 14px; font-weight: 500; color: var(--nv-text-secondary); transition: all 150ms ease; cursor: pointer; }
.nv-nav-link:hover, .nv-nav-link.active { color: var(--nv-gray-900); background: var(--nv-gray-100); }
.nv-nav-right { display: flex; align-items: center; gap: 10px; margin-left: auto; flex-shrink: 0; }

.nv-lang-toggle { display: none !important; }

.nv-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; border-radius: var(--nv-radius-md); font-family: var(--nv-font-body); font-weight: 600; cursor: pointer; transition: all 150ms ease; text-decoration: none; white-space: nowrap; }
.nv-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.nv-btn-primary { background: var(--nv-green-600); color: #fff; padding: 10px 20px; font-size: 14px; }
.nv-btn-primary:hover:not(:disabled) { background: var(--nv-green-700); }
.nv-btn-secondary { background: var(--nv-bg-surface); color: var(--nv-gray-700); border: 1.5px solid var(--nv-border); padding: 10px 20px; font-size: 14px; }
.nv-btn-secondary:hover:not(:disabled) { background: var(--nv-gray-50); border-color: var(--nv-gray-300); }
.nv-btn-danger { background: #fee2e2; color: #dc2626; border: 1.5px solid #fecaca; padding: 8px 14px; font-size: 13px; }
.nv-btn-danger:hover:not(:disabled) { background: #fecaca; }
.nv-btn-sm { padding: 6px 14px; font-size: 13px; }
.nv-btn-lg { padding: 14px 28px; font-size: 16px; }
.nv-btn-full { width: 100%; }

.nv-card { background: var(--nv-bg-surface); border: 1.5px solid var(--nv-border); border-radius: var(--nv-radius-lg); padding: 24px; box-shadow: var(--nv-shadow-sm); }
.nv-card-hover { cursor: pointer; transition: all 200ms ease; }
.nv-card-hover:hover { border-color: var(--nv-green-300); box-shadow: var(--nv-shadow-md); transform: translateY(-1px); }

.nv-form-group { display: flex; flex-direction: column; gap: 5px; }
.nv-label { font-size: 11px; font-weight: 600; color: var(--nv-text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }

.nv-input, .nv-select {
  width: 100%; padding: 10px 12px;
  border: 1.5px solid var(--nv-border); border-radius: var(--nv-radius-md);
  font-family: var(--nv-font-body); font-size: 14px; font-weight: 400;
  color: #111827 !important; -webkit-text-fill-color: #111827 !important;
  background-color: #ffffff !important; caret-color: #111827 !important;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  appearance: none; -webkit-appearance: none; -moz-appearance: none; outline: none;
}
.nv-input::placeholder { color: #9ca3af !important; -webkit-text-fill-color: #9ca3af !important; opacity: 1 !important; }
.nv-input:focus, .nv-select:focus { border-color: var(--nv-green-500); box-shadow: 0 0 0 3px rgba(34,197,94,0.12); }
.nv-input-error { border-color: #f87171 !important; }
.nv-error-msg { font-size: 12px; color: #dc2626; margin-top: 2px; }
.nv-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; cursor: pointer; }

input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus { -webkit-text-fill-color: #111827 !important; -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important; transition: background-color 5000s ease-in-out 0s !important; }
input, select, textarea { color: #111827 !important; -webkit-text-fill-color: #111827 !important; background-color: #ffffff !important; }

.nv-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: var(--nv-radius-full); font-size: 11px; font-weight: 600; white-space: nowrap; border: 1px solid transparent; }
.nv-badge-green    { background: var(--nv-green-50);  color: var(--nv-green-700);  border-color: var(--nv-green-200); }
.nv-badge-gold     { background: var(--nv-gold-50);   color: var(--nv-gold-700);   border-color: var(--nv-gold-200); }
.nv-badge-gray     { background: var(--nv-gray-100);  color: var(--nv-gray-600);   border-color: var(--nv-gray-200); }
.nv-badge-vip      { background: #fdf4ff; color: #7e22ce; border-color: #e9d5ff; }
.nv-badge-classic  { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.nv-badge-normal   { background: var(--nv-green-50);  color: var(--nv-green-700);  border-color: var(--nv-green-200); }
.nv-badge-second   { background: var(--nv-gray-100);  color: var(--nv-gray-700);   border-color: var(--nv-gray-300); }
.nv-badge-first    { background: var(--nv-gold-50);   color: var(--nv-gold-700);   border-color: var(--nv-gold-200); }
.nv-badge-couchette { background: #fdf4ff; color: #7e22ce; border-color: #e9d5ff; }

.nv-alert { padding: 12px 16px; border-radius: var(--nv-radius-md); border: 1.5px solid transparent; font-size: 14px; }
.nv-alert-success { background: var(--nv-green-50);  border-color: var(--nv-green-200); color: var(--nv-green-800); }
.nv-alert-warning { background: var(--nv-gold-50);   border-color: var(--nv-gold-200);  color: var(--nv-gold-700); }
.nv-alert-error   { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.nv-alert-info    { background: #eff6ff; border-color: #bfdbfe; color: #1e40af; }

.nv-spinner { width: 24px; height: 24px; border: 2.5px solid var(--nv-gray-200); border-top-color: var(--nv-green-600); border-radius: 50%; animation: nv-spin 0.7s linear infinite; display: inline-block; }
.nv-spinner-lg { width: 40px; height: 40px; border-width: 3.5px; }
@keyframes nv-spin { to { transform: rotate(360deg); } }

.nv-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--nv-text-secondary); margin-bottom: 12px; }
.nv-breadcrumb-sep { color: var(--nv-text-muted); }

.nv-footer { background: var(--nv-gray-900); padding: 28px 0; }
.nv-footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.nv-footer-logo { font-family: var(--nv-font-display); font-size: 18px; font-weight: 800; color: var(--nv-green-400); }

@media (max-width: 768px) {
  .nv-container { padding-left: 16px !important; padding-right: 16px !important; }
  .nv-section { padding-top: 32px !important; padding-bottom: 32px !important; }
  .nv-section-sm { padding-top: 20px !important; padding-bottom: 20px !important; }
  .nv-nav-links { display: none !important; }
  .nv-nav-inner { padding: 0 16px !important; gap: 8px !important; }
  .nv-footer-inner { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
  .nv-card { padding: 16px !important; }
  .nv-results-layout { grid-template-columns: 1fr !important; }
  .nv-seats-layout { grid-template-columns: 1fr !important; }
  .nv-seat-sidebar { position: static !important; order: -1 !important; }
  .nv-checkout-layout { grid-template-columns: 1fr !important; }
  .nv-checkout-summary { position: static !important; order: -1 !important; }
  .nv-table-wrap { overflow-x: auto !important; }
}

@media (max-width: 480px) {
  .nv-input, .nv-select { font-size: 16px !important; }
}
`;

fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('Written: app/globals.css with full design system');
console.log('\nNow run:');
console.log('  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue');
console.log('  npm run dev');
console.log('Then press Ctrl+Shift+R in browser');
