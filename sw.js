const CACHE = "portal-girimulyo2-shell-v1";
const assets = [
  "./",
  "./index.html",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(assets))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

/**
 * Navigasi (buka/refresh index.html) pakai network-first, supaya versi
 * terbaru dari server selalu diutamakan; cache cuma cadangan saat offline.
 * Aset lain (favicon, logo, ikon, carousel, manifest) tetap cache-first
 * untuk kecepatan & dukungan offline -- TAPI kalau gagal (404/error),
 * jangan simpan hasil gagal itu ke cache, supaya begitu file yang benar
 * di-upload, permintaan berikutnya otomatis ambil versi yang benar.
 */
self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, resClone));
        }
        return res;
      });
    })
  );
});
