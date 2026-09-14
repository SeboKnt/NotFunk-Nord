// Tools page logic - namespace: AppTools

var AppTools = (function () {
  'use strict';

  // Maidenhead locator functions
  function toLocator(lat, lon, precision) {
    if (precision === void 0) { precision = 6; }
    lat = Math.max(-90, Math.min(90, lat));
    lon = Math.max(-180, Math.min(180, lon));
    var lonAdj = lon + 180;
    var latAdj = lat + 90;
    var result = '';
    var fieldLon = Math.floor(lonAdj / 20);
    var fieldLat = Math.floor(latAdj / 10);
    result += String.fromCharCode(65 + fieldLon) + String.fromCharCode(65 + fieldLat);
    if (precision <= 2) return result;
    var sqLon = Math.floor((lonAdj % 20) / 2);
    var sqLat = Math.floor((latAdj % 10) / 1);
    result += sqLon.toString() + sqLat.toString();
    if (precision <= 4) return result;
    var lonRem = (lonAdj % 2) * 60;
    var latRem = (latAdj % 1) * 60;
    var subLon = Math.floor(lonRem / 5);
    var subLat = Math.floor(latRem / 2.5);
    result += String.fromCharCode(97 + subLon) + String.fromCharCode(97 + subLat);
    return result;
  }

  function fromLocator(locator) {
    var loc = locator.trim().toUpperCase();
    if (loc.length < 4) throw new Error('Mindestens 4 Zeichen erforderlich');
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
    var corner = { lat: lat, lon: lon };
    var center = {
      lat: lat + (loc.length >= 6 ? 1.25 : 0.5),
      lon: lon + (loc.length >= 6 ? 2.5 : 1)
    };
    return { corner: corner, center: center };
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

  function bearing(a, b) {
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var toDeg = function (rad) { return rad * 180 / Math.PI; };
    var dLon = toRad(b.lon - a.lon);
    var y = Math.sin(dLon) * Math.cos(toRad(b.lat));
    var x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
            Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  var compassDirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

  // Grid Square calc
  function calcLocator() {
    var lat = parseFloat(document.getElementById('lat-input').value);
    var lon = parseFloat(document.getElementById('lon-input').value);
    if (isNaN(lat) || isNaN(lon)) { alert('Bitte gultige Koordinaten eingeben'); return; }
    var locator = toLocator(lat, lon);
    document.getElementById('locator-value').textContent = locator.toUpperCase();
    document.getElementById('locator-location').textContent =
      lat.toFixed(2) + '°N, ' + lon.toFixed(2) + '°E';
    document.getElementById('locator-result').style.display = 'block';
  }

  function decodeLocator() {
    var locator = document.getElementById('decode-input').value.toUpperCase();
    try {
      var result = fromLocator(locator);
      document.getElementById('decode-corner').textContent =
        result.corner.lat.toFixed(1) + '°N, ' + result.corner.lon.toFixed(1) + '°E';
      document.getElementById('decode-center').textContent =
        result.center.lat.toFixed(1) + '°N, ' + result.center.lon.toFixed(1) + '°E';
      document.getElementById('decode-result').style.display = 'block';
    } catch (e) {
      alert(e.message || 'Ungultiger Locator');
    }
  }

  function calcDistance() {
    var from = document.getElementById('from-grid').value.toUpperCase();
    var to = document.getElementById('to-grid').value.toUpperCase();
    if (!from || !to) { alert('Bitte beide Grid Square eingeben'); return; }
    try {
      var a = fromLocator(from).center;
      var b = fromLocator(to).center;
      var km = haversine(a, b);
      var brg = bearing(a, b);
      document.getElementById('dist-km').textContent =
        Math.round(km) + ' km (' + (km * 0.621).toFixed(0) + ' mi)';
      document.getElementById('dist-bearing').textContent =
        Math.round(brg) + '° ' + compassDirs[Math.round(brg / 22.5) % 16];
      document.getElementById('distance-result').style.display = 'block';
    } catch (e) {
      alert('Ungultige Locators: ' + e.message);
    }
  }

  function copyResult(id) {
    var text = document.getElementById(id).textContent;
    if (window.copyToClipboard) {
      window.copyToClipboard(text, document.getElementById(id));
    }
  }

  // Propagation
  var conditionLabels = {
    'good': 'Gut',
    'moderate': 'Mässig',
    'poor': 'Schlecht',
    'storm': 'Sturm'
  };

  function loadPropagation() {
    var lat = parseFloat(document.getElementById('prop-lat').value);
    var lon = parseFloat(document.getElementById('prop-lon').value);
    if (isNaN(lat) || isNaN(lon)) { alert('Bitte gultige Koordinaten eingeben'); return; }

    fetch('/api/propagation/predict?lat=' + lat + '&lon=' + lon)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        document.getElementById('prop-muf').textContent = data.predictions.muf.toFixed(1) + ' MHz';
        document.getElementById('prop-luf').textContent = data.predictions.luf.toFixed(1) + ' MHz';
        document.getElementById('prop-fof2').textContent = data.predictions.foF2.toFixed(1) + ' MHz';
        document.getElementById('prop-band').textContent = data.predictions.recommendedBand;
        var cond = conditionLabels[data.predictions.ionosphericCondition] || data.predictions.ionosphericCondition;
        var condEl = document.getElementById('prop-cond');
        condEl.textContent = cond;
        if (data.predictions.ionosphericCondition === 'good') {
          condEl.className = 'result-value green';
        } else if (data.predictions.ionosphericCondition === 'poor') {
          condEl.className = 'result-value red';
        } else {
          condEl.className = 'result-value';
        }
      })
      .catch(function () {
        document.getElementById('prop-muf').textContent = 'FEHLER';
      });
  }

  // Solar
  var trendLabels = {
    'improving': 'Verbessernd',
    'stable': 'Stabil',
    'degrading': 'Verschlechternd'
  };

  function loadSolar() {
    fetch('/api/solar/summary')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        document.getElementById('solar-flux').textContent = data.solarFlux + ' SFU';
        document.getElementById('solar-kp').textContent = data.kpIndex;
        document.getElementById('solar-xray').textContent = data.xrayClass;
        document.getElementById('solar-a').textContent = data.aIndex;
        var trendEl = document.getElementById('solar-trend');
        trendEl.textContent = trendLabels[data.predictedTrend] || data.predictedTrend;
        trendEl.className = 'result-value ' + (data.predictedTrend === 'improving' ? 'green' : data.predictedTrend === 'degrading' ? 'red' : '');
        document.getElementById('solar-sunrise').textContent = data.sunTimes.sunrise;
        document.getElementById('solar-sunset').textContent = data.sunTimes.sunset;
      })
      .catch(function () {
        document.getElementById('solar-flux').textContent = 'FEHLER';
      });
  }

  // Logbook
  function loadLogbook() {
    fetch('/api/logbook')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var tbody = document.getElementById('logbook-tbody');
        if (!data.qso || data.qso.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted)">Keine Einträge vorhanden</td></tr>';
          return;
        }
        tbody.innerHTML = data.qso.map(function (q) {
          var d = new Date(q.timestamp);
          var ds = d.getUTCFullYear() + '-' +
                   String(d.getUTCMonth()+1).padStart(2,'0') + '-' +
                   String(d.getUTCDate()).padStart(2,'0') + ' ' +
                   String(d.getUTCHours()).padStart(2,'0') + ':' +
                   String(d.getUTCMinutes()).padStart(2,'0');
          return '<tr>' +
            '<td style="font-family:var(--font-mono); font-size:0.78rem; color:var(--text-secondary)">' + ds + '</td>' +
            '<td class="freq-val" style="cursor:pointer" onclick="AppTools.copyResult(this)">' + q.callsign + '</td>' +
            '<td>' + (q.gridLocator || '-') + '</td>' +
            '<td style="font-family:var(--font-mono)">' + q.frequency + '</td>' +
            '<td><span class="mode-tag">' + q.mode + '</span></td>' +
            '<td>' + q.rstSent + '/' + q.rstReceived + '</td>' +
          '</tr>';
        }).join('');
      })
      .catch(function () {
        alert('Fehler beim Laden der Logbuch-Daten');
      });
  }

  function showLogForm() {
    var form = document.getElementById('logbook-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }

  function saveQSO() {
    var callsign = document.getElementById('log-callsign').value.trim();
    if (!callsign) { alert('Rufzeichen ist erforderlich'); return; }

    var body = {
      callsign: callsign,
      gridLocator: document.getElementById('log-grid').value.trim().toUpperCase(),
      frequency: Number(document.getElementById('log-freq').value),
      mode: document.getElementById('log-mode').value,
      rstSent: document.getElementById('log-rst-sent').value,
      rstReceived: document.getElementById('log-rst-received').value,
      notes: document.getElementById('log-notes').value.trim()
    };

    fetch('/api/logbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    })
    .then(function () {
      showLogForm();
      // Clear form
      document.getElementById('log-callsign').value = '';
      document.getElementById('log-grid').value = '';
      document.getElementById('log-freq').value = '';
      document.getElementById('log-notes').value = '';
      loadLogbook();
    })
    .catch(function () {
      alert('Fehler beim Speichern des Eintrags');
    });
  }

  // Nets
  function loadNets() {
    Promise.all([
      fetch('/api/net/preset'),
      fetch('/api/net')
    ])
    .then(function (results) {
      return Promise.all(results.map(function (r) { return r.json(); }));
    })
    .then(function (data) {
      var presetNets = data[0].presetNets.map(function (n) {
        return Object.assign({}, n, { id: 'preset-' + n.name });
      });
      var allNets = data[1].nets.concat(presetNets);
      var tbody = document.getElementById('nets-tbody');

      tbody.innerHTML = allNets.map(function (n) {
        return '<tr>' +
          '<td style="font-weight:600; color:var(--text-primary)">' + n.name + '</td>' +
          '<td style="font-family:var(--font-mono); color:var(--accent-blue)">' + n.frequency + '</td>' +
          '<td><span class="mode-tag">' + n.mode + '</span></td>' +
          '<td style="font-size:0.8rem; color:var(--text-secondary)">' + n.schedule + '</td>' +
          '<td style="font-size:0.8rem; color:var(--text-secondary)">' + n.description + '</td>' +
          '<td><button class="btn btn-sm" onclick="AppTools.checkinNet(\'' + n.id + '\')">Check-in</button></td>' +
        '</tr>';
      }).join('');
    })
    .catch(function () {
      alert('Fehler beim Laden der Netze');
    });
  }

  function checkinNet(netId) {
    var callsign = prompt('Dein Rufzeichen:');
    if (!callsign) return;
    var grid = prompt('Dein Grid Square (optional):') || '';

    fetch('/api/net/' + netId + '/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callsign: callsign, gridLocator: grid.toUpperCase() })
    })
    .then(function (res) {
      if (!res.ok) throw new Error('Check-in fehlgeschlagen');
      return res.json();
    })
    .then(function () {
      alert('Check-in für ' + callsign + ' bestätigt');
    })
    .catch(function () {
      alert('Fehler beim Check-in');
    });
  }

  return {
    calcLocator: calcLocator,
    decodeLocator: decodeLocator,
    calcDistance: calcDistance,
    copyResult: copyResult,
    loadPropagation: loadPropagation,
    loadSolar: loadSolar,
    loadLogbook: loadLogbook,
    showLogForm: showLogForm,
    saveQSO: saveQSO,
    loadNets: loadNets,
    checkinNet: checkinNet
  };
})();
