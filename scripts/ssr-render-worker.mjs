/**
 * SSR Render Worker
 * 
 * Runs in a forked child process. Receives a URL via IPC,
 * renders it using Angular SSR, sends back the HTML, and exits.
 * 
 * This ensures each SSR render gets a completely fresh Node.js environment,
 * avoiding issues with Angular platform teardown corrupting state.
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Dynamically import server.mjs to trigger Angular manifest setup as side effect.
// This also imports AngularAppEngine which we use for rendering.
const serverModule = await import(resolve(__dirname, 'server.mjs'));
const { AngularAppEngine } = serverModule;

// Suppress uncaught exceptions from Angular platform teardown
process.on('uncaughtException', () => {});

const engine = new AngularAppEngine({
  allowedHosts: ['localhost', '.nectarplus.health'],
});

process.on('message', async (msg) => {
  try {
    const { url, headers } = msg;

    const request = new Request(url, {
      method: 'GET',
      headers: new Headers(headers || {}),
    });

    const response = await engine.handle(request);

    if (!response) {
      process.send(null, () => process.exit(0));
      return;
    }

    const html = await response.text();

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    process.send({
      html,
      status: response.status,
      headers: responseHeaders,
    }, () => {
      process.exit(0);
    });
  } catch (err) {
    console.error(`[SSR-WORKER] Error:`, err?.message || err);
    process.send(null, () => process.exit(1));
  }
});

// Signal parent that worker is ready
process.send({ ready: true });
