// Map page logic - namespace: AppMap

var AppMap = (function () {
  'use strict';

  var stations = [
    { id: 1, name: 'DARC Notfunkzentrum Hamburg', type: 'net', lat: 53.55, lon: 10.00, freq: '3573 kHz', desc: 'Norddeutsches Notfunknetz SSB', grid: 'JO43' },
    { id: 2, name: 'Ham-Net Nord', type: 'net', lat: 53.00, lon: 8.50, freq: '3973 kHz', desc: 'Ham-Net Notrufkanal', grid: 'JO33' },
    { id: 3, name: 'DARC Landesverband Hamburg', type: 'station', lat: 53.55, lon: 9.99, freq: '14095 kHz', desc: 'DARC Notfunkdienst 20m', grid: 'JO43' },
    { id: 4, name: 'THW Funkgruppe Nord', type: 'station', lat: 54.32, lon: 10.13, freq: '3573 kHz', desc: 'THW Kommunikationsgruppe', grid: 'JO44' },
    { id: 5, name: 'ARES Nord', type: 'net', lat: 53.07, lon: 8.80, freq: '21350 kHz', desc: 'Emergency Service Netz', grid: 'JO33' },
    { id: 6, name: 'Relais Hamburg', type: 'relay', lat: 53.55, lon: 10.00, freq: '145.500 MHz', desc: 'FM Relaisstation Hamburg', grid: 'JO43' },
    { id: 7, name: 'Relais Bremen', type: 'relay', lat: 53.08, lon: 8.81, freq: '145.525 MHz', desc: 'FM Relaisstation Bremen', grid: 'JO33' },
    { id: 8, name: 'Relais Kiel', type: 'relay', lat: 54.32, lon: 10.13, freq: '145.550 MHz', desc: 'FM Relaisstation Kiel', grid: 'JO44' },
    { id: 9, name: 'Notfunk-Team Wuppertal', type: 'station', lat: 51.26, lon: 7.18, freq: '7085 kHz', desc: 'Regionales Notfunkteam', grid: 'JO40' },
    { id: 10, name: 'Notfunk Ruhr', type: 'net', lat: 51.48, lon: 7.22, freq: '14180 kHz', desc: 'Ruhrgebiet Notfunknetz', grid: 'JO40' },
    { id: 11, name: 'DRK HF-Net Berlin', type: 'station', lat: 52.52, lon: 13.40, freq: '3573 kHz', desc: 'DRK Bundesgateway', grid: 'JO62' },
    { id: 12, name: 'Relais München', type: 'relay', lat: 48.14, lon: 11.58, freq: '145.500 MHz', desc: 'FM Relaisstation Munchen', grid: 'JO48' },
    { id: 13, name: 'Relais Frankfurt', type: 'relay', lat: 50.11, lon: 8.68, freq: '145.525 MHz', desc: 'FM Relaisstation Frankfurt', grid: 'JO40' },
    { id: 14, name: 'Intarmor Seefunk', type: 'station', lat: 53.55, lon: 9.99, freq: '144.260 MHz', desc: 'Amateur-Seefunk Hamburg', grid: 'JO43' },
    { id: 15, name: 'Notfunkzentrum Schleswig', type: 'station', lat: 54.50, lon: 9.50, freq: '3573 kHz', desc: 'THW Notfunkstelle SH', grid: 'JO44' },
    { id: 16, name: 'Relais Lubeck', type: 'relay', lat: 53.87, lon: 10.68, freq: '145.550 MHz', desc: 'FM Relaisstation Lübeck', grid: 'JO44' },
    { id: 17, name: 'Relais Osnabruck', type: 'relay', lat: 52.28, lon: 8.05, freq: '145.525 MHz', desc: 'FM Relaisstation Osnabrück', grid: 'JO32' },
    { id: 18, name: 'Notfunk Mainz', type: 'station', lat: 50.00, lon: 8.27, freq: '7085 kHz', desc: 'Rheinland-Pfalz Notfunk', grid: 'JO40' },
  ];

  // SVG viewBox: 500x420
  // Germany approx bounds: lat 47.5-55, lon 5-15
  function coordsToSvg(lat, lon) {
    var x = ((lon - 4) / 12) * 420 + 30;
    var y = ((55.5 - lat) / 9) * 340 + 30;
    return { x: x, y: y };
  }

  var currentFilter = 'all';
  var selectedId = null;

  function typeColor(type) {
    if (type === 'net') return '#58a6ff';
    if (type === 'station') return '#3fb950';
    if (type === 'relay') return '#f0c040';
    return '#8b949e';
  }

  function renderMap(filter) {
    var svgPoints = document.getElementById('map-points');
    var stationList = document.getElementById('station-list');
    if (!svgPoints) return;

    var filtered = filter === 'all' ? stations : stations.filter(function (s) { return s.type === filter; });

    // Render SVG points
    svgPoints.innerHTML = filtered.map(function (s) {
      var c = coordsToSvg(s.lat, s.lon);
      var isSelected = selectedId === s.id;
      var opacity = selectedId !== null && !isSelected ? '0.25' : '1';
      return '<g class="map-point-group" data-id="' + s.id + '" opacity="' + opacity + '" ' +
        'onclick="AppMap.selectStation(' + s.id + ')" ' +
        'onmouseenter="AppMap.showTooltip(event, ' + s.id + ')" ' +
        'onmouseleave="AppMap.hideTooltip()" ' +
        'role="button" tabindex="0" aria-label="' + s.name + '">' +
        '<circle cx="' + c.x + '" cy="' + c.y + '" r="6" fill="' + typeColor(s.type) + '" class="map-point" stroke="#0d1117" stroke-width="1.5"/>' +
        (isSelected ? '<circle cx="' + c.x + '" cy="' + c.y + '" r="10" fill="none" stroke="' + typeColor(s.type) + '" stroke-width="1.5" opacity="0.6"/>' : '') +
        '<text x="' + c.x + '" y="' + (c.y - 10) + '" fill="#8b949e" font-size="9" text-anchor="middle" font-family="monospace" pointer-events="none">' + s.grid + '</text>' +
      '</g>';
    }).join('');

    // Render sidebar list
    if (stationList) {
      stationList.innerHTML = filtered.map(function (s) {
        var sel = selectedId === s.id ? ' aria-selected="true"' : '';
        return '<div class="station-item"' + sel + ' onclick="AppMap.selectStation(' + s.id + ')" role="button" tabindex="0">' +
          '<span class="station-name">' + s.name +
            '<span class="station-type type-' + s.type + '">' + s.type + '</span>' +
          '</span>' +
          '<div class="station-meta">' + s.freq + ' | ' + s.grid + ' | ' + s.desc + '</div>' +
        '</div>';
      }).join('');
    }
  }

  function selectStation(id) {
    selectedId = selectedId === id ? null : id;
    renderMap(currentFilter);
  }

  function showTooltip(evt, id) {
    var s = stations.find(function (st) { return st.id === id; });
    if (!s) return;
    var tooltip = document.getElementById('map-tooltip');
    if (!tooltip) return;
    var container = document.getElementById('map-container');
    var rect = container.getBoundingClientRect();
    var svgRect = container.querySelector('svg').getBoundingClientRect();

    var c = coordsToSvg(s.lat, s.lon);
    // Convert SVG coords to page coords
    var scaleX = svgRect.width / 500;
    var scaleY = svgRect.height / 420;
    var px = svgRect.left - rect.left + c.x * scaleX;
    var py = svgRect.top - rect.top + c.y * scaleY;

    tooltip.innerHTML = '<strong>' + s.name + '</strong>' +
      'Grid: ' + s.grid + '<br>' +
      'Freq: ' + s.freq + '<br>' +
      s.desc;
    tooltip.style.display = 'block';
    tooltip.style.left = Math.min(px + 12, rect.width - 200) + 'px';
    tooltip.style.top = (py - 10) + 'px';
  }

  function hideTooltip() {
    var tooltip = document.getElementById('map-tooltip');
    if (tooltip) tooltip.style.display = 'none';
  }

  function filterMap(type, btn) {
    currentFilter = type;
    selectedId = null;
    document.querySelectorAll('.map-controls .filter-btn').forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderMap(type);
  }

  function locateOnMap() {
    var locator = document.getElementById('map-locator-search').value.toUpperCase().trim();
    var resultEl = document.getElementById('map-search-result');
    if (!locator || locator.length < 4) {
      resultEl.textContent = 'Bitte einen gültigen Locator eingeben (mind. 4 Zeichen).';
      resultEl.style.color = 'var(--accent-red)';
      return;
    }

    // Use Maidenhead math (same as app.js)
    var loc = locator;
    var lon = (loc.charCodeAt(0) - 65) * 20 - 180;
    var lat = (loc.charCodeAt(1) - 65) * 10 - 90;
    if (loc.length >= 4) {
      lon += parseInt(loc[2], 10) * 2;
      lat += parseInt(loc[3], 10) * 1;
    }
    if (loc.length >= 6) {
      lon += ((loc.charCodeAt(4) - 97) * 5) / 60;
      lat += ((loc.charCodeAt(5) - 97) * 2.5) / 60;
    }

    var centerLat = lat + (loc.length >= 6 ? 1.25 : 0.5);
    var centerLon = lon + (loc.length >= 6 ? 2.5 : 1);

    var c = coordsToSvg(centerLat, centerLon);

    // Add search marker
    var svgPoints = document.getElementById('map-points');
    // Remove previous search marker
    var prev = document.getElementById('search-marker');
    if (prev) prev.remove();

    var marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('id', 'search-marker');
    marker.setAttribute('cx', c.x);
    marker.setAttribute('cy', c.y);
    marker.setAttribute('r', '7');
    marker.setAttribute('fill', 'var(--accent-red)');
    marker.setAttribute('stroke', '#fff');
    marker.setAttribute('stroke-width', '2');
    marker.setAttribute('class', 'map-point');
    svgPoints.appendChild(marker);

    // Add label
    var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', c.x);
    label.setAttribute('y', c.y - 14);
    label.setAttribute('fill', 'var(--accent-red)');
    label.setAttribute('font-size', '10');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-family', 'monospace');
    label.setAttribute('font-weight', 'bold');
    label.textContent = loc.toUpperCase();
    svgPoints.appendChild(label);

    resultEl.textContent = centerLat.toFixed(2) + '°N, ' + centerLon.toFixed(2) + '°E (' + loc.toUpperCase() + ')';
    resultEl.style.color = 'var(--accent-green)';
  }

  // Keyboard support for map points
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      selectedId = null;
      renderMap(currentFilter);
    }
  });

  // Enter key on locator search
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('map-locator-search');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') AppMap.locateOnMap();
      });
    }
    renderMap('all');
  });

  return {
    selectStation: selectStation,
    filterMap: filterMap,
    locateOnMap: locateOnMap
  };
})();
