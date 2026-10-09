// Self-destructing Tombstone Service Worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll({ type: 'window' });
    }).then((clients) => {
      clients.forEach((client) => {
        if ('navigate' in client && client.url) {
          client.navigate(client.url);
        }
      });
    })
  );
});

// Pass through all fetch requests directly to network without caching
self.addEventListener('fetch', () => {});
