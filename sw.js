/* Service Worker — cache total para rodar offline (PWA) */
'use strict';
const CACHE = 'quiz-brasil-v7';
const ASSETS = [
  './', './index.html', './style.css', './data.js', './app.js',
  './manifest.json', './favicon.ico', './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const requestUrl = new URL(e.request.url);

  // Imagens externas (bandeiras e escudos): buscar diretamente na origem.
  // Não devolver index.html como se fosse uma imagem quando a rede falhar.
  if (requestUrl.origin !== self.location.origin) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    )
  );
});
