#!/usr/bin/env node
/**
 * scripts/patch-supabase-realtime.js
 *
 * Patches @supabase/realtime-js's httpEndpointURL function to use pure string
 * operations instead of URL class property access (url.protocol / url.pathname /
 * url.href all throw "not implemented" in React Native New Architecture / Hermes JSI).
 *
 * Run automatically as a postinstall step, or manually:
 *   node scripts/patch-supabase-realtime.js
 */
const fs = require('fs');
const path = require('path');

// ── Locate transformers.js via require.resolve (works with pnpm/yarn/npm) ────
let targetFile;

try {
  // require.resolve finds the main entry of @supabase/realtime-js
  const realtimeMain = require.resolve('@supabase/realtime-js', {
    paths: [
      path.resolve(__dirname, '..'),  // apps/mobile
      path.resolve(__dirname, '../../..'),  // workspace root
    ],
  });

  // Walk up until we find the package root (directory containing package.json)
  let dir = path.dirname(realtimeMain);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.name === '@supabase/realtime-js') {
        targetFile = path.join(dir, 'dist/main/lib/transformers.js');
        break;
      }
    }
    dir = path.dirname(dir);
  }
} catch (e) {
  console.warn('[patch-supabase-realtime] require.resolve failed:', e.message);
}

// ── Fallback: check known pnpm virtual store paths ────────────────────────────
if (!targetFile || !fs.existsSync(targetFile)) {
  const root = path.resolve(__dirname, '../../..');
  const pnpmStore = path.join(root, 'node_modules/.pnpm');
  if (fs.existsSync(pnpmStore)) {
    const dirs = fs.readdirSync(pnpmStore).filter(d => d.startsWith('@supabase+realtime-js@'));
    for (const d of dirs) {
      const candidate = path.join(
        pnpmStore, d,
        'node_modules/@supabase/realtime-js/dist/main/lib/transformers.js'
      );
      if (fs.existsSync(candidate)) {
        targetFile = candidate;
        break;
      }
    }
  }
}

if (!targetFile || !fs.existsSync(targetFile)) {
  console.warn('[patch-supabase-realtime] ⚠️  Could not locate transformers.js — skipping patch');
  console.warn('  Tried require.resolve and pnpm virtual store scan.');
  process.exit(0);
}

console.log('[patch-supabase-realtime] Found:', targetFile);

const content = fs.readFileSync(targetFile, 'utf8');

// Check if already patched
if (content.includes('Patched: pure string operations')) {
  console.log('[patch-supabase-realtime] ✅ Already patched — nothing to do');
  process.exit(0);
}

// ── Replace the broken URL-based implementation ───────────────────────────────
const PATCHED_FN = `const httpEndpointURL = (socketUrl) => {
    // Patched: pure string operations to avoid URL.protocol / URL.pathname / URL.href
    // which throw "not implemented" in React Native New Architecture (Hermes JSI).
    const httpUrl = socketUrl.replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:');
    const m = httpUrl.match(/^(https?:\\/\\/[^/]*)(.*)?$/i);
    if (!m) return httpUrl + '/api/broadcast';
    const origin = m[1];
    let pathname = (m[2] || '/')
        .replace(/\\/+$/, '')
        .replace(/\\/socket\\/websocket$/i, '')
        .replace(/\\/socket$/i, '')
        .replace(/\\/websocket$/i, '');
    if (pathname === '' || pathname === '/') {
        return origin + '/api/broadcast';
    }
    return origin + pathname + '/api/broadcast';
};`;

// Use a regex to replace the entire function body regardless of exact whitespace
const patched = content.replace(
  /const httpEndpointURL = \(socketUrl\) => \{[\s\S]*?return wsUrl\.href;\n\};/,
  PATCHED_FN
);

if (patched === content) {
  console.warn('[patch-supabase-realtime] ⚠️  Regex did not match the target function.');
  console.warn('  The version of realtime-js may have changed. Inspect:', targetFile);
  process.exit(0);
}

fs.writeFileSync(targetFile, patched, 'utf8');
console.log('[patch-supabase-realtime] ✅ Successfully patched httpEndpointURL in:', targetFile);
