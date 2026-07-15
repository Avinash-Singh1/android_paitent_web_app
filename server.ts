import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import compression from 'compression';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fork } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Re-export AngularAppEngine so the SSR worker can import it from the built server.mjs
export { AngularAppEngine } from '@angular/ssr';

// Prevent uncaught exceptions from crashing the server
process.on('uncaughtException', () => {});

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

// Enable gzip/brotli compression for all responses
app.use(compression());

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  // Allow camera and microphone for video consultations
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=(self), display-capture=(self)');
  next();
});

// Path to the SSR worker script (copied by postbuild)
const workerScript = resolve(serverDistFolder, 'ssr-render-worker.mjs');

/**
 * Simple LRU cache for SSR-rendered HTML.
 * Avoids forking a new process for recently-rendered pages.
 * Uses stale-while-revalidate: serves stale content instantly while
 * re-rendering in the background.
 */
const SSR_CACHE_MAX = 200;                  // max cached pages
const SSR_CACHE_TTL_MS = 15 * 60 * 1000;   // 15 minutes fresh
const SSR_CACHE_STALE_MS = 60 * 60 * 1000; // 1 hour stale-while-revalidate window

interface CacheEntry {
  html: string;
  status: number;
  headers: Record<string, string>;
  timestamp: number;
  revalidating?: boolean;
}

const ssrCache = new Map<string, CacheEntry>();

function getCacheKey(url: string): string {
  // Strip protocol+host, cache by path+query only
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

function getCachedResponse(url: string): { entry: CacheEntry; stale: boolean } | null {
  const key = getCacheKey(url);
  const entry = ssrCache.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;

  // Beyond stale window — evict
  if (age > SSR_CACHE_STALE_MS) {
    ssrCache.delete(key);
    return null;
  }

  // Move to end (most recently used)
  ssrCache.delete(key);
  ssrCache.set(key, entry);

  // Fresh or stale?
  return { entry, stale: age > SSR_CACHE_TTL_MS };
}

function setCachedResponse(url: string, result: CacheEntry): void {
  const key = getCacheKey(url);
  // Evict oldest if at capacity
  if (ssrCache.size >= SSR_CACHE_MAX) {
    const oldest = ssrCache.keys().next().value;
    if (oldest !== undefined) ssrCache.delete(oldest);
  }
  ssrCache.set(key, result);
}

/**
 * Re-render a page in the background and update the cache.
 * Used for stale-while-revalidate: the user already got the stale page instantly,
 * this refreshes the cache for the next visitor.
 */
function revalidateInBackground(fullUrl: string): void {
  const key = getCacheKey(fullUrl);
  const existing = ssrCache.get(key);
  if (existing?.revalidating) return; // already in progress
  if (existing) existing.revalidating = true;

  renderInWorker(fullUrl, { host: 'localhost' })
    .then((result) => {
      if (!result) return;
      let statusCode = result.status;
      if (result.html?.includes('name="prerender-status-code" content="404"')) {
        statusCode = 404;
      }
      if (statusCode < 500) {
        setCachedResponse(fullUrl, {
          html: result.html,
          status: statusCode,
          headers: result.headers || {},
          timestamp: Date.now(),
        });
      }
    })
    .catch(() => {
      // Revalidation failed — keep stale entry, clear flag
      if (existing) existing.revalidating = false;
    });
}

/**
 * Render a URL in an isolated child process.
 * Each render gets a completely fresh Node.js environment so Angular platform
 * teardown issues don't corrupt state for subsequent requests.
 */
function renderInWorker(
  url: string,
  headers: Record<string, string>
): Promise<{ html: string; status: number; headers: Record<string, string> } | null> {
  return new Promise((resolvePromise, reject) => {
    const child = fork(workerScript, [], {
      env: { ...process.env },
      serialization: 'json',
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    });

    let result: any = null;
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('SSR worker timed out after 20s'));
    }, 20000);

    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.stdout?.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk);
    });

    child.on('message', (msg: any) => {
      if (msg?.ready) {
        // Worker is initialized — send the render request
        child.send({ url, headers });
      } else {
        result = msg;
      }
    });

    child.on('exit', (code) => {
      clearTimeout(timeout);
      if (result) {
        resolvePromise(result);
      } else if (result === null) {
        // Worker returned null — no SSR response for this route
        resolvePromise(null);
      } else {
        reject(new Error(`SSR worker exited with code ${code}: ${stderr.slice(0, 500)}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Proxy /sitemap.xml to the backend API that generates the XML sitemap.
 * robots.txt references https://nectarplus.health/sitemap.xml
 */
app.get('/sitemap.xml', async (_req, res) => {
  const backendUrl = process.env['BACKEND_URL'] || 'http://localhost:8080';
  try {
    const response = await fetch(`${backendUrl}/api/v1/sitemap-xml`);
    if (!response.ok) throw new Error(`Backend returned ${response.status}`);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const body = await response.text();
    res.send(body);
  } catch (err: any) {
    console.error('[Sitemap] Proxy error:', err.message);
    res.status(502).send('<!-- Sitemap temporarily unavailable -->');
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Route-aware fallback title for CSR fallback pages.
 */
function getFallbackTitle(url: string): string {
  const path = url.split('?')[0].replace(/^\/+|\/+$/g, '');
  const segments = path.split('/');

  if (!path || path === '') return 'NectarPlus Health - Find Doctors, Hospitals & Clinics Near You';
  if (path === 'about-us' || path.startsWith('about-us/')) return 'About Us | NectarPlus Health';
  if (path === 'privacy-policy') return 'Privacy Policy | NectarPlus Health';
  if (path === 'terms-conditions') return 'Terms & Conditions | NectarPlus Health';
  if (path === 'contact-us') return 'Contact Us | NectarPlus Health';
  if (segments.includes('treatment')) return 'Treatment Options | NectarPlus Health';
  if (segments.includes('hospital') || segments.includes('hospitals')) return 'Hospital Details | NectarPlus Health';
  if (segments.includes('doctor') || segments.includes('doctors')) return 'Doctor Profile | NectarPlus Health';

  return 'NectarPlus Health - Find Doctors, Hospitals & Clinics Near You';
}

function sendCsrFallback(res: express.Response, url: string, next: express.NextFunction): void {
  const fallbackTitle = getFallbackTitle(url);
  const csrPath = resolve(browserDistFolder, 'index.csr.html');
  const htmlPath = resolve(browserDistFolder, 'index.html');

  try {
    let html = readFileSync(csrPath, 'utf-8');
    if (fallbackTitle) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${fallbackTitle}</title>`);
    }
    res.send(html);
    return;
  } catch {
    // fall through to index.html fallback
  }

  try {
    let html = readFileSync(htmlPath, 'utf-8');
    if (fallbackTitle) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${fallbackTitle}</title>`);
    }
    res.send(html);
  } catch {
    next();
  }
}

/**
 * Handle all other requests by rendering the Angular application.
 * Uses in-memory LRU cache to avoid forking for repeated pages.
 */
app.use('*', async (req, res, next) => {
  try {
    const fullUrl = `${req.protocol}://${req.headers.host}${req.originalUrl}`;

    // Check SSR cache first (skip cache for authenticated requests)
    const hasToken = req.headers.cookie?.includes('token=') || req.headers.authorization;
    if (!hasToken) {
      const cached = getCachedResponse(fullUrl);
      if (cached) {
        const { entry, stale } = cached;
        if (entry.headers) {
          for (const [key, value] of Object.entries(entry.headers)) {
            res.setHeader(key, value);
          }
        }
        res.setHeader('X-SSR-Cache', stale ? 'STALE' : 'HIT');
        if (entry.status === 404) {
          res.setHeader('Cache-Control', 'no-cache, no-store');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
        }
        res.status(entry.status);
        res.send(entry.html);

        // If stale, trigger background re-render for next visitor
        if (stale) {
          revalidateInBackground(fullUrl);
        }
        return;
      }
    }

    const headers: Record<string, string> = {};
    for (const [key, val] of Object.entries(req.headers)) {
      if (typeof val === 'string') headers[key] = val;
    }

    const result = await renderInWorker(fullUrl, headers);

    if (!result) {
      sendCsrFallback(res, req.originalUrl, next);
      return;
    }

    // Set response headers from worker
    if (result.headers) {
      for (const [key, value] of Object.entries(result.headers)) {
        res.setHeader(key, value);
      }
    }

    // Detect 404 pages via meta tag set by Error404Component
    let statusCode = result.status;
    if (result.html && result.html.includes('name="prerender-status-code" content="404"')) {
      statusCode = 404;
    }

    // Cache headers for SSR HTML responses
    if (statusCode === 404) {
      res.setHeader('Cache-Control', 'no-cache, no-store');
    } else {
      // Public pages: 5min browser cache, 1hr CDN/proxy cache, serve stale during revalidation
      res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    }

    // Cache successful SSR responses for anonymous users
    if (!hasToken && statusCode < 500) {
      setCachedResponse(fullUrl, {
        html: result.html,
        status: statusCode,
        headers: result.headers || {},
        timestamp: Date.now(),
      });
    }

    res.setHeader('X-SSR-Cache', 'MISS');
    res.status(statusCode);
    res.send(result.html);
  } catch (err: any) {
    console.error(`[SSR] Error for ${req.originalUrl}:`, err.message);
    sendCsrFallback(res, req.originalUrl, next);
  }
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    warmCache(port);
  });
}

