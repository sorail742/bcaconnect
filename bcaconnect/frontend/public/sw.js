const CACHE_NAME = 'bca-connect-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/App.jsx',
    '/assets/logo.png', // À adapter selon les assets réels
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activation du Service Worker et nettoyage des anciens caches
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
});

// Stratégie de cache : Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    // Ne pas intercepter les requêtes vers d'autres domaines (comme le backend sur le port 5000)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Ne pas cacher les requêtes API (POST/PUT/DELETE/PATCH)
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Mettre à jour le cache pour les GET réussis
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Si le réseau échoue, on retourne la réponse du cache si elle existe,
                // sinon une réponse d'erreur 408 propre (sans faire planter le FetchEvent)
                return cachedResponse || new Response('Network Error', { status: 408 });
            });

            return cachedResponse || fetchPromise;
        })
    );
});
