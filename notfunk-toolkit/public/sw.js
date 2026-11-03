// Service Worker für NotFunk-Nord PWA
// Unterstützt Caching, Offline-Funktionalität und Push-Benachrichtigungen

const CACHE_NAME = 'notfunk-nord-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installationsphase - Caches füllen
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[ServiceWorker] Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch-Event - Anfragen abfangen und aus Cache bedienen
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache zuerst, dann Netzwerk
        return response || fetch(event.request);
      })
  );
});

// Aktivierungsphase - alte Caches bereinigen
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push-Benachrichtigungen
self.addEventListener('push', function(event) {
  console.log('[ServiceWorker] Push received');
  
  let data;
  if (event.data) {
    data = event.data.json();
  } else {
    data = {
      title: 'NotFunk-Nord',
      body: 'Neue Informationen verfügbar',
      icon: '/icons/icon-192x192.png'
    };
  }
  
  const title = data.title;
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  // Optional: Zur App navigieren
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Hintergrund-Synchronisation
self.addEventListener('sync', function(event) {
  if (event.tag === 'notfunk-data-sync') {
    event.waitUntil(syncNotfunkData());
  }
});

// Funktion zur Daten-Synchronisation
function syncNotfunkData() {
  console.log('[ServiceWorker] Syncing NotFunk data');
  
  try {
    // Hier könnten z.B. lokale Daten mit dem Server synchronisiert werden
    // Zum Beispiel: Unübermittelte Logbucheinträge senden
    
    // Beispielimplementation:
    // const pendingLogs = await getPendingLogEntries();
    // if (pendingLogs.length > 0) {
    //   await sendLogEntries(pendingLogs);
    //   await clearPendingLogEntries();
    // }
    
    console.log('[ServiceWorker] Data sync completed');
    return Promise.resolve();
  } catch (error) {
    console.error('[ServiceWorker] Data sync failed:', error);
    // Bei Fehler wird Sync später erneut versucht
    return Promise.reject(error);
  }
}

// Type definitions für bessere IDE-Unterstützung
/**
 * @typedef {Object} ExtendableEvent
 * @property {function(Promise)} waitUntil
 */

/**
 * @typedef {Object} FetchEvent
 * @property {Request} request
 * @property {function(Promise|Response)} respondWith
 */

// Service Worker Registration Helper
var ServiceWorkerHelper = {
  /**
   * Register the service worker
   * @returns {Promise<void>}
   */
  register: function() {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('[ServiceWorker] Registered:', registration);
          
          // Background sync registrieren
          if ('sync' in registration) {
            return registration.sync.register('notfunk-data-sync')
              .then(function() {
                console.log('[ServiceWorker] Background sync registered');
              });
          }
        })
        .catch(function(error) {
          console.error('[ServiceWorker] Registration failed:', error);
        });
    } else {
      console.log('[ServiceWorker] Not supported in this browser');
      return Promise.resolve();
    }
  },
  
  /**
   * Request push notification permission
   * @returns {Promise<void>}
   */
  requestPushPermission: function() {
    if ('PushManager' in window) {
      return Notification.requestPermission()
        .then(function(permission) {
          if (permission === 'granted') {
            console.log('[ServiceWorker] Push permission granted');
            
            return navigator.serviceWorker.ready
              .then(function(registration) {
                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: ServiceWorkerHelper.urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
                });
              })
              .then(function(subscription) {
                console.log('[ServiceWorker] Push subscription:', subscription);
                
                // Subscription an Server senden
                // return fetch('/api/push-subscription', {
                //   method: 'POST',
                //   body: JSON.stringify(subscription),
                //   headers: { 'Content-Type': 'application/json' }
                // });
              });
          }
        })
        .catch(function(error) {
          console.error('[ServiceWorker] Push permission request failed:', error);
        });
    } else {
      return Promise.resolve();
    }
  },
  
  /**
   * Convert base64 string to Uint8Array
   * @param {string} base64String
   * @returns {Uint8Array}
   */
  urlBase64ToUint8Array: function(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

// Expose helper to global scope
self.ServiceWorkerHelper = ServiceWorkerHelper;