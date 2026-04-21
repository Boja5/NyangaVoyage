const fs = require('fs');

const filePath = 'app/ticket/[bookingRef]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix all apostrophes inside JSX strings that break the parser
content = content
  .replace(/l'embarquement/g, "l embarquement")
  .replace(/l'accueil/g, "l accueil")
  .replace(/Retour a l'accueil/g, "Retour a l accueil")
  .replace(/Presentez ce billet ou scannez le QR code a l embarquement/g, "Presentez ce billet ou scannez le QR code a l embarquement");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed: app/ticket/[bookingRef]/page.tsx');

// Also fix train ticket just in case
const trainPath = 'app/ticket/train/[bookingRef]/page.tsx';
let trainContent = fs.readFileSync(trainPath, 'utf8');
trainContent = trainContent
  .replace(/l'accueil/g, "l accueil")
  .replace(/Retour a l'accueil/g, "Retour a l accueil")
  .replace(/au controleur Camrail/g, "au controleur Camrail");

fs.writeFileSync(trainPath, trainContent, 'utf8');
console.log('Fixed: app/ticket/train/[bookingRef]/page.tsx');

// Also fix agency scan page
const scanPath = 'app/agency/scan/page.tsx';
let scanContent = fs.readFileSync(scanPath, 'utf8');
scanContent = scanContent
  .replace(/l'embarquement/g, "l embarquement")
  .replace(/Retour a l'accueil/g, "Retour a l accueil");

fs.writeFileSync(scanPath, scanContent, 'utf8');
console.log('Fixed: app/agency/scan/page.tsx');

console.log('All apostrophe errors fixed!');
