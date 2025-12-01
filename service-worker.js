const CACHE = "pmt-2025-v4";

const FILES = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "manifest.json",
    "icons/logo.png",
    "icons/icon-512.png"
];

// INSTALAR
self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES))
    );
});

// ACTIVAR (limpiar versiones viejas)
self.addEventListener("activate", e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)))
        )
    );
});

// FETCH
self.addEventListener("fetch", e => {

    // ⚠ permitir SIEMPRE que placas.json se descargue online sin bloquearlo
    if (e.request.url.includes("placas.json")) {
        e.respondWith(fetch(e.request));  // <-- siempre respuesta válida
        return;
    }

    // MODO CACHE NORMAL
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request);
        })
    );
});
