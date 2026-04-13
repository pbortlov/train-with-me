const CACHE_NAME = "train-with-me-v1";
const APP_SHELL = ["./", "./index.html", "./styles.css", "./script.js", "./manifest.json"];
const IS_LOCALHOST = self.location.hostname === "localhost" || self.location.hostname === "127.0.0.1";

self.addEventListener("install", (event) => {
  if (IS_LOCALHOST) {
    return;
  }
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
});

self.addEventListener("fetch", (event) => {
  if (IS_LOCALHOST) {
    return;
  }
  event.respondWith(caches.match(event.request).then((cachedResponse) => cachedResponse || fetch(event.request)));
});
