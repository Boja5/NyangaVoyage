const fs = require('fs');

let content = fs.readFileSync('app/checkout/page.tsx', 'utf8');
content = content.replace(
  "phone.trim().replace(/^(\\+237|237)/, '')",
  "phone.trim().replace(/^(\\+?237)/, '')"
);
fs.writeFileSync('app/checkout/page.tsx', content, 'utf8');
console.log('Fixed regex in checkout page');
