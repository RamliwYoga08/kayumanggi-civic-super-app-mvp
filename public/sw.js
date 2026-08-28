const CACHE = 'kayumanggi-shell-v1';
const PRECACHE = ['/manifest.json', '/logo192.png', '/logo512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('kayumanggi-shell-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never cache Supabase, third-party APIs, auth callbacks, or cross-origin data.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('reset-password') && url.search) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match('/')) || Response.error();
      }
    })());
    return;
  }

  const staticDestination = ['script', 'style', 'image', 'font'].includes(request.destination);
  if (!staticDestination) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    }).catch(() => cached);
    return cached || network;
  })());
});
