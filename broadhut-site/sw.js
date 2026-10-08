/* Broadhut service worker: fast repeat visits.
   - Pages: network first (so updates always arrive), cached copy if offline.
   - Images, fonts, CSS: cached, refreshed in the background.
   Bump VERSION to clear old caches. */
const VERSION = 'broadhut-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('tally.so')) return;           // forms always live

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  const isStatic = /\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|css)$/i.test(url.pathname) ||
    ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname) || url.hostname.endsWith('ufs.sh');
  if (isStatic) {
    e.respondWith(
      caches.open(VERSION).then((cache) =>
        cache.match(req).then((hit) => {
          const net = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
          return hit || net;
        })
      )
    );
  }
});
