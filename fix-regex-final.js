const fs = require('fs');

let content = fs.readFileSync('app/checkout/page.tsx', 'utf8');

// Fix the broken regex
content = content.replace(
  /phone\.trim\(\)\.replace\(\/\^.*?\/,\s*''\)/g,
  "phone.trim().replace(/^0+/, '')"
);

fs.writeFileSync('app/checkout/page.tsx', content, 'utf8');
console.log('Fixed!');

// Verify fix
if (content.includes("replace(/^0+/, '')")) {
  console.log('Regex fix confirmed in file');
} else {
  // Manual fallback - find and show the line
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('replace(') && line.includes('237')) {
      console.log('Found at line ' + (i+1) + ': ' + line.trim());
    }
  });
}
