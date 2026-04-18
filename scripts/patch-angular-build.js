#!/usr/bin/env node
/**
 * Patches @angular/build to skip route discovery during build.
 *
 * Problem: Angular's route extraction spawns a piscina worker that loads all
 * lazy modules through Vite's in-memory module runner.  With 70+ lazy chunks
 * the Vite transport times out (60 s default), causing the build to fail with
 * an opaque "{}" error.
 *
 * Fix: Change `options.prerender = !!options.server` to
 *      `options.prerender = { discoverRoutes: false }` so the worker is never
 *      spawned.  Routes are resolved at runtime instead (first-request penalty
 *      only).
 *
 * Run via:  node scripts/patch-angular-build.js
 * Or add to package.json postinstall.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@angular',
  'build',
  'src',
  'builders',
  'application',
  'options.js',
);

const original = 'options.prerender = !!options.server;';
const patched  = 'options.prerender = { discoverRoutes: false };';

if (!fs.existsSync(filePath)) {
  console.warn('[patch] options.js not found – skipping.');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

if (content.includes(patched)) {
  console.log('[patch] Already patched – nothing to do.');
  process.exit(0);
}

if (!content.includes(original)) {
  console.warn('[patch] Could not find target string – the file may have changed. Skipping.');
  process.exit(0);
}

content = content.replace(original, patched);
fs.writeFileSync(filePath, content, 'utf8');
console.log('[patch] Successfully patched options.js (discoverRoutes: false).');
