const fs = require('fs');

// Read current globals.css
let css = fs.readFileSync('app/globals.css', 'utf8');

// Remove old mobile section if exists
css = css.replace(/\/\* ={10,}[\s\S]*?MOBILE RESPONSIVE[\s\S]*?\*\/[\s\S]*?@media[\s\S]*?\}(\s*\})?/g, '');

const mobileCss = `

/* ============================================================
   MOBILE RESPONSIVE — All pages
   ============================================================ */

/* ---- GLOBAL ---- */
@media (max-width: 768px) {
  .nv-container {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .nv-section { padding-top: 32px !important; padding-bottom: 32px !important; }
  .nv-section-sm { padding-top: 24px !important; padding-bottom: 24px !important; }
  .nv-nav-links { display: none !important; }
  .nv-nav-inner { padding: 0 16px !important; gap: 8px !important; }
  .nv-nav-logo { font-size: 17px !important; }
  .nv-footer-inner { flex-direction: column !important; gap: 8px !important; align-items: flex-start !important; }
}

/* ---- RESULTS PAGE ---- */
@media (max-width: 768px) {
  /* sidebar + results grid → stack vertically */
  .nv-results-layout {
    grid-template-columns: 1fr !important;
  }
  /* hide time filter sidebar on mobile, show as horizontal scroll */
  .nv-time-filter-sidebar {
    position: static !important;
    display: flex !important;
    flex-direction: row !important;
    gap: 8px !important;
    overflow-x: auto !important;
    padding-bottom: 4px !important;
  }
  .nv-time-filter-sidebar button {
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
  /* trip cards */
  .nv-trip-card-inner {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }
}

/* ---- SEAT MAP ---- */
@media (max-width: 768px) {
  .nv-seats-layout {
    grid-template-columns: 1fr !important;
  }
  .nv-seat-sidebar {
    position: static !important;
    order: -1 !important;
  }
  .nv-seat-box {
    width: 38px !important;
    height: 38px !important;
    font-size: 10px !important;
  }
}

/* ---- CHECKOUT ---- */
@media (max-width: 768px) {
  .nv-checkout-layout {
    grid-template-columns: 1fr !important;
  }
  .nv-checkout-summary {
    position: static !important;
    order: -1 !important;
  }
}

/* ---- TICKET ---- */
@media (max-width: 768px) {
  .nv-ticket-details-grid {
    grid-template-columns: 1fr !important;
  }
  .nv-ticket-route {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
  }
}

/* ---- AGENCY & ADMIN ---- */
@media (max-width: 768px) {
  .nv-agency-stats {
    grid-template-columns: 1fr 1fr !important;
  }
  .nv-agency-form-grid {
    grid-template-columns: 1fr !important;
  }
  .nv-admin-stats {
    grid-template-columns: 1fr 1fr !important;
  }
  .nv-admin-agencies-grid {
    grid-template-columns: 1fr !important;
  }
  /* scrollable tables on mobile */
  .nv-table-wrap {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
}

/* ---- SEARCH PAGE ---- */
@media (max-width: 768px) {
  .nv-search-form-grid {
    grid-template-columns: 1fr 1fr !important;
  }
  .nv-popular-routes {
    grid-template-columns: 1fr !important;
  }
}

/* ---- TRAIN RESULTS ---- */
@media (max-width: 768px) {
  .nv-train-card-inner {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 10px !important;
  }
  .nv-train-price {
    align-self: flex-end !important;
  }
}

/* ---- TRAIN SEATS ---- */
@media (max-width: 768px) {
  .nv-train-seats-layout {
    grid-template-columns: 1fr !important;
  }
  .nv-train-seat-sidebar {
    position: static !important;
    order: -1 !important;
  }
  .nv-couchette-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}

/* ---- PROGRESS BAR ---- */
@media (max-width: 480px) {
  .nv-progress-bar {
    font-size: 11px !important;
    gap: 4px !important;
  }
  .nv-progress-bar span {
    display: none !important;
  }
  .nv-progress-bar span.active {
    display: inline !important;
  }
}

/* ---- GENERAL CARD PADDING REDUCTION ---- */
@media (max-width: 480px) {
  .nv-card { padding: 16px !important; }
  .nv-card-lg { padding: 20px !important; }
}
`;

css = css + mobileCss;
fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('Written: mobile CSS to globals.css');

// ---- Now add className props to key layout divs in each page ----

