const CACHE_NAME = 'turntimer-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// La instalare, preluăm fișierele și le stocăm în cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Se încarcă fișierele în cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Când interceptăm o cerere (fetch), verificăm mai întâi cache-ul
// Asta permite aplicației să se încarce chiar și fără internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Dacă am găsit fișierul în cache, îl returnăm
        if (response) {
          return response;
        }
        
        // Dacă nu e în cache, încercăm să îl luăm de pe rețea
        return fetch(event.request).catch(() => {
             // Dacă rețeaua pică, și cerem index-ul, returnăm pagina principală din cache (fallback)
             if(event.request.mode === 'navigate') {
                 return caches.match('./index.html');
             }
        });
      })
  );
});

// La activare, curățăm cache-urile vechi (dacă actualizezi aplicația)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
