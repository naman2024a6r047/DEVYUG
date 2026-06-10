// launcher.js
const path = require('path');

console.log('--- DVYUG SINGLE DOMAIN LAUNCHER STARTED ---');

// 1. Configure and boot Express Backend on local port 5000
process.env.PORT = '5000';
console.log('[API] Booting Express API backend on port 5000...');
try {
  require('./backend/dist/index.js');
  console.log('[API] Express API online.');
} catch (err) {
  console.error('[API ERROR] Express failed to initialize:', err);
}

// 2. Configure and boot Next.js Standalone Storefront on Hostinger port
const hostingerPort = process.env.PORT || '3000';
process.env.PORT = hostingerPort;
console.log(`[Storefront] Booting Next.js server on Passenger port ${hostingerPort}...`);
try {
  require('./frontend/server.js');
  console.log('[Storefront] Next.js online.');
} catch (err) {
  console.error('[Storefront ERROR] Next.js standalone failed to initialize:', err);
}
