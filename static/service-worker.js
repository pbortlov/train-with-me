const LEGACY_CACHE_PATTERN = /^train-with-me-v\d+$/;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.mode === "navigate") {
          event.waitUntil(
            caches
              .keys()
              .then((keys) => Promise.all(keys.filter((key) => LEGACY_CACHE_PATTERN.test(key)).map((key) => caches.delete(key)))),
          );
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
