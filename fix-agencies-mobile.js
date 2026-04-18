const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf8');

const agenciesMobile = `
/* ---- AGENCIES PAGE ---- */
@media (max-width: 768px) {
  /* Agency cards stack to single column */
  .nv-agencies-grid {
    grid-template-columns: 1fr !important;
  }
  /* Route cards single column */
  .nv-routes-grid {
    grid-template-columns: 1fr !important;
  }
  /* Class cards single column */
  .nv-classes-grid {
    grid-template-columns: 1fr !important;
  }
  /* Train stops wrap nicely */
  .nv-train-stops {
    flex-wrap: wrap !important;
    gap: 6px !important;
  }
  /* Departure time cards */
  .nv-departure-cards {
    flex-direction: column !important;
  }
  /* Sticky mode tabs don't overlap content */
  .nv-mode-tabs-sticky {
    top: 60px !important;
  }
}
`;

if (!css.includes('AGENCIES PAGE')) {
  css = css + agenciesMobile;
  fs.writeFileSync('app/globals.css', css, 'utf8');
  console.log('Added agencies mobile CSS');
}

// Now update the agencies page with explicit classNames on key layout divs
let page = fs.readFileSync('app/agencies/page.tsx', 'utf8');

// Agency cards grid
page = page.replace(
  `style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}`,
  `className="nv-agencies-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}`
);

// Routes grid
page = page.replace(
  `style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '32px' }}`,
  `className="nv-routes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '32px' }}`
);

// Classes grid (bus)
page = page.replace(
  `style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '32px' }}`,
  `className="nv-classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '32px' }}`
);

// Train classes grid
page = page.replace(
  `style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}`,
  `className="nv-classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}`
);

// Departure cards
page = page.replace(
  `style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}`,
  `className="nv-departure-cards" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}`
);

// Train stops
page = page.replace(
  `style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}`,
  `className="nv-train-stops" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}`
);

// Sticky tabs
page = page.replace(
  `style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', position: 'sticky', top: '60px', zIndex: 50 }}`,
  `className="nv-mode-tabs-sticky" style={{ background: 'var(--nv-bg-surface)', borderBottom: '1.5px solid var(--nv-border)', position: 'sticky', top: '60px', zIndex: 50 }}`
);

fs.writeFileSync('app/agencies/page.tsx', page, 'utf8');
console.log('Updated: app/agencies/page.tsx with mobile classNames');
console.log('Done!');
