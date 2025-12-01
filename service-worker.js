const CACHE = "pmt-2025-v4";

const FILES = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "icons/logo.png",
    "icons/icon-512.png",
    "manifest.json"
];

// INSTALAR CACHE
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(FILES))
    );
});

// ACTIVAR (limpia versiones viejas)
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
        )
    );
});

// FETCH
self.addEventListener("fetch", e => {

    const url = e.request.url;

    // 🟢 Permitir SIEMPRE descargar placas.json SIN bloquearlo
    if (url.includes("placas.json")) {
        e.respondWith(fetch(e.request));
        return;
    }

    // 🟢 Todo lo demás: cache FIRST
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});
