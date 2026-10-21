// Minimal offline cache (brief §11: PWA, cache opened modules).
// - navigation and un-hashed files: network-first, cache as offline fallback
// - hashed build assets (assets/*): cache-first, they never change under the same name
// Only successful responses are stored: a 404 cached once (e.g. while a deploy or a domain
// change was propagating) would otherwise be served forever.
// Bump CACHE whenever this policy changes - activation deletes every other cache.
const CACHE = 'usac-simlab-v2';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', './index.html', './usac-logo.png'])));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

const store = (req, res) => {
  // Google Fonts' stylesheet loads without CORS, so its status is unreadable ("opaque")
  if (res.ok || (res.type === 'opaque' && new URL(req.url).host.includes('fonts.g'))) {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy));
  }
  return res;
};

// look only in this version's cache: caches.match() would also search stale caches of older versions
const cached = (req) => caches.open(CACHE).then((c) => c.match(req));

const networkFirst = (req, fallback) =>
  fetch(req).then((r) => store(req, r)).catch(() => cached(req).then((hit) => hit || (fallback && cached(fallback))));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(networkFirst(req, './index.html'));
    return;
  }
  const hashed = url.origin === location.origin && url.pathname.includes('/assets/');
  if (hashed || url.host.includes('fonts.g')) {
    e.respondWith(cached(req).then((hit) => hit || fetch(req).then((r) => store(req, r))));
    return;
  }
  if (url.origin === location.origin) e.respondWith(networkFirst(req));
});
