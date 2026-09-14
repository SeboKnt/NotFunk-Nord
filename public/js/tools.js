// Tools page logic

// QTH Locator
async function calcLocator() {
  const lat = parseFloat(document.getElementById('lat-input').value);
  const lon = parseFloat(document.getElementById('lon-input').value);
  if (isNaN(lat) || isNaN(lon)) return;

  const locator = toLocator(lat, lon);
  document.getElementById('locator-value').textContent = locator.toUpperCase();
  document.getElementById('locator-location').textContent = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
  document.getElementById('locator-result').style.display = 'block';
}

async function decodeLocator() {
  const locator = document.getElementById('decode-input').value.toUpperCase();
  try {
    const { corner, center } = fromLocator(locator);
    document.getElementById('decode-corner').textContent =
      `${corner.lat.toFixed(1)}°N, ${corner.lon.toFixed(1)}°E`;
    document.getElementById('decode-center').textContent =
      `${center.lat.toFixed(1)}°N, ${center.lon.toFixed(1)}°E`;
    document.getElementById('decode-result').style.display = 'block';
  } catch (e) {
    alert('Ungültiger Locator');
  }
}

async function calcDistance() {
  const from = document.getElementById('from-grid').value.toUpperCase();
  const to = document.getElementById('to-grid').value.toUpperCase();
  if (!from || !to) return;

  try {
    const a = fromLocator(from).center;
    const b = fromLocator(to).center;
    const km = haversine(a, b);
    const brg = bearing(a, b);

    document.getElementById('dist-km').textContent =
      `${km.toFixed(0)} km (${(km * 0.621).toFixed(0)} mi)`;
    document.getElementById('dist-bearing').textContent =
      `${brg.toFixed(0)}° ${compassDirs[Math.round(brg / 22.5) % 16]}`;
    document.getElementById('distance-result').style.display = 'block';
  } catch (e) {
    alert('Ungültige Locators');
  }
}

// Propagation
async function loadPropagation() {
  const lat = parseFloat(document.getElementById('prop-lat').value);
  const lon = parseFloat(document.getElementById('prop-lon').value);

  try {
    const [propRes, solarRes] = await Promise.all([
      fetch(`/api/propagation/predict?lat=${lat}&lon=${lon}`),
      fetch('/api/solar/flux')
    ]);
    const prop = await propRes.json();
    const solar = await solarRes.json();

    document.getElementById('prop-muf').textContent = `${prop.predictions.muf.toFixed(1)} MHz`;
    document.getElementById('prop-luf').textContent = `${prop.predictions.luf.toFixed(1)} MHz`;
    document.getElementById('prop-fof2').textContent = `${prop.predictions.foF2.toFixed(1)} MHz`;
    document.getElementById('prop-band').textContent = prop.predictions.recommendedBand;
    document.getElementById('prop-cond').textContent = formatCondition(prop.predictions.ionosphericCondition);
  } catch (e) {
    document.getElementById('prop-muf').textContent = 'FEHLER';
  }
}

function formatCondition(cond) {
  const map = {
    'good': 'Gut',
    'moderate': 'Mäßig',
    'poor': 'Schlecht',
    'storm': 'Sturm'
  };
  return map[cond] || cond;
}

// Solar
async function loadSolar() {
  try {
    const res = await fetch('/api/solar/summary');
    const data = await res.json();

    document.getElementById('solar-flux').textContent = `${data.solarFlux} SFU`;
    document.getElementById('solar-kp').textContent = data.kpIndex;
    document.getElementById('solar-xray').textContent = data.xrayClass;
    document.getElementById('solar-a').textContent = data.aIndex;
    document.getElementById('solar-trend').textContent = formatTrend(data.predictedTrend);
    document.getElementById('solar-sunrise').textContent = data.sunTimes.sunrise;
    document.getElementById('solar-sunset').textContent = data.sunTimes.sunset;
  } catch (e) {
    document.getElementById('solar-flux').textContent = 'FEHLER';
  }
}

function formatTrend(trend) {
  const map = {
    'improving': 'Verbessernd',
    'stable': 'Stabil',
    'degrading': 'Verschlechternd'
  };
  return map[trend] || trend;
}

// Logbook
async function loadLogbook() {
  try {
    const res = await fetch('/api/logbook');
    const data = await res.json();
    const tbody = document.getElementById('logbook-tbody');

    if (data.qso.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-dim)">Keine Einträge</td></tr>';
      return;
    }

    tbody.innerHTML = data.qso.map(q => `
      <tr>
        <td>${new Date(q.timestamp).toLocaleString('de-DE')}</td>
        <td class="freq-val">${q.callsign}</td>
        <td>${q.gridLocator || '-'}</td>
        <td>${q.frequency}</td>
        <td><span class="mode-tag">${q.mode}</span></td>
        <td>${q.rstSent}/${q.rstReceived}</td>
      </tr>
    `).join('');
  } catch (e) {
    alert('Fehler beim Laden');
  }
}

function showLogForm() {
  document.getElementById('logbook-form').style.display =
    document.getElementById('logbook-form').style.display === 'none' ? 'block' : 'none';
}

async function saveQSO() {
  const callsign = document.getElementById('log-callsign').value;
  if (!callsign) { alert('Rufzeichen erforderlich'); return; }

  const body = {
    callsign,
    gridLocator: document.getElementById('log-grid').value,
    frequency: Number(document.getElementById('log-freq').value),
    mode: document.getElementById('log-mode').value,
    rstSent: document.getElementById('log-rst-sent').value,
    rstReceived: document.getElementById('log-rst-received').value,
    notes: document.getElementById('log-notes').value
  };

  try {
    const res = await fetch('/api/logbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      showLogForm();
      loadLogbook();
    }
  } catch (e) {
    alert('Fehler beim Speichern');
  }
}

// Nets
async function loadNets() {
  try {
    const [presetRes, listRes] = await Promise.all([
      fetch('/api/net/preset'),
      fetch('/api/net')
    ]);
    const preset = await presetRes.json();
    const list = await listRes.json();

    const allNets = [...list.nets, ...preset.presetNets.map(n => ({...n, id: 'preset-' + n.name}))];
    const tbody = document.getElementById('nets-tbody');

    tbody.innerHTML = allNets.map(n => `
      <tr>
        <td class="freq-val">${n.name}</td>
        <td>${n.frequency}</td>
        <td><span class="mode-tag">${n.mode}</span></td>
        <td>${n.schedule}</td>
        <td>${n.description}</td>
        <td><button class="btn" style="padding:0.3rem 0.6rem; font-size:0.7rem" onclick="checkinNet('${n.id}')">Check-in</button></td>
      </tr>
    `).join('');
  } catch (e) {
    alert('Fehler beim Laden');
  }
}

async function checkinNet(netId) {
  const callsign = prompt('Dein Rufzeichen:');
  if (!callsign) return;

  const grid = prompt('Dein Grid Square (optional):') || '';

  try {
    await fetch(`/api/net/${netId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callsign, gridLocator: grid })
    });
    alert(`Check-in für ${callsign} bestätigt`);
  } catch (e) {
    alert('Fehler beim Check-in');
  }
}
