// Frequencies page logic

const frequencies = [
  // KW International
  { band: '160m', freq: 1873, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
  { band: '80m', freq: 3643, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
  { band: '80m', freq: 3760, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Region 1' },
  { band: '60m', freq: 5330.5, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'HAMRAD' },
  { band: '40m', freq: 7085, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
  { band: '40m', freq: 7110, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Region 1' },
  { band: '30m', freq: 10138, mode: 'USB', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
  { band: '20m', freq: 14180, mode: 'USB', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
  { band: '20m', freq: 14300, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit' },
  { band: '17m', freq: 18160, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit' },
  { band: '15m', freq: 21360, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit' },
  { band: '10m', freq: 28238, mode: 'USB', region: 'dach', type: 'notruf', desc: 'Deutschland' },

  // UKW
  { band: '2m', freq: 144.260, mode: 'USB', region: 'intl', type: 'notruf', desc: 'International' },
  { band: '2m', freq: 145.500, mode: 'FM', region: 'intl', type: 'notruf', desc: 'Mobil-Anruf S20' },
  { band: '2m', freq: 145.525, mode: 'FM', region: 'intl', type: 'notruf', desc: 'S21' },
  { band: '2m', freq: 145.550, mode: 'FM', region: 'intl', type: 'notruf', desc: 'S22' },
  { band: '70cm', freq: 433.500, mode: 'FM', region: 'intl', type: 'notruf', desc: 'Internationaler Anruf' },
  { band: '70cm', freq: 434.000, mode: 'FM', region: 'dach', type: 'notruf', desc: 'D/A/CH' },
];

let currentFilter = 'all';

function renderFrequencies(filter = 'all', search = '') {
  const container = document.getElementById('frequencies-list');
  let filtered = frequencies;

  if (filter !== 'all') {
    if (filter === 'kw') filtered = filtered.filter(f => f.freq < 30000);
    else if (filter === 'ukw') filtered = filtered.filter(f => f.freq >= 30000);
    else if (filter === 'dach') filtered = filtered.filter(f => f.region === 'dach');
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(f =>
      f.desc.toLowerCase().includes(s) ||
      f.mode.toLowerCase().includes(s) ||
      f.band.toLowerCase().includes(s) ||
      f.freq.toString().includes(s)
    );
  }

  // Group by band
  const groups = {};
  filtered.forEach(f => {
    if (!groups[f.band]) groups[f.band] = [];
    groups[f.band].push(f);
  });

  container.innerHTML = Object.entries(groups).map(([band, freqs]) => `
    <div class="freq-group">
      <h3>${band}</h3>
      <table>
        <thead>
          <tr>
            <th>Frequenz</th>
            <th>Mode</th>
            <th>Beschreibung</th>
            <th>Region</th>
          </tr>
        </thead>
        <tbody>
          ${freqs.map(f => `
            <tr>
              <td class="freq-val">${f.freq}${f.freq < 1000 ? ' kHz' : ' MHz'}</td>
              <td><span class="mode-tag">${f.mode}</span></td>
              <td>${f.desc}</td>
              <td>
                ${f.region === 'intl' ? '<span class="tag">International</span>' : '<span class="tag">D/A/CH</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function filterByBand(band, btn) {
  currentFilter = band;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFrequencies(band, document.getElementById('search-input').value);
}

function filterFrequencies() {
  renderFrequencies(currentFilter, document.getElementById('search-input').value);
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  renderFrequencies(currentFilter);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderFrequencies();
});
