const CACHE = "pmt-2025-v3";

const FILES = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "icons/logo.png",
    "icons/icon-512.png",
    "manifest.json"
];

// INSTALAR
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES))
    );
});

// ACTIVAR (LIMPIA CACHES VIEJOS)
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(k => (k !== CACHE ? caches.delete(k) : null))
            )
        )
    );
});

// FETCH
self.addEventListener("fetch", e => {

    // 🟢 Permitimos que siempre cargue la versión nueva del JSON
    if (e.request.url.includes("placas.json")) {
        return fetch(e.request);
    }

    // 🟢 Cache-first para todo lo demás
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});
