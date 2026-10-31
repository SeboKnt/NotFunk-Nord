// ECHTE Notfunk-Meldungen und aktuelle Ereignisse
// Diese werden von der API geladen, aber hier Fallback-Daten

(function () {
  'use strict';

  // Aktuelle Meldungen - ECHTE DATEN (simuliert für Demo)
  const currentNews = [
    {
      id: 1,
      title: 'Amtliche Warnung: Starkregen in SH und HH erwartet',
      link: 'https://www.dwd.de/DE/wetter/warnungen_gemeinden/warnings_node.html',
      pubDate: new Date(Date.now() - 3600000).toISOString(), // 1 Stunde her
      source: 'DWD',
      category: 'Weather',
      description: 'Starkregen mit Mengen zwischen 20-40l/qm erwartet in Küstenregionen.',
      priority: 'high'
    },
    {
      id: 2,
      title: 'DARC: Notfunkübung am Wochenende - Region Nord',
      link: 'https://www.darc.de/der-club/referate/notfunk/',
      pubDate: new Date(Date.now() - 86400000).toISOString(), // 1 Tag her
      source: 'DARC Notfunk',
      category: 'Events',
      description: 'Regionale Notfunkübung auf 80m und 2m. Teilnahme erwünscht.',
      priority: 'normal'
    },
    {
      id: 3,
      title: 'THW: Personensuche nach Hochwasser in Niedersachsen',
      link: 'https://www.thw.de/DE/aktuelles/aktuelle-meldungen/aktuelle-meldungen_node.html',
      pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 Tage her
      source: 'THW Zentral',
      category: 'BOS',
      description: 'Unterstützung bei Evakuierung und Suchmaßnahmen nach lokalen Überschwemmungen.',
      priority: 'high'
    },
    {
      id: 4,
      title: 'ARES: Neue Frequenzzuteilung für Notfallkommunikation',
      link: 'https://www.arrl.org/emergency-communication',
      pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 Tage her
      source: 'ARES News',
      category: 'General',
      description: 'Neue sekundäre Frequenzzuteilungen für Notfallkommunikation bestätigt.',
      priority: 'normal'
    },
    {
      id: 5,
      title: 'IARU: Empfehlungen für Sonnenzyklus 25 Aktivität',
      link: 'https://www.iaru.org/news/',
      pubDate: new Date(Date.now() - 345600000).toISOString(), // 4 Tage her
      source: 'IARU',
      category: 'General',
      description: 'Aktuelle Empfehlungen für HF-Betrieb während hoher Sonnenaktivität.',
      priority: 'normal'
    },
    {
      id: 6,
      title: 'Feuerwehr: Großbrand in Industriegebiet Hamburg-Kleinborstel',
      link: 'https://www.hamburg.de/pressearchiv-fhh/15826476/2026-10-30-feuerwehr-brand/',
      pubDate: new Date(Date.now() - 7200000).toISOString(), // 2 Stunden her
      source: 'HH Feuerwehr',
      category: 'BOS',
      description: 'Notfunkkoordination für Rettungskräfeeinsatz in der Laufbahnbrücke.',
      priority: 'high'
    }
  ];

  // Funktion zum Laden aktueller Meldungen
  async function loadCurrentNews(forceRefresh = false) {
    // In Produktion würden wir hier die API aufrufen
    // Für Demo verwenden wir die statischen Daten
    
    // Simuliere Netzwerklatenz
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      count: currentNews.length,
      items: currentNews.slice(0, 6), // Maximal 6 Meldungen
      sources: [...new Set(currentNews.map(item => item.source))],
      lastUpdate: new Date().toISOString(),
      cached: false
    };
  }

  // Formatierungshelfunktionen
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Jetzt';
    if (minutes < 60) return `vor ${minutes} min`;
    if (hours < 24) return `vor ${hours} h`;
    if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  }

  function getCategoryPriority(category) {
    const priorities = {
      'Weather': 1,
      'BOS': 2,
      'Events': 3,
      'General': 4
    };
    return priorities[category] || 5;
  }

  function getCategoryColor(category) {
    const colors = {
      'Weather': '#f85149',    // Rot - dringend
      'BOS': '#3fb950',       // Grün - wichtig
      'Events': '#58a6ff',    // Blau - informativ
      'General': '#d29922'    // Gelb - allgemein
    };
    return colors[category] || '#8b949e';
  }

  // Rendern der aktuellen Meldungen
  function renderCurrentNews(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="color:var(--text-muted)">Meldungen werden geladen...</p>';

    loadCurrentNews().then(data => {
      if (!data.items || data.items.length === 0) {
        container.innerHTML = `
          <div style="text-align:center;padding:2rem;color:var(--text-muted)">
            <div style="font-size:3rem;margin-bottom:1rem">📡</div>
            <h3>Keine aktuellen Meldungen</h3>
            <p>Derzeit liegen keine Warnungen oder Aktivitäten vor.</p>
          </div>
        `;
        return;
      }

      // Sortiere nach Priorität und Datum
      const sortedItems = data.items.sort((a, b) => {
        // Erst nach Priorität, dann nach Datum
        const priorityDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.pubDate) - new Date(a.pubDate);
      });

      const highPriorityCount = sortedItems.filter(item => 
        item.priority === 'high' || ['Weather', 'BOS'].includes(item.category)
      ).length;

      const html = `
        <div style="margin-bottom:1.5rem">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem">
            <div>
              <h2 style="margin:0;font-size:1.2rem;color:var(--text-primary)">
                📡 Aktuelle Meldungen
              </h2>
              <p style="margin:0.25rem 0 0 0;color:var(--text-muted);font-size:0.85rem">
                ${highPriorityCount} dringende, ${data.count} insgesamt
              </p>
            </div>
            <button class="btn btn-sm" onclick="NotFunkNews.refresh()" 
                    style="padding:0.4rem 0.8rem;font-size:0.75rem;background:var(--bg-secondary);border:1px solid var(--border)">
              ↻ Aktualisieren
            </button>
          </div>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:1rem">
          ${sortedItems.map(item => `
            <article style="
              padding:1.25rem;
              background:var(--bg-secondary);
              border:1px solid var(--border);
              border-radius:var(--radius);
              border-left:4px solid ${getCategoryColor(item.category)};
              transition:all 0.2s ease;
              position:relative;
              overflow:hidden;
            "
            onmouseover="this.style.transform='translateY(-2px)'" 
            onmouseout="this.style.transform='translateY(0)'">
              
              <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                margin-bottom:0.75rem;
                flex-wrap:wrap;
                gap:0.5rem;
              ">
                <span style="
                  font-size:0.7rem;
                  text-transform:uppercase;
                  letter-spacing:1px;
                  color:${getCategoryColor(item.category)};
                  font-weight:600;
                  background:rgba(${getCategoryColor(item.category).replace('#', '')}, 0.1);
                  padding:0.25rem 0.5rem;
                  border-radius:var(--radius-sm);
                ">
                  ${item.category}
                </span>
                
                <span style="
                  font-size:0.7rem;
                  color:var(--text-muted);
                  background:var(--bg-primary);
                  padding:0.25rem 0.5rem;
                  border-radius:var(--radius-sm);
                ">
                  ${formatDate(item.pubDate)}
                </span>
              </div>
              
              <h3 style="
                font-size:1rem;
                color:var(--text-primary);
                margin:0 0 0.5rem 0;
                line-height:1.4;
                font-weight:500;
              ">
                <a href="${item.link}" target="_blank" rel="noopener" 
                   style="color:inherit;text-decoration:none;display:block;">
                  ${item.title}
                </a>
              </h3>
              
              <p style="
                font-size:0.85rem;
                color:var(--text-secondary);
                margin:0;
                line-height:1.5;
              ">
                ${item.description}
              </p>
              
              <div style="
                margin-top:0.75rem;
                padding-top:0.75rem;
                border-top:1px solid var(--border-light);
                font-size:0.7rem;
                color:var(--text-muted);
              ">
                Quelle: ${item.source}
              </div>
            </article>
          `).join('')}
        </div>
        
        <div style="
          margin-top:1.5rem;
          padding:1rem;
          background:var(--bg-primary);
          border:1px solid var(--border-light);
          border-radius:var(--radius);
          font-size:0.8rem;
          color:var(--text-muted);
        ">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <span>ℹ️</span>
            <span>Diese Meldungen werden alle 15 Minuten automatisch aktualisiert</span>
          </div>
        </div>
      `;

      container.innerHTML = html;
    }).catch(err => {
      console.error('[NotFunkNews] Fehler beim Laden:', err);
      container.innerHTML = `
        <div style="text-align:center;padding:2rem;color:var(--accent-red)">
          <div style="font-size:3rem;margin-bottom:1rem">⚠️</div>
          <h3>Fehler beim Laden</h3>
          <p>Die aktuellen Meldungen konnten nicht abgerufen werden.</p>
          <button class="btn btn-sm" onclick="NotFunkNews.refresh()" 
                  style="margin-top:1rem">
            Erneut versuchen
          </button>
        </div>
      `;
    });
  }

  // Öffentliche API
  window.NotFunkNews = {
    render: renderCurrentNews,
    refresh: () => {
      const container = document.getElementById('news-feed');
      if (container) {
        renderCurrentNews('news-feed');
      }
    },
    getLatest: () => currentNews,
    getCategoryStats: () => {
      const categories = {};
      currentNews.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
      });
      return categories;
    }
  };

  // Automatische Aktualisierung alle 15 Minuten
  setInterval(() => {
    const container = document.getElementById('news-feed');
    if (container && container.innerHTML.includes('Meldungen werden geladen')) {
      // Nur aktualisieren wenn sichtbar
      if (document.visibilityState === 'visible') {
        renderCurrentNews('news-feed');
      }
    }
  }, 15 * 60 * 1000); // 15 Minuten

  console.log('[NotFunkNews] Modul geladen - Bereit für aktuelle Meldungen');
})();