const fs = require('fs');
const filePath = 'app/seats/[id]/page.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Mark seats 1, 2, 3 as booked (driver area + 2 hostess seats)
content = content.replace(
  "status: 'available',\n        locked_until: null,\n        locked_by: null,",
  "status: (i + 1 <= 3) ? 'booked' : 'available',\n        locked_until: null,\n        locked_by: null,"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! Seats 1, 2, 3 are now permanently reserved.');
console.log('Remember to run: DELETE FROM seats; in Supabase SQL editor.');
