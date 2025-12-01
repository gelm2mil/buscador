const CACHE = "pmt-2025-v2";

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE).then(c => {
            return c.addAll([
                "./",
                "index.html",
                "styles.css",
                "app.js",
                "manifest.json"
                // ❌ IMPORTANTÍSIMO:
                // NO colocar "placas.json" aquí.
                // El archivo se carga desde RAW GitHub, no local.
            ]);
        })
    );
});

// ===============================================
//   FETCH: Cache first → fallback a red
// ===============================================
self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(resp => {
            return resp || fetch(e.request);
        })
    );
});
