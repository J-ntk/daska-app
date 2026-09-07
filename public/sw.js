// Minimal service worker. This app is entirely live-data driven (Supabase),
// so it intentionally does NOT cache pages or API responses — that would
// risk showing stale tasks/projects. Its only job is to satisfy the
// "installable PWA" requirement (Chrome/Android/PWABuilder all require an
// active service worker before they'll offer install / package an APK).

const CACHE_NAME = "planning-app-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});