function patchFile(filePath, patches) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipped (not found): ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  patches.forEach(([from, to]) => {
    if (content.includes(from)) {
      content = content.replace(from, to);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Patched: ' + filePath);
  } else {
    console.log('No changes needed: ' + filePath);
  }
}

// RESULTS PAGE
patchFile('app/results/page.tsx', [
  [
    "display: 'grid', gridTemplateColumns: '220px 1fr'",
    "display: 'grid', gridTemplateColumns: '220px 1fr'"
  ],
  // Replace the outer grid with className
  [
    "<div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>",
    "<div className='nv-results-layout' style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>"
  ],
  [
    "<div className=\"nv-card\" style={{ padding: '20px', position: 'sticky', top: '80px' }}>",
    "<div className=\"nv-card nv-time-filter-sidebar\" style={{ padding: '20px', position: 'sticky', top: '80px' }}>"
  ],
]);

// SEATS PAGE
patchFile('app/seats/[id]/page.tsx', [
  [
    "<div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>",
    "<div className='nv-seats-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>"
  ],
  [
    "<div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>",
    "<div className='nv-seat-sidebar' style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>"
  ],
  // Make seat boxes use className
  [
    "width: '44px', height: '44px',\n                                borderRadius: '8px',",
    "width: '44px', height: '44px',\n                                borderRadius: '8px',"
  ],
]);

// TRAIN SEATS PAGE
patchFile('app/train-seats/page.tsx', [
  [
    "<div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>",
    "<div className='nv-train-seats-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '32px', alignItems: 'start' }}>"
  ],
  [
    "<div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>",
    "<div className='nv-train-seat-sidebar' style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>"
  ],
  [
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'",
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'"
  ],
]);

// CHECKOUT PAGE
patchFile('app/checkout/page.tsx', [
  [
    "<div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>",
    "<div className='nv-checkout-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>"
  ],
  [
    "<div style={{ position: 'sticky', top: '80px' }}>",
    "<div className='nv-checkout-summary' style={{ position: 'sticky', top: '80px' }}>"
  ],
]);

// TRAIN CHECKOUT PAGE
patchFile('app/train-checkout/page.tsx', [
  [
    "<div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>",
    "<div className='nv-checkout-layout' style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>"
  ],
  [
    "<div style={{ position: 'sticky', top: '80px' }}>",
    "<div className='nv-checkout-summary' style={{ position: 'sticky', top: '80px' }}>"
  ],
]);

// TICKET PAGE
patchFile('app/ticket/[bookingRef]/page.tsx', [
  [
    "display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'",
    "display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'"
  ],
  [
    "padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderBottom:",
    "padding: '24px 32px', borderBottom:"
  ],
]);

patchFile('app/ticket/[bookingRef]/page.tsx', [
  [
    "padding: '24px 32px', borderBottom:",
    "padding: '16px 20px', borderBottom:"
  ],
]);

// AGENCY DASHBOARD
patchFile('app/agency/dashboard/page.tsx', [
  [
    "display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'",
    "display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'"
  ],
  [
    "{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }",
    "{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '40px' }"
  ],
]);

// AGENCY TRIPS - make form grid mobile friendly
patchFile('app/agency/trips/page.tsx', [
  [
    "display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px'",
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px'"
  ],
]);

// ADMIN DASHBOARD
patchFile('app/admin/dashboard/page.tsx', [
  [
    "display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'",
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))'"
  ],
  [
    "display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'",
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'"
  ],
]);

// SEARCH PAGE
patchFile('app/search/page.tsx', [
  [
    "gridTemplateColumns: '1fr 1fr 1fr 1fr auto'",
    "gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))'"
  ],
  [
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))'",
    "display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))'"
  ],
]);

// Add padding to all page containers
const pageFiles = [
  'app/results/page.tsx',
  'app/seats/[id]/page.tsx',
  'app/checkout/page.tsx',
  'app/ticket/[bookingRef]/page.tsx',
  'app/ticket/train/[bookingRef]/page.tsx',
  'app/train-results/page.tsx',
  'app/train-seats/page.tsx',
  'app/train-checkout/page.tsx',
  'app/search/page.tsx',
  'app/agency/login/page.tsx',
  'app/agency/dashboard/page.tsx',
  'app/agency/trips/page.tsx',
  'app/agency/bookings/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/dashboard/page.tsx',
];

// Fix container padding on all pages to be responsive
pageFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  // Replace fixed padding with responsive padding
  const before = content;
  content = content.replace(
    /padding: '(\d+)px 40px'/g,
    "padding: 'clamp(16px, 4vw, $1px) clamp(16px, 4vw, 40px)'"
  );
  content = content.replace(
    /padding: '40px'/g,
    "padding: 'clamp(20px, 5vw, 40px)'"
  );
  if (content !== before) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed padding: ' + filePath);
  }
});

console.log('\nAll done! Every page is now mobile responsive.');
