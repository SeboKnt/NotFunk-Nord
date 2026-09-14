// Map page logic

const stations = [
  { id: 1, name: 'DARC Notfunkzentrum', type: 'net', lat: 53.55, lon: 10.00, freq: '3573 kHz', desc: 'Norddeutsches Notfunknetz', grid: 'JO43' },
  { id: 2, name: 'Ham-Net Nord', type: 'net', lat: 53.00, lon: 8.50, freq: '3973 kHz', desc: 'Ham-Net Notrufkanal', grid: 'JO33' },
  { id: 3, name: 'DARC Landesverband Hamburg', type: 'station', lat: 53.55, lon: 9.99, freq: '14095 kHz', desc: 'DARC Notfunkdienst', grid: 'JO43' },
  { id: 4, name: 'THW Funkgruppe Nord', type: 'station', lat: 54.32, lon: 10.13, freq: '3573 kHz', desc: 'THW Kommunikationsgruppe', grid: 'JO44' },
  { id: 5, name: 'ARES Nord', type: 'net', lat: 53.07, lon: 8.80, freq: '21350 kHz', desc: 'Emergency Service Netz', grid: 'JO33' },
  { id: 6, name: 'Relais Hamburg', type: 'relay', lat: 53.55, lon: 10.00, freq: '145.500 MHz', desc: 'FM RelaisStation', grid: 'JO43' },
  { id: 7, name: 'Relais Bremen', type: 'relay', lat: 53.08, lon: 8.81, freq: '145.525 MHz', desc: 'FM RelaisStation', grid: 'JO33' },
  { id: 8, name: 'Relais Kiel', type: 'relay', lat: 54.32, lon: 10.13, freq: '145.550 MHz', desc: 'FM RelaisStation', grid: 'JO44' },
  { id: 9, name: 'Notfunk-Team Wuppertal', type: 'station', lat: 51.26, lon: 7.18, freq: '7085 kHz', desc: 'Regionales Notfunkteam', grid: 'JO40' },
  { id: 10, name: 'Notfunk Ruhr', type: 'net', lat: 51.48, lon: 7.22, freq: '14180 kHz', desc: 'Ruhrgebiet Notfunknetz', grid: 'JO40' },
  { id: 11, name: 'DRK HF-Net Berlin', type: 'station', lat: 52.52, lon: 13.40, freq: '3573 kHz', desc: 'DRK Bundesgateway', grid: 'JO62' },
  { id: 12, name: 'Relais München', type: 'relay', lat: 48.14, lon: 11.58, freq: '145.500 MHz', desc: 'FM RelaisStation', grid: 'JO48' },
  { id: 13, name: 'Relais Frankfurt', type: 'relay', lat: 50.11, lon: 8.68, freq: '145.525 MHz', desc: 'FM RelaisStation', grid: 'JO40' },
  { id: 14, name: 'Intarmor Seefunk', type: 'station', lat: 53.55, lon: 9.99, freq: '144.260 MHz', desc: 'Amateur-Seefunk', grid: 'JO43' },
];

const svgPoints = document.getElementById('map-points');
const stationList = document.getElementById('station-list');
let currentMapFilter = 'all';

// Convert lat/lon to SVG coordinates
function coordsToSvg(lat, lon) {
  // Simplified projection for Germany
  const x = ((lon + 6) / 20) * 400 + 50;
  const y = ((55 - lat) / 12) * 300 + 50;
  return { x, y };
}

function renderMap(filter = 'all') {
  if (!svgPoints) return;

  const filtered = filter === 'all' ? stations : stations.filter(s => s.type === filter);

  svgPoints.innerHTML = filtered.map(s => {
    const { x, y } = coordsToSvg(s.lat, s.lon);
    const colorClass = `map-point-${s.type}`;
    return `
      <g class="map-point-group" data-id="${s.id}" onclick="selectStation(${s.id})">
        <circle cx="${x}" cy="${y}" r="6" class="${colorClass} map-point" />
        <circle cx="${x}" cy="${y}" r="12" class="map-point-ring" />
        <text x="${x}" y="${y - 10}" fill="var(--text-dim)" font-size="8" text-anchor="middle" font-family="monospace">${s.grid}</text>
      </g>
    `;
  }).join('');

  renderStationList(filtered);
}

function renderStationList(list) {
  if (!stationList) return;
  stationList.innerHTML = list.map(s => `
    <div class="station-item" onclick="selectStation(${s.id})">
      <span class="station-name">${s.name}</span>
      <span class="station-type type-${s.type}">${s.type}</span>
      <div class="station-detail">${s.freq} | ${s.desc}</div>
    </div>
  `).join('');
}

function selectStation(id) {
  const s = stations.find(st => st.id === id);
  if (!s) return;

  // Highlight on map
  document.querySelectorAll('.map-point-group').forEach(g => {
    g.style.opacity = g.dataset.id == id ? '1' : '0.3';
  });

  // Show details
  const { x, y } = coordsToSvg(s.lat, s.lon);
  alert(`${s.name}\n\nGrid: ${s.grid}\nFreq: ${s.freq}\n${s.desc}`);
}

function filterMap(type, btn) {
  currentMapFilter = type;
  document.querySelectorAll('.map-controls .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMap(type);
}

function locateOnMap() {
  const locator = document.getElementById('map-locator-search').value.toUpperCase();
  const resultEl = document.getElementById('map-search-result');

  if (!locator || locator.length < 4) {
    resultEl.textContent = 'Bitte einen gültigen Locator eingeben';
    return;
  }

  try {
    const { center } = fromLocator(locator);
    const { x, y } = coordsToSvg(center.lat, center.lon);

    // Add temporary marker
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    marker.setAttribute('cx', x);
    marker.setAttribute('cy', y);
    marker.setAttribute('r', '8');
    marker.setAttribute('fill', 'var(--danger)');
    marker.setAttribute('stroke', 'white');
    marker.setAttribute('stroke-width', '2');
    svgPoints.appendChild(marker);

    resultEl.textContent = `Gefunden: ${center.lat.toFixed(2)}°N, ${center.lon.toFixed(2)}°E`;
  } catch (e) {
    resultEl.textContent = 'Ungültiger Locator';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderMap();
});
