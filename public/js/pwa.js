// NotFunk-Nord — PWA Service Worker Registration
(function () {
  'use strict';

  // Nur im Browser registrieren (nicht in Node/Worker-Kontext)
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;

  // Service Worker registrieren
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) {
        console.log('[NF-Nord] Service Worker registriert:', registration.scope);

        // Auf Updates prüfen
        registration.addEventListener('updatefound', function () {
          var newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', function () {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Neue Version verfügbar — optional: User benachrichtigen
              console.log('[NF-Nord] Neue Version verfügbar, wird im Hintergrund geladen');
            }
          });
        });
      })
      .catch(function (error) {
        console.warn('[NF-Nord] Service Worker Registrierung fehlgeschlagen:', error);
      });
  }

  // Online/Offline-Status in der UI aktualisieren
  function updateOnlineStatus() {
    var indicator = document.querySelector('.status-indicator');
    var dot = indicator ? indicator.querySelector('.status-dot') : null;
    var label = indicator ? indicator.querySelector('span:last-child') : null;
    if (!dot || !label) return;
    if (navigator.onLine) {
      dot.style.background = 'var(--accent-green)';
      label.textContent = 'ONLINE';
      label.style.color = '';
    } else {
      dot.style.background = 'var(--accent-red)';
      label.textContent = 'OFFLINE';
      label.style.color = 'var(--accent-red)';
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
})();
