// Index page - loads propagation and solar data for the hero panel

(function () {
  'use strict';

  function fmt(n, dec) {
    return typeof n === 'number' ? n.toFixed(dec || 1) : '--';
  }

  function kpColor(kp) {
    if (kp >= 7) return 'bad';
    if (kp >= 5) return 'warn';
    return 'good';
  }

  function bandColor(band) {
    var hw = ['6m', '10m', '15m', '17m', '20m'];
    return hw.indexOf(band) >= 0 ? 'good' : '';
  }

  async function loadHeroData() {
    try {
      var [propRes, solarRes] = await Promise.all([
        fetch('/api/propagation/status'),
        fetch('/api/solar/summary')
      ]);

      if (!propRes.ok || !solarRes.ok) return;

      var prop = await propRes.json();
      var solar = await solarRes.json();

      // Update MUF panel
      var mufEl = document.getElementById('hero-muf');
      if (mufEl) mufEl.textContent = fmt(prop.predictions.muf);

      // Update KP panel
      var kpEl = document.getElementById('hero-kp');
      var kpPanel = document.getElementById('panel-kp');
      if (kpEl) kpEl.textContent = solar.kpIndex;
      if (kpPanel) {
        kpPanel.className = 'status-panel ' + kpColor(solar.kpIndex);
      }

      // Update Solar Flux panel
      var fluxEl = document.getElementById('hero-flux');
      if (fluxEl) fluxEl.textContent = solar.solarFlux;

      // Update recommended band
      var bandEl = document.getElementById('hero-band');
      var bandPanel = document.getElementById('panel-band');
      if (bandEl) bandEl.textContent = prop.predictions.recommendedBand;
      if (bandPanel) {
        bandPanel.className = 'status-panel recommended ' + (bandColor(prop.predictions.recommendedBand) || '');
      }

    } catch (e) {
      console.error('Failed to load hero data:', e);
    }
  }

  document.addEventListener('DOMContentLoaded', loadHeroData);
})();
