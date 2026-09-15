// Map page logic - Leaflet + OpenStreetMap
// Namespace: AppMap

var AppMap = (function () {
  'use strict';

  // --- Station data ---
  var stations = [
    { id: 1,  name: 'DARC Notfunkzentrum Hamburg', type: 'net',    lat: 53.551, lon: 9.994, freq: '3573 kHz', desc: 'Norddeutsches Notfunknetz SSB', grid: 'JO43' },
    { id: 2,  name: 'Ham-Net Nord',                type: 'net',    lat: 53.000, lon: 8.500, freq: '3973 kHz', desc: 'Ham-Net Notrufkanal',            grid: 'JO33' },
    { id: 3,  name: 'DARC Landesverband Hamburg',  type: 'station',lat: 53.551, lon: 9.994, freq: '14095 kHz',desc: 'DARC Notfunkdienst 20m',       grid: 'JO43' },
    { id: 4,  name: 'THW Funkgruppe Nord',         type: 'station',lat: 54.323, lon: 10.134, freq: '3573 kHz', desc: 'THW Kommunikationsgruppe',     grid: 'JO44' },
    { id: 5,  name: 'ARES Nord',                   type: 'net',    lat: 53.070, lon: 8.800, freq: '21350 kHz', desc: 'Emergency Service Netz',       grid: 'JO33' },
    { id: 6,  name: 'Relais Hamburg',              type: 'relay',  lat: 53.551, lon: 9.994, freq: '145.500 MHz', desc: 'FM Relaisstation Hamburg',     grid: 'JO43' },
    { id: 7,  name: 'Relais Bremen',               type: 'relay',  lat: 53.077, lon: 8.801, freq: '145.525 MHz', desc: 'FM Relaisstation Bremen',      grid: 'JO33' },
    { id: 8,  name: 'Relais Kiel',                 type: 'relay',  lat: 54.323, lon: 10.134, freq: '145.550 MHz', desc: 'FM Relaisstation Kiel',        grid: 'JO44' },
    { id: 9,  name: 'Notfunk-Team Wuppertal',      type: 'station',lat: 51.260, lon: 7.170, freq: '7085 kHz',  desc: 'Regionales Notfunkteam',       grid: 'KO51' },
    { id: 10, name: 'Notfunk Ruhr',                type: 'net',    lat: 51.480, lon: 7.220, freq: '14180 kHz', desc: 'Ruhrgebiet Notfunknetz',       grid: 'KO51' },
    { id: 11, name: 'DRK HF-Net Berlin',           type: 'station',lat: 52.520, lon: 13.405, freq: '3573 kHz',  desc: 'DRK Bundesgateway',          grid: 'JO62' },
    { id: 12, name: 'Relais München',              type: 'relay',  lat: 48.135, lon: 11.582, freq: '145.500 MHz', desc: 'FM Relaisstation München',   grid: 'JO48' },
    { id: 13, name: 'Relais Frankfurt',            type: 'relay',  lat: 50.110, lon: 8.682, freq: '145.525 MHz', desc: 'FM Relaisstation Frankfurt', grid: 'JO40' },
    { id: 14, name: 'Intarmor Seefunk',            type: 'station',lat: 53.551, lon: 9.994, freq: '144.260 MHz', desc: 'Amateur-Seefunk Hamburg',    grid: 'JO43' },
    { id: 15, name: 'Notfunkzentrum Schleswig',    type: 'station',lat: 54.488, lon: 9.478, freq: '3573 kHz',  desc: 'THW Notfunkstelle SH',       grid: 'JO44' },
    { id: 16, name: 'Relais Lübeck',               type: 'relay',  lat: 53.867, lon: 10.687, freq: '145.550 MHz', desc: 'FM Relaisstation Lübeck',    grid: 'JO44' },
    { id: 17, name: 'Relais Osnabrück',            type: 'relay',  lat: 52.280, lon: 8.050, freq: '145.525 MHz', desc: 'FM Relaisstation Osnabrück', grid: 'JO32' },
    { id: 18, name: 'Notfunk Mainz',               type: 'station',lat: 50.000, lon: 8.271, freq: '7085 kHz',  desc: 'Rheinland-Pfalz Notfunk',    grid: 'JO40' },
  ];

  // --- Leaflet map instance ---
  var map;
  var markers = {};
  var currentFilter = 'all';
  var selectedId = null;
  var searchMarker = null;
  var loraMarkers = {};
  var distanceMarkerA = null;
  var distanceMarkerB = null;
  var distanceLine = null;

  // --- Custom icon factory (no external images needed) ---
  function makeIcon(color) {
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36">',
        '<path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 23 13 23s13-13.5 13-23C26 5.8 20.2 0 13 0z" fill="' + color + '"/>',
        '<circle cx="13" cy="12" r="5" fill="#0d1117"/>',
      '</svg>'
    ].join('');
    return L.divIcon({
      html: '<img src="data:image/svg+xml;base64,' + btoa(svg) + '" style="width:26px;height:36px;display:block"/>',
      iconSize: [26, 36],
      iconAnchor: [13, 36],
      popupAnchor: [0, -36],
      className: ''
    });
  }


  // --- LoRa-Gateway-Icon (Puls-Animation wenn online) ---
  function makeLoraIcon(online) {
    var color = online ? 'var(--accent-green)' : 'var(--accent-red)';
    var pulse = online
      ? '<circle cx="12" cy="12" r="8" fill="none" stroke="' + color + '" stroke-width="1.5" opacity="0.5"/>'
      : '';
    var svg = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">',
        '<circle cx="12" cy="12" r="10" fill="' + color + '" opacity="0.85"/>',
        pulse,
        '<text x="12" y="16" text-anchor="middle" fill="#0d1117" font-size="10" font-weight="bold">L</text>',
      '</svg>'
    ].join('');
    return L.divIcon({
      html: '<img src="data:image/svg+xml;base64,' + btoa(svg) + '" style="width:24px;height:24px;display:block"/>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
      className: ''
    });
  }

  function typeColor(type) {
    if (type === 'net')    return '#58a6ff';
    if (type === 'station') return '#3fb950';
    if (type === 'relay')  return '#f0c040';
    return '#8b949e';
  }

  function haversine(a, b) {
    var R = 6371;
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var dLat = toRad(b.lat - a.lat);
    var dLon = toRad(b.lon - a.lon);
    var h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function compassDir(deg) {
    var dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return dirs[Math.round(deg / 22.5) % 16];
  }


  // --- Initialisiere die Karte ---
  function initMap() {
    map = L.map('map', {
      center: [53.2, 9.5],
      zoom: 8,
      zoomControl: false,
      attributionControl: true
    });

    // Zoom-Control unten-rechts
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OSM Tiles — dunkles Theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Station-Marker hinzufügen
    renderMarkers(stations);

    // LoRa-Filter-Button zur Filter-Bar hinzufügen
    var filterBar = document.querySelector('.map-controls.filter-bar');
    if (filterBar) {
      var loraBtn = document.createElement('button');
      loraBtn.className = 'filter-btn';
      loraBtn.setAttribute('aria-pressed', 'false');
      loraBtn.textContent = 'LoRa';
      loraBtn.addEventListener('click', function () {
        var show = loraBtn.classList.contains('active');
        if (!show) {
          loraBtn.classList.add('active');
          loraBtn.setAttribute('aria-pressed', 'true');
          renderLoraLayer(true);
        } else {
          loraBtn.classList.remove('active');
          loraBtn.setAttribute('aria-pressed', 'false');
          renderLoraLayer(false);
        }
      });
      filterBar.appendChild(loraBtn);
    }

    // LoRa-Distanz-Input-Listener
    var fromGrid = document.getElementById('lora-from-grid');
    var toGrid = document.getElementById('lora-to-grid');
    function onLoraGridInput() {
      var f = (fromGrid || {}).value.toUpperCase().trim();
      var t = (toGrid || {}).value.toUpperCase().trim();
      if (f && t) {
        calcLoraDistance(f, t);
      }
    }
    if (fromGrid) fromGrid.addEventListener('input', onLoraGridInput);
    if (toGrid) toGrid.addEventListener('input', onLoraGridInput);
  }

  // --- Marker auf der Karte rendern ---
  function renderMarkers(items) {
    // Alte Marker entfernen
    Object.keys(markers).forEach(function (id) {
      if (markers[id]) map.removeLayer(markers[id]);
    });
    markers = {};

    items.forEach(function (s) {
      var color = typeColor(s.type);
      var marker = L.marker([s.lat, s.lon], {
        icon: makeIcon(color)
      }).addTo(map);

      // Popup-Inhalt
      var popupContent =
        '<div style="min-width:180px;font-size:13px;">' +
          '<strong style="color:#f0c040;font-size:14px;">' + s.name + '</strong><br>' +
          '<span style="color:#8b949e;">Grid: ' + s.grid + '</span><br>' +
          '<span style="color:#58a6ff;font-family:monospace;">Freq: ' + s.freq + '</span><br>' +
          '<span style="color:#8b949e;font-size:12px;">' + s.desc + '</span>' +
        '</div>';

      marker.bindPopup(popupContent, { maxWidth: 260 });
      marker.on('click', function () { selectStation(s.id); });
      markers[s.id] = marker;
    });

    // Sidebar aktualisieren
    renderSidebar(items);
  }

  // --- Sidebar rendern ---
  function renderSidebar(items) {
    var list = document.getElementById('station-list');
    if (!list) return;
    list.innerHTML = items.map(function (s) {
      var sel = selectedId === s.id ? ' aria-selected="true"' : '';
      return '<div class="station-item"' + sel +
        ' onclick="AppMap.selectStation(' + s.id + ')" role="button" tabindex="0">' +
        '<span class="station-name">' + s.name +
          '<span class="station-type type-' + s.type + '">' + s.type + '</span>' +
        '</span>' +
        '<div class="station-meta">' + s.freq + ' | ' + s.grid + ' | ' + s.desc + '</div>' +
      '</div>';
    }).join('');
  }

  // --- Station auswählen (Marker + Sidebar) ---
  function selectStation(id) {
    if (selectedId === id) {
      // Deselect: Marker öffnen
      if (markers[id]) {
        markers[id].openPopup();
      }
      selectedId = null;
      renderSidebar(getFiltered());
      return;
    }
    selectedId = id;
    // Alle anderen Marker ausblenden (Opacity)
    Object.keys(markers).forEach(function (key) {
      var m = markers[key];
      if (!m) return;
      var el = m.getElement();
      if (el) {
        el.style.opacity = (parseInt(key) === id) ? '1' : '0.3';
      }
    });
    // Popup öffnen
    if (markers[id]) {
      markers[id].openPopup();
      map.fitBounds(markers[id].getLatLng(), { padding: [80, 80] });
    }
    renderSidebar(getFiltered());
  }

  // --- Filter anwenden ---
  function filterMap(type, btn) {
    currentFilter = type;
    selectedId = null;

    // Filter-Buttons aktualisieren
    document.querySelectorAll('.map-controls .filter-btn').forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');

    // Marker sichtbar/unsichtbar machen
    var filtered = getFiltered();
    var filteredIds = {};
    filtered.forEach(function (s) { filteredIds[s.id] = true; });

    Object.keys(markers).forEach(function (key) {
      var id = parseInt(key);
      var m = markers[key];
      if (!m) return;
      var el = m.getElement();
      if (filteredIds[id]) {
        m.addTo(map);
        if (el) el.style.opacity = '1';
      } else {
        map.removeLayer(m);
      }
    });

    renderSidebar(filtered);
  }


  // --- LoRa-Gateways auf der Karte anzeigen/verstecken (Tasks 3.2 + 3.3) ---
  function renderLoraLayer(show) {
    if (!show) {
      Object.keys(loraMarkers).forEach(function (id) {
        if (loraMarkers[id]) map.removeLayer(loraMarkers[id]);
      });
      loraMarkers = {};
      // Distance line/marker zurücksetzen
      if (distanceLine) { map.removeLayer(distanceLine); distanceLine = null; }
      if (distanceMarkerA) { map.removeLayer(distanceMarkerA); distanceMarkerA = null; }
      if (distanceMarkerB) { map.removeLayer(distanceMarkerB); distanceMarkerB = null; }
      var distEl = document.getElementById('lora-distance-result');
      if (distEl) distEl.textContent = '';
      return;
    }

    // Gateways als Marker zeichnen
    loraGateways.forEach(function (gw) {
      var marker = L.marker([gw.lat, gw.lon], {
        icon: makeLoraIcon(gw.online)
      }).addTo(map);

      var statusText = gw.online ? '<span style="color:#3fb950">● Online</span>' : '<span style="color:#f85149">● Offline</span>';
      var popupContent =
        '<div style="font-size:13px;">' +
          '<strong style="color:#f0c040;">' + gw.name + '</strong><br>' +
          '<span style="color:#8b949e;">SSID: ' + gw.ssid + '</span><br>' +
          '<span style="color:#58a6ff;font-family:monospace;">Freq: ' + gw.freq + '</span><br>' +
          statusText +
        '</div>';
      marker.bindPopup(popupContent, { maxWidth: 220 });

      marker.on('click', function () {
        var fromGrid = document.getElementById('lora-from-grid').value.toUpperCase();
        var toGrid = document.getElementById('lora-to-grid').value.toUpperCase();
        if (fromGrid && toGrid) {
          calcLoraDistance(fromGrid, toGrid);
        }
      });

      loraMarkers[gw.id] = marker;
    });

    // Karte auf alle Gateways zoomen
    var group = L.featureGroup(Object.values(loraMarkers));
    map.fitBounds(group.getBounds().pad(0.1));
  }

  // --- LoRa-Distanz berechnen (Task 3.4) ---
  function calcLoraDistance(fromGrid, toGrid) {
    var a, b;
    try {
      a = decodeLocatorSimple(fromGrid);
      b = decodeLocatorSimple(toGrid);
    } catch (e) {
      var el = document.getElementById('lora-distance-result');
      if (el) el.textContent = 'Ungültige Locator: ' + e.message;
      return;
    }
    var km = haversine(a, b);
    var brg = bearing(a, b);

    // Bestehende Marker/Linie entfernen
    if (distanceLine) { map.removeLayer(distanceLine); }
    if (distanceMarkerA) { map.removeLayer(distanceMarkerA); }
    if (distanceMarkerB) { map.removeLayer(distanceMarkerB); }

    // Punkt A (gelb)
    distanceMarkerA = L.marker([a.lat, a.lon], {
      icon: L.divIcon({
        html: '<div style="width:16px;height:16px;background:#f0c040;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(240,192,64,.8);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: ''
      })
    }).addTo(map).bindPopup('<strong style="color:#f0c040;">' + fromGrid + '</strong><br>' + a.lat.toFixed(4) + ', ' + a.lon.toFixed(4));

    // Punkt B (rot)
    distanceMarkerB = L.marker([b.lat, b.lon], {
      icon: L.divIcon({
        html: '<div style="width:16px;height:16px;background:#58a6ff;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(88,166,255,.8);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: ''
      })
    }).addTo(map).bindPopup('<strong style="color:#58a6ff;">' + toGrid + '</strong><br>' + b.lat.toFixed(4) + ', ' + b.lon.toFixed(4));

    // Verbindungslinie
    distanceLine = L.polyline([[a.lat, a.lon], [b.lat, b.lon]], {
      color: '#f0c040',
      weight: 2,
      dashArray: '8, 6'
    }).addTo(map);

    map.fitBounds(distanceLine.getBounds().pad(0.2));

    var el = document.getElementById('lora-distance-result');
    if (el) {
      el.innerHTML = Math.round(km) + ' km &middot; ' + Math.round(brg) + '° ' + compassDir(brg) +
        ' &middot; <span style="color:#8b949e;font-size:0.75rem;">' + fromGrid + ' &harr; ' + toGrid + '</span>';
    }
  }

  // Einfache Locator-Decodierung (für LoRa-Distanz)
  function decodeLocatorSimple(locator) {
    var loc = locator.trim().toUpperCase();
    if (loc.length < 4) throw new Error('Mindestens 4 Zeichen');
    var lon = (loc.charCodeAt(0) - 65) * 20 - 180;
    var lat = (loc.charCodeAt(1) - 65) * 10 - 90;
    if (loc.length >= 4) { lon += parseInt(loc[2], 10) * 2; lat += parseInt(loc[3], 10) * 1; }
    if (loc.length >= 6) { lon += ((loc.charCodeAt(4) - 97) * 5) / 60; lat += ((loc.charCodeAt(5) - 97) * 2.5) / 60; }
    return { lat: lat + (loc.length >= 6 ? 1.25 : 0.5), lon: lon + (loc.length >= 6 ? 2.5 : 1) };
  }

  // --- Get filtered (erweitert um LoRa) ---
  // ponytail: getFiltered wird jetzt nur für reguläre Stationen verwendet

  function getFiltered() {
    return currentFilter === 'all' ? stations : stations.filter(function (s) { return s.type === currentFilter; });
  }

  // --- Locator-Suche ---
  function locateOnMap() {
    var locator = (document.getElementById('map-locator-search') || {}).value.toUpperCase().trim();
    var resultEl = document.getElementById('map-search-result');
    if (!locator || locator.length < 4) {
      if (resultEl) {
        resultEl.textContent = 'Bitte gültigen Locator eingeben (mind. 4 Zeichen).';
        resultEl.style.color = 'var(--accent-red)';
      }
      return;
    }

    // Maidenhead → Lat/Lon
    var lon = (locator.charCodeAt(0) - 65) * 20 - 180;
    var lat = (locator.charCodeAt(1) - 65) * 10 - 90;
    if (locator.length >= 4) {
      lon += parseInt(locator[2], 10) * 2;
      lat += parseInt(locator[3], 10) * 1;
    }
    if (locator.length >= 6) {
      lon += ((locator.charCodeAt(4) - 97) * 5) / 60;
      lat += ((locator.charCodeAt(5) - 97) * 2.5) / 60;
    }
    var centerLat = lat + (locator.length >= 6 ? 1.25 : 0.5);
    var centerLon = lon + (locator.length >= 6 ? 2.5 : 1);

    // Vorherigen Search-Marker entfernen
    if (searchMarker) { map.removeLayer(searchMarker); searchMarker = null; }

    // Roten Marker setzen
    searchMarker = L.marker([centerLat, centerLon], {
      icon: L.divIcon({
        html: '<div style="width:14px;height:14px;background:var(--accent-red);border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(248,81,73,.8);"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        className: ''
      })
    }).addTo(map);

    searchMarker.bindPopup('<strong style="color:#f0c040;">' + locator + '</strong><br>' +
      centerLat.toFixed(4) + '°N, ' + centerLon.toFixed(4) + '°E')
      .openPopup();

    map.setView([centerLat, centerLon], Math.max(map.getZoom(), 10));

    if (resultEl) {
      resultEl.textContent = centerLat.toFixed(2) + '°N, ' + centerLon.toFixed(2) + '°E (' + locator + ')';
      resultEl.style.color = 'var(--accent-green)';
    }
  }

  // --- Keyboard-Support ---
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      selectedId = null;
      Object.keys(markers).forEach(function (key) {
        var el = markers[key] && markers[key].getElement();
        if (el) el.style.opacity = '1';
      });
      renderSidebar(getFiltered());
    }
  });

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById('map-locator-search');
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') AppMap.locateOnMap();
      });
    }
    initMap();
  });

  // Expose for inline onclick handlers
  window.calcLoraDistance = calcLoraDistance;

  return {
    selectStation: selectStation,
    filterMap: filterMap,
    locateOnMap: locateOnMap,
    renderLoraLayer: renderLoraLayer,
    calcLoraDistance: calcLoraDistance
  };
})();
