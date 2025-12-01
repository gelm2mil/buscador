// ===============================
// SERVICE WORKER OFICIAL BUSCADOR 2025 - BY GELM
// ===============================

const CACHE_NAME = "pmt-2025-v4";   // <-- Cambia versión si actualizas
const FILES_TO_CACHE = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "manifest.json",
    "icons/logo.png",
    "icons/icon-512.png"
];

// INSTALAR SERVICE WORKER
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[SW] Instalando caché...");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// ACTIVAR Y LIMPIAR CACHÉS VIEJAS
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log("[SW] Eliminando caché vieja:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// INTERCEPTOR FETCH
self.addEventListener("fetch", event => {

    const url = event.request.url;

    // --------------------------
    // NO CACHEAR EL JSON DE MULTAS
    // --------------------------
    if (url.includes("placas.json")) {
        console.log("[SW] Ignorando placas.json (sin caché)");
        return; // deja que el navegador haga la petición normal
    }

    // OFFLINE: responder desde el caché cuando sea posible
    event.respondWith(
        caches.match(event.request).then(response => {
            return response ||
                fetch(event.request).catch(() => {
                    // Si se desea, aquí puedes poner una página offline
                });
        })
    );
});
