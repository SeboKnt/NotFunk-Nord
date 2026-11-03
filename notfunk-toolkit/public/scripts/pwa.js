// Client-seitige Initialisierung für PWA-Funktionalität

// Service Worker registrieren
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    ServiceWorkerHelper.register();
  });
}

// Offline-Erkennung
window.addEventListener('online', function() {
  console.log('[PWA] App is online');
  document.body.classList.remove('offline');
});

window.addEventListener('offline', function() {
  console.log('[PWA] App is offline');
  document.body.classList.add('offline');
});

// Installations-Prompt für PWA behandeln
let deferredPrompt;

window.addEventListener('beforeinstallprompt', function(e) {
  console.log('[PWA] Install prompt available');
  
  // Standard-Prompt unterdrücken
  e.preventDefault();
  
  // Prompt für später speichern
  deferredPrompt = e;
  
  // Button im UI anzeigen (Beispiel)
  // showInstallButton();
});

// Funktion zum Triggern der Installation
function installPWA() {
  if (deferredPrompt) {
    // Prompt anzeigen
    deferredPrompt.prompt();
    
    // Auswahl des Users abwarten
    deferredPrompt.userChoice.then(function(choiceResult) {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      deferredPrompt = null;
    });
  }
}

// Share-API nutzen (wenn verfügbar)
function shareContent(title, text, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url
    })
    .then(function() {
      console.log('[PWA] Content shared successfully');
    })
    .catch(function(error) {
      console.log('[PWA] Error sharing content:', error);
    });
  } else {
    console.log('[PWA] Web Share API not supported');
    // Fallback: Clipboard API oder alternatives Teilen
  }
}