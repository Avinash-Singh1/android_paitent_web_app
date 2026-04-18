#!/usr/bin/env node
/**
 * Post-build: injects a catch-all route tree into the Angular SSR manifest.
 *
 * Because we skip build-time route discovery (see patch-angular-build.js),
 * the manifest is emitted with `routes: []`.  The SSR runtime treats an empty
 * array as "route tree exists but is empty", so every request falls through
 * unhandled.
 *
 * This script replaces `routes: []` with the route tree that matches
 * `app.routes.server.ts`.  Authenticated routes use RenderMode.Client (1)
 * and all public routes use RenderMode.Server (0) for SSR.
 *
 * Run via:  node scripts/postbuild-manifest.js
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(
  __dirname,
  '..',
  'dist',
  'nectar',
  'server',
  'angular-app-manifest.mjs',
);

if (!fs.existsSync(manifestPath)) {
  console.error('[postbuild] angular-app-manifest.mjs not found – aborting.');
  process.exit(1);
}

let content = fs.readFileSync(manifestPath, 'utf8');

// RenderMode.Server = 0, RenderMode.Client = 1
const routeTree = JSON.stringify([
  { route: '/doctor/**', renderMode: 1 },
  { route: '/hospital/**', renderMode: 1 },
  { route: '/auth/**', renderMode: 1 },
  { route: '/profile/**', renderMode: 1 },
  { route: '/register/**', renderMode: 1 },
  { route: '/appointment-booking', renderMode: 1 },
  { route: '/cancel-booking', renderMode: 1 },
  { route: '/confirm-booking', renderMode: 1 },
  { route: '/reschedule-booking', renderMode: 1 },
  { route: '/appointment-completed', renderMode: 1 },
  { route: '/**', renderMode: 0 },
]);

if (content.includes('routes: [],')) {
  content = content.replace('routes: [],', `routes: ${routeTree},`);
  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('[postbuild] Injected SSR route tree into manifest.');
} else if (content.includes('routes: undefined,')) {
  content = content.replace('routes: undefined,', `routes: ${routeTree},`);
  fs.writeFileSync(manifestPath, content, 'utf8');
  console.log('[postbuild] Injected SSR route tree into manifest.');
} else {
  console.log('[postbuild] routes field not found or already patched – skipping.');
}

// Copy the SSR render worker to the dist server directory
const workerSrc = path.join(__dirname, 'ssr-render-worker.mjs');
const workerDest = path.join(__dirname, '..', 'dist', 'nectar', 'server', 'ssr-render-worker.mjs');
if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, workerDest);
  console.log('[postbuild] Copied ssr-render-worker.mjs to dist/nectar/server/.');
} else {
  console.error('[postbuild] ssr-render-worker.mjs not found in scripts/ – skipping.');
}