/**
 * Pre-render popular pages on startup so the first real user hits cache.
 * Renders sequentially to avoid overwhelming the machine.
 */
async function warmCache(port: string | number): Promise<void> {
  const pagesToWarm = [
    '/',
    '/delhi/treatment',
    '/delhi/doctors',
    '/delhi/hospitals',
    '/delhi/clinics',
    '/contact-us',
    '/about-us/about',
    '/privacy-policy',
    '/terms-conditions',
    '/medicines',
  ];

  console.log(`[Cache] Warming ${pagesToWarm.length} pages...`);
  const baseUrl = `http://localhost:${port}`;

  for (const path of pagesToWarm) {
    try {
      const url = `${baseUrl}${path}`;
      const start = Date.now();
      const result = await renderInWorker(url, { host: 'localhost' });
      if (result && result.status < 500) {
        let statusCode = result.status;
        if (result.html?.includes('name="prerender-status-code" content="404"')) {
          statusCode = 404;
        }
        setCachedResponse(url, {
          html: result.html,
          status: statusCode,
          headers: result.headers || {},
          timestamp: Date.now(),
        });
        console.log(`[Cache] Warmed ${path} (${Date.now() - start}ms)`);
      }
    } catch (err: any) {
      console.warn(`[Cache] Failed to warm ${path}: ${err.message}`);
    }
  }
  console.log(`[Cache] Warming complete. ${ssrCache.size} pages cached.`);
}

/**
 * Request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);
