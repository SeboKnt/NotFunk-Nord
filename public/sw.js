// NotFunk-Nord — Service Worker (PWA Offline-Fähigkeit)
// Cache-Strategie: Cache-First für statische Assets, Network-First für API-Calls

const CACHE_NAME = 'notfunk-nord-v1';
const RUNTIME_CACHE = 'notfunk-runtime-v1';

// Statische Assets, die beim ersten Besuch gecacht werden
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/tools.html',
  '/frequencies.html',
  '/map.html',
  '/lora.html',
  '/about.html',
  '/css/base.css',
  '/js/app.js',
  '/js/index.js',
  '/js/tools.js',
  '/js/frequencies.js',
  '/js/map.js',
  '/offline.html',
];

// --- Install: Precache statische Assets ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Service Worker sofort aktivieren
  self.skipWaiting();
});

// --- Activate: Alte Caches bereinigen ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Sofort kontrollieren, ob wir andere Tabs steuern sollen
  self.clients.claim();
});

// --- Fetch: Strategie-basiertes Caching ---
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nur GET-Anfragen cachen
  if (request.method !== 'GET') return;

  // API-Calls: Network-First mit Fallback auf Cache
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Alle anderen Ressourcen: Cache-First
  event.respondWith(cacheFirst(request));
});

// --- Cache-First Strategie (statische Assets) ---
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Hintergrund-Update falls verfügbar (stale-while-revalidate)
    fetch(request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
    }).catch(() => { /* ignore */ });
    return cachedResponse;
  }

  // Nicht im Cache: vom Netzwerk laden und cachen
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback auf Offline-Seite bei Netzwerkfehler
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// --- Network-First Strategie (API-Calls) ---
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Erfolgreiche API-Antwort in Runtime-Cache speichern
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback auf gecachte API-Antwort
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Keine Cache: Offline-Fallback
    return new Response(
      JSON.stringify({ error: 'Offline — keine gecachte Antwort verfügbar' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// --- Push-Notifications (optional, für zukünftige Updates) ---
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'NotFunk-Nord Update',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), primaryKey: 1 },
    actions: [
      { action: 'explore', title: 'Anzeigen' },
      { action: 'close', title: 'Schließen' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification('NotFunk-Nord', options)
  );
});

// --- Notification Click ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('https://notfunk-nord.de')
    );
  }
});
