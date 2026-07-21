const CACHE_NAME = 'moon-blossom-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/main.js',
  './js/cart.js',
  './js/products.js',
  './data/store.json',
  './data/products.json',
  './data/translations.json',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: always try the live network copy first (so fixes/deploys show
// immediately), and only fall back to the cached copy if the network request
// fails (offline). This prevents a stale/broken cached version from ever
// masking a newer, fixed deploy.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./404.html')))
  );
});
