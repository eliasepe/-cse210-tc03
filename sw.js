/* Service worker mínimo — PWA-ready (caché básica para evolución offline). */
const CACHE = "mussri-cocina-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./recipes.js",
  "./manifest.webmanifest",
  "./assets/icons/favicon.svg",
  "./assets/logo/doctormussri.jpg",
  "./assets/images/avena-tostada.jpg",
];

self.addEventListener("install", (event) => {
  // Cache best-effort: no bloquea install si algún asset falla (p. ej. file://).
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          ASSETS.map((url) => cache.add(url).catch(() => undefined))
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
