const CACHE_NAME = 'turntimer-cache-v5';

self.addEventListener('install', event => {
  self.skipWaiting();
});

// Noua strategie: Caută mereu pe internet mai întâi (repară refresh-ul). 
// Folosește memoria (offline) doar dacă internetul e oprit.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Actualizăm memoria offline cu cea mai nouă variantă
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Dacă nu avem internet, luăm din memorie
        return caches.match(event.request).then(cachedResponse => {
           if (cachedResponse) return cachedResponse;
           if (event.request.mode === 'navigate') return caches.match('./index.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});
