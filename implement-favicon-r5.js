const fs = require('fs');
const path = require('path');

// ============================================================
// R5 SVG — Sunrise + bus + italic serif NV
// ============================================================
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
  <line x1="16" y1="9" x2="16" y2="7" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <line x1="20" y1="10" x2="21.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <line x1="12" y1="10" x2="10.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
  <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
  <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
  <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
  <rect x="23" y="25" width="1.5" height="1.5" rx="0.3" fill="#fef08a"/>
  <text x="11" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#4ade80">N</text>
  <text x="16" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#fbbf24">V</text>
</svg>`;

// ============================================================
// Larger version for apple-touch-icon (180x180)
// ============================================================
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#0f172a"/>
  <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
  <line x1="16" y1="9" x2="16" y2="7" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <line x1="20" y1="10" x2="21.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <line x1="12" y1="10" x2="10.5" y2="8.5" stroke="#fbbf24" stroke-width="1" stroke-linecap="round"/>
  <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
  <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
  <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
  <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
  <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
  <rect x="23" y="25" width="1.5" height="1.5" rx="0.3" fill="#fef08a"/>
  <text x="11" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#4ade80">N</text>
  <text x="16" y="6" font-family="Georgia,serif" font-size="5" font-weight="700" font-style="italic" fill="#fbbf24">V</text>
</svg>`;

// Write favicon.svg to public folder
if (!fs.existsSync('public')) fs.mkdirSync('public');
fs.writeFileSync(path.join('public', 'favicon.svg'), faviconSvg, 'utf8');
console.log('Written: public/favicon.svg');

fs.writeFileSync(path.join('public', 'apple-touch-icon.svg'), appleTouchSvg, 'utf8');
console.log('Written: public/apple-touch-icon.svg');

// ============================================================
// Update app/layout.tsx to use the new favicon
// ============================================================
const layout = `import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'NyangaVoyage — Bus & Train au Cameroun',
  description: 'Reservez votre billet de bus ou de train au Cameroun. Paiement MTN Mobile Money. Confirmation par SMS.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.svg',
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
console.log('Written: app/layout.tsx with favicon links');

// ============================================================
// Update Navbar to show R5 logo instead of text
// ============================================================
let navbar = fs.readFileSync(path.join('components', 'Navbar.tsx'), 'utf8');

const oldLogo = `<Link href="/" className="nv-nav-logo">NyangaVoyage</Link>`;
const newLogo = `<Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
        </Link>`;

if (navbar.includes(oldLogo)) {
  navbar = navbar.replace(oldLogo, newLogo);
  fs.writeFileSync(path.join('components', 'Navbar.tsx'), navbar, 'utf8');
  console.log('Updated: components/Navbar.tsx with R5 logo');
} else {
  console.log('Navbar logo already updated or pattern not found — skipping');
}

// ============================================================
// Update homepage logo too (uses <a> not Link)
// ============================================================
let homePage = fs.readFileSync(path.join('app', 'page.tsx'), 'utf8');

const oldHomeLogo = `<a href="/" className="nv-nav-logo">NyangaVoyage</a>`;
const newHomeLogo = `<a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
        </a>`;

if (homePage.includes(oldHomeLogo)) {
  homePage = homePage.replace(oldHomeLogo, newHomeLogo);
  fs.writeFileSync(path.join('app', 'page.tsx'), homePage, 'utf8');
  console.log('Updated: app/page.tsx with R5 logo');
} else {
  console.log('Homepage logo already updated or pattern not found — skipping');
}

// Update footer logos too
const footerFiles = [
  'app/page.tsx',
  'app/results/page.tsx',
  'app/search/page.tsx',
  'app/agencies/page.tsx',
];

footerFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const before = content;
  // Replace footer text logo with icon + text
  content = content.replace(
    /<div className="nv-footer-logo">NyangaVoyage<\/div>/g,
    `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="8" fill="#0f172a"/>
                <path d="M5 24 A11 11 0 0 1 27 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8 20 A10 10 0 0 1 24 20" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                <circle cx="16" cy="13" r="2.5" fill="#fbbf24"/>
                <rect x="7" y="24" width="18" height="5" rx="1.5" fill="#16a34a"/>
                <rect x="9" y="22" width="14" height="3" rx="1" fill="#15803d"/>
                <rect x="10" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <rect x="14" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <rect x="18" y="24" width="2.5" height="3" rx="0.5" fill="#bae6fd" opacity="0.7"/>
                <circle cx="10" cy="30" r="1.8" fill="#1e293b"/>
                <circle cx="22" cy="30" r="1.8" fill="#1e293b"/>
              </svg>
              <div className="nv-footer-logo">NyangaVoyage</div>
            </div>`
  );
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated footer logo: ' + filePath);
  }
});

console.log('\nAll done! R5 logo is now:');
console.log('  - Browser tab favicon (public/favicon.svg)');
console.log('  - Apple home screen icon (public/apple-touch-icon.svg)');
console.log('  - Navbar logo on every page');
console.log('  - Footer logo on key pages');
