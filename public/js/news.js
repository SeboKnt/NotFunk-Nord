// NotFunk-Nord — News Feed Component
// Lädt und rendert aggregierte RSS-News

(function () {
  'use strict';

  const CACHE_DURATION = 15 * 60 * 1000; // 15 Minuten
  let cachedData = null;
  let cacheTime = 0;

  async function loadNews(forceRefresh = false) {
    const now = Date.now();

    // Verwende Cache wenn < 15 Min alt und kein Force-Refresh
    if (!forceRefresh && cachedData && (now - cacheTime) < CACHE_DURATION) {
      return cachedData;
    }

    try {
      const params = new URLSearchParams({ limit: '8' });
      if (forceRefresh) params.set('refresh', '1');

      const res = await fetch('/api/news?' + params.toString());
      if (!res.ok) throw new Error('News fetch failed');

      const data = await res.json();
      cachedData = data;
      cacheTime = now;
      return data;
    } catch (err) {
      console.error('[NF-Nord] News load error:', err);
      // Fallback: Zeige lokale Demo-Daten
      return getFallbackNews();
    }
  }

  function getFallbackNews() {
    return {
      count: 5,
      items: [
        {
          title: 'DARC ruft zu Vorbereitung auf Sommerunwetter-Saison',
          link: '#',
          pubDate: new Date().toISOString(),
          source: 'DARC Notfunk',
          category: 'BOS',
          description: 'Der DARC erinnert an die Wichtigkeit der Notfunk-Vorbereitung.',
        },
        {
          title: 'THW übt Katastrophenfall im Nordwesten',
          link: '#',
          pubDate: new Date(Date.now() - 86400000).toISOString(),
          source: 'THW Infos',
          category: 'BOS',
          description: 'Gemeinsame Übung mit Hilfsorganisationen geplant.',
        },
        {
          title: 'IARU Global SET findet im November statt',
          link: '#',
          pubDate: new Date(Date.now() - 172800000).toISOString(),
          source: 'ARRL News',
          category: 'General',
          description: 'Jahrerlicher weltweiter Notfunktest angekündigt.',
        },
      ],
      sources: ['DARC Notfunk', 'THW Infos', 'ARRL News'],
      lastUpdate: new Date().toISOString(),
      cached: false,
    };
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Gerade eben';
    if (hours < 24) return `vor ${hours}h`;
    if (days < 7) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
    return date.toLocaleDateString('de-DE');
  }

  function getCategoryColor(category) {
    const colors = {
      BOS: 'var(--accent-red)',
      Weather: 'var(--accent-blue)',
      Events: 'var(--accent-green)',
      General: 'var(--accent-amber)',
    };
    return colors[category] || 'var(--text-secondary)';
  }

  function renderNews(containerId, forceRefresh = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="color:var(--text-muted)">Lädt...</p>';

    loadNews(forceRefresh).then(data => {
      if (!data.items || data.items.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted)">Keine News verfügbar</p>';
        return;
      }

      const html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span style="font-size:0.75rem;color:var(--text-muted)">${data.count} Meldungen</span>
          <button class="btn btn-sm" onclick="AppNews.refresh()" style="padding:0.3rem 0.6rem;font-size:0.7rem">
            Aktualisieren
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          ${data.items.map(item => `
            <article style="padding:1rem;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius);border-left:3px solid ${getCategoryColor(item.category)}">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;gap:0.5rem">
                <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:${getCategoryColor(item.category)};font-weight:600">${item.category}</span>
                <span style="font-size:0.7rem;color:var(--text-muted)">${formatDate(item.pubDate)} • ${item.source}</span>
              </div>
              <h3 style="font-size:0.9rem;color:var(--text-primary);margin-bottom:0.5rem;line-height:1.4">
                <a href="${item.link}" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">${item.title}</a>
              </h3>
              ${item.description ? `<p style="font-size:0.8rem;color:var(--text-secondary);margin:0">${item.description}</p>` : ''}
            </article>
          `).join('')}
        </div>
      `;

      container.innerHTML = html;
    }).catch(err => {
      container.innerHTML = '<p style="color:var(--accent-red)">Fehler beim Laden</p>';
    });
  }

  window.AppNews = {
    render: renderNews,
    refresh: () => {
      cachedData = null;
      cacheTime = 0;
      renderNews('news-feed', true);
    }
  };
})();
