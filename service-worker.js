const CACHE = "pmt-2025";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return c.addAll([
        "./",
        "index.html",
        "styles.css",
        "app.js",
        "placas.json",
        "manifest.webmanifest"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => {
      return resp || fetch(e.request);
    })
  );
});
