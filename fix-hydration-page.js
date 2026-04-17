const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// 1. Import useMemo and useEffect if not already there
if (!content.includes('useMemo')) {
  content = content.replace(
    "import { useState } from 'react'",
    "import { useState, useEffect, useMemo } from 'react'"
  );
}

// 2. After the line "const t = T[lang]" add mounted state
if (!content.includes('const [isMounted, setIsMounted]')) {
  content = content.replace(
    'const t = T[lang]',
    `const [isMounted, setIsMounted] = useState(false)
  useEffect(() => { setIsMounted(true) }, [])
  const t = T[isMounted ? lang : 'fr']`
  );
}

fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log('Done: page.tsx hydration fix applied');
