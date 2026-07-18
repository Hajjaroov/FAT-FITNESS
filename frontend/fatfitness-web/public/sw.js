// Hand-written service worker (no next-pwa / webpack SW plugins — Turbopack
// has no webpack SW build step). Plain JS, served as-is from /public.
const STATIC_CACHE = "ff-static-v1";
const PAGES_CACHE = "ff-pages-v1";
const CURRENT_CACHES = [STATIC_CACHE, PAGES_CACHE];

const CORE_ASSETS = ["/offline"];

const CACHEABLE_PAGE_PREFIXES = ["/journal"];
const CACHEABLE_PAGE_EXACT = ["/", "/impressum", "/privacy", "/community/guidelines"];

function isCacheablePage(pathname) {
  return (
    CACHEABLE_PAGE_EXACT.includes(pathname) ||
    CACHEABLE_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/photos/") ||
    pathname.startsWith("/icons/")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(PAGES_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      const offline = await caches.match("/offline");
      if (offline) return offline;
    }
    throw error;
  }
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === "navigate") {
      const offline = await caches.match("/offline");
      if (offline) return offline;
    }
    throw error;
  }
}

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Fat Fitness Community", {
      body: payload.body,
      icon: "/icons/icon-192.png",
      data: { conversationId: payload.conversationId },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const conversationId = event.notification.data && event.notification.data.conversationId;
  const targetUrl = conversationId ? `/messages/${conversationId}` : "/messages";

  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of allClients) {
        if (new URL(client.url).pathname === targetUrl && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (isCacheablePage(url.pathname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkOnly(request));
});
