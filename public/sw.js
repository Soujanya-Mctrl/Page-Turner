const CACHE_NAME = 'pageturner-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.png',
  // Next.js chunks will be cached dynamically
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For HTML requests, try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request) || caches.match('/');
      })
    );
    return;
  }

  // For other assets, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new static assets
        if (fetchResponse.status === 200 && event.request.url.includes('/_next/static/')) {
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      });
    })
  );
});
