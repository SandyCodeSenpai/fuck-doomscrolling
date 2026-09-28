// Offline: serve from cache instantly, refresh the cache in the background (stale-while-revalidate).
const CACHE = 'fds-v3';
const SHELL = ['./', 'index.html', 'app.js', 'srs.js', 'config.js', 'cards.json', 'manifest.webmanifest', 'icon.svg', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => (r.ok && c.put(e.request, r.clone()), r)).catch(() => hit);
    if (hit) { e.waitUntil(net); return hit; }
    return net;
  }));
});
