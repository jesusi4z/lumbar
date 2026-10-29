const CACHE_NAME = 'lumbar-l5s1-pwa-v9';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon.svg',
  './img/gym/bird-dog.jpg',
  './img/gym/plancha-lateral.jpg',
  './img/gym/hip-thrust.jpg',
  './img/gym/sentadilla-bulgara.jpg',
  './img/gym/zancada-estatica.jpg',
  './img/gym/extension-cuadriceps.jpg',
  './img/gym/curl-femoral.jpg',
  './img/gym/abductor.jpg',
  './img/gym/aductor.jpg',
  './img/gym/extension-lumbar-45.jpg',
  './img/gym/dominadas.jpg',
  './img/gym/jalon-pecho.jpg',
  './img/gym/remo-pecho-apoyado.jpg',
  './img/gym/pullover-polea.jpg',
  './img/gym/curl-inclinado.jpg',
  './img/gym/curl-scott.jpg',
  './img/gym/curl-martillo.jpg',
  './img/gym/press-mancuernas.jpg',
  './img/gym/flexiones.jpg',
  './img/gym/pec-deck.jpg',
  './img/gym/fondos-paralelas.jpg',
  './img/gym/press-hombros.jpg',
  './img/gym/elevaciones-laterales.jpg',
  './img/gym/pajaros-deltoides.jpg',
  './img/gym/extension-triceps-polea.jpg',
  './img/gym/press-frances.jpg',
  './img/gym/patada-triceps.jpg'
];

self.addEventListener('install', (event) => {
  // Se guarda cada archivo por separado: si falta alguno, el resto se guarda igualmente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Página principal: primero red (para recibir actualizaciones), si no hay conexión se usa la copia guardada
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache same-origin and CDN responses (Tailwind, Google Fonts) so the app works offline
          if (
            networkResponse &&
            (networkResponse.ok || networkResponse.type === 'opaque')
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
