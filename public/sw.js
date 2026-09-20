// Minimal service worker — enables "Add to Home Screen" / install prompts.
// Deliberately does NOT cache anything: the app's data (paywall codes,
// AI vendor review, checklist/budget state) must always come from the
// network or localStorage, never a stale cache.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// No-op fetch handler: required by some browsers' installability checks,
// but every request is left to go to the network as normal (no
// event.respondWith call means default browser behavior applies).
self.addEventListener("fetch", () => {});
