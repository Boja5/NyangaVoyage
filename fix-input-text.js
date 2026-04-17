const fs = require('fs');

let css = fs.readFileSync('app/globals.css', 'utf8');

// Replace the entire input/select block with a bulletproof version
const oldInputBlock = `.nv-input, .nv-select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--nv-border);
  border-radius: var(--nv-radius-md);
  font-family: var(--nv-font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--nv-gray-900) !important;
  -webkit-text-fill-color: var(--nv-gray-900) !important;
  background-color: var(--nv-bg-surface) !important;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}`;

const newInputBlock = `.nv-input, .nv-select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--nv-border);
  border-radius: var(--nv-radius-md);
  font-family: var(--nv-font-body);
  font-size: 14px;
  font-weight: 400;
  /* Force visible text on ALL browsers including mobile Chrome/Safari/Samsung */
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  opacity: 1 !important;
  background: #ffffff !important;
  background-color: #ffffff !important;
  -webkit-background-clip: padding-box !important;
  background-clip: padding-box !important;
  caret-color: #111827 !important;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
}`;

if (css.includes(oldInputBlock)) {
  css = css.replace(oldInputBlock, newInputBlock);
  console.log('Replaced input block');
} else {
  // Find and replace any existing nv-input block
  css = css.replace(
    /\.nv-input,\s*\.nv-select\s*\{[^}]+\}/,
    newInputBlock
  );
  console.log('Replaced input block via regex');
}

// Also fix the placeholder
const oldPlaceholder = `.nv-input::placeholder {
  color: var(--nv-text-muted);
  -webkit-text-fill-color: var(--nv-text-muted) !important;
}`;

const newPlaceholder = `.nv-input::placeholder {
  color: #9ca3af !important;
  -webkit-text-fill-color: #9ca3af !important;
  opacity: 1 !important;
}
.nv-input::-webkit-input-placeholder { color: #9ca3af !important; opacity: 1 !important; }
.nv-input::-moz-placeholder { color: #9ca3af !important; opacity: 1 !important; }
.nv-input:-ms-input-placeholder { color: #9ca3af !important; opacity: 1 !important; }`;

if (css.includes(oldPlaceholder)) {
  css = css.replace(oldPlaceholder, newPlaceholder);
} else {
  css = css.replace(
    /\.nv-input::placeholder\s*\{[^}]+\}/,
    newPlaceholder
  );
}
console.log('Fixed placeholder styles');

// Fix autofill — this is what makes Chrome mobile show white text on blue background
const oldAutofill = `/* Fix autofill background on mobile Chrome/Safari */
.nv-input:-webkit-autofill,
.nv-input:-webkit-autofill:hover,
.nv-input:-webkit-autofill:focus,
.nv-select:-webkit-autofill {
  -webkit-text-fill-color: var(--nv-gray-900) !important;
  -webkit-box-shadow: 0 0 0px 1000px var(--nv-bg-surface) inset !important;
  box-shadow: 0 0 0px 1000px var(--nv-bg-surface) inset !important;
  caret-color: var(--nv-gray-900) !important;
}`;

const newAutofill = `/* Fix autofill background on ALL mobile browsers */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active,
.nv-input:-webkit-autofill,
.nv-input:-webkit-autofill:hover,
.nv-input:-webkit-autofill:focus,
.nv-input:-webkit-autofill:active,
.nv-select:-webkit-autofill {
  -webkit-text-fill-color: #111827 !important;
  -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
  box-shadow: 0 0 0px 1000px #ffffff inset !important;
  background-color: #ffffff !important;
  color: #111827 !important;
  caret-color: #111827 !important;
  transition: background-color 5000s ease-in-out 0s !important;
}`;

if (css.includes(oldAutofill)) {
  css = css.replace(oldAutofill, newAutofill);
} else {
  // append it
  css = css + '\n' + newAutofill;
}
console.log('Fixed autofill styles');

// Add global input override at the very end to catch any browser overrides
const globalInputFix = `
/* ============================================================
   GLOBAL INPUT TEXT VISIBILITY FIX — All browsers / mobile
   ============================================================ */
input, select, textarea {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  opacity: 1 !important;
  background-color: #ffffff !important;
}
input::placeholder, textarea::placeholder {
  color: #9ca3af !important;
  -webkit-text-fill-color: #9ca3af !important;
  opacity: 1 !important;
}
input:focus, select:focus, textarea:focus {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  background-color: #ffffff !important;
}
/* Samsung Internet / older Android browsers */
input[type="text"],
input[type="tel"],
input[type="email"],
input[type="number"],
input[type="password"],
input[type="date"] {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
}
`;

if (!css.includes('GLOBAL INPUT TEXT VISIBILITY FIX')) {
  css = css + globalInputFix;
  console.log('Added global input fix');
}

fs.writeFileSync('app/globals.css', css, 'utf8');
console.log('\nDone! Input text is now visible on ALL mobile browsers.');
