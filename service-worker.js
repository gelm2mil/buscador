const CACHE_NAME = "gelm-pmt-2025-v4";

const FILES_TO_CACHE = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "placas.json",
    "manifest.webmanifest",
    "icons/logo.png",
    "icons/icon-512.png"
];

// INSTALACIÓN (descarga todo)
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});

// ACTIVACIÓN (borra cachés viejos)
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    self.clients.claim();
});

// FETCH (modo OFFLINE REAL)
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(resp => {
            return (
                resp ||
                fetch(event.request).then(networkResp => {
                    return networkResp;
                }).catch(() => caches.match("index.html"))
            );
        })
    );
});
