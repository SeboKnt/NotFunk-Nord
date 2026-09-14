// Frequencies page logic - namespace: AppFreq

var AppFreq = (function () {
  'use strict';

  var frequencies = [
    // KW International
    { band: '160m', freq: 1873, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH Notruf' },
    { band: '80m', freq: 3643, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH Notruf' },
    { band: '80m', freq: 3760, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Region 1 Notruf' },
    { band: '60m', freq: 5330.5, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'HAMRAD Notfunk' },
    { band: '40m', freq: 7085, mode: 'LSB', region: 'dach', type: 'notruf', desc: 'D/A/CH Notruf' },
    { band: '40m', freq: 7110, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Region 1 Notruf' },
    { band: '30m', freq: 10138, mode: 'USB', region: 'dach', type: 'notruf', desc: 'D/A/CH Notruf' },
    { band: '20m', freq: 14180, mode: 'USB', region: 'dach', type: 'notruf', desc: 'Deutschland Notruf' },
    { band: '20m', freq: 14300, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit Notruf' },
    { band: '17m', freq: 18160, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit Notruf' },
    { band: '15m', freq: 21360, mode: 'SSB/CW', region: 'intl', type: 'notruf', desc: 'Weltweit Notruf' },
    { band: '10m', freq: 28238, mode: 'USB', region: 'dach', type: 'notruf', desc: 'Deutschland Notruf' },

    // Emergency freqs from backend data
    { band: '80m', freq: 3573, mode: 'SSB', region: 'deutschland', type: 'emergency', desc: 'DARC Notfunknetz 80m' },
    { band: '40m', freq: 7095, mode: 'SSB', region: 'deutschland', type: 'emergency', desc: 'DARC Notfunknetz 40m' },
    { band: '20m', freq: 14095, mode: 'SSB', region: 'deutschland', type: 'emergency', desc: 'DARC Notfunknetz 20m' },
    { band: '80m', freq: 3973, mode: 'SSB', region: 'norden', type: 'emergency', desc: 'Ham-Net Notrufkanal Nord' },
    { band: '80m', freq: 3750, mode: 'SSB', region: 'deutschland', type: 'emergency', desc: 'Mars Net Deutschland' },
    { band: '40m', freq: 3990, mode: 'SSB', region: 'intl', type: 'emergency', desc: 'ARES Net International' },

    // UKW
    { band: '2m', freq: 144.260, mode: 'USB', region: 'intl', type: 'notruf', desc: 'Internationaler Notruf' },
    { band: '2m', freq: 145.500, mode: 'FM', region: 'intl', type: 'notruf', desc: 'Mobil-Anruf S20' },
    { band: '2m', freq: 145.525, mode: 'FM', region: 'intl', type: 'notruf', desc: 'S21 Notrufkanal' },
    { band: '2m', freq: 145.550, mode: 'FM', region: 'intl', type: 'notruf', desc: 'S22 Notrufkanal' },
    { band: '70cm', freq: 433.500, mode: 'FM', region: 'intl', type: 'notruf', desc: 'Internationaler Anruf' },
    { band: '70cm', freq: 434.000, mode: 'FM', region: 'dach', type: 'notruf', desc: 'D/A/CH Anruf' },

    // Internationale Notruf-Frequenzen
    { band: 'MF', freq: 2182, mode: 'USB', region: 'intl', type: 'emergency', desc: 'Intern. Schiffsnotruf' },
    { band: 'VHF', freq: 156.8, mode: 'FM', region: 'intl', type: 'emergency', desc: 'Intern. Seenotruf CH16' },
    { band: 'VHF', freq: 121.5, mode: 'AM', region: 'intl', type: 'emergency', desc: 'Intern. Flugnotruf' },
    { band: 'UHF', freq: 406, mode: 'Digital', region: 'intl', type: 'emergency', desc: 'COSPAS-SARSAT EPIRB' },
    { band: 'VHF', freq: 144.800, mode: 'Digital', region: 'intl', type: 'emergency', desc: 'APRS Notruf Position' },
    { band: '20m', freq: 14095, mode: 'FSQ', region: 'intl', type: 'emergency', desc: 'WINLINK 2000 Digital' },
  ];

  var currentFilter = 'all';

  function fmtFreq(freq) {
    if (freq < 1000) return freq + ' kHz';
    return freq.toFixed(3) + ' MHz';
  }

  function renderFrequencies(filter, search) {
    var container = document.getElementById('frequencies-list');
    if (!container) return;

    var filtered = frequencies;

    if (filter !== 'all') {
      if (filter === 'kw') {
        filtered = filtered.filter(function (f) { return f.freq < 30000; });
      } else if (filter === 'ukw') {
        filtered = filtered.filter(function (f) { return f.freq >= 30000; });
      } else if (filter === 'dach') {
        filtered = filtered.filter(function (f) { return f.region === 'dach'; });
      }
    }

    if (search) {
      var s = search.toLowerCase();
      filtered = filtered.filter(function (f) {
        return f.desc.toLowerCase().indexOf(s) >= 0 ||
               f.mode.toLowerCase().indexOf(s) >= 0 ||
               f.band.toLowerCase().indexOf(s) >= 0 ||
               f.freq.toString().indexOf(s) >= 0 ||
               f.region.toLowerCase().indexOf(s) >= 0;
      });
    }

    // Group by band
    var groups = {};
    filtered.forEach(function (f) {
      if (!groups[f.band]) groups[f.band] = [];
      groups[f.band].push(f);
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div class="card" style="text-align:center; padding:2rem;"><p style="color:var(--text-muted)">Keine Frequenzen gefunden.</p></div>';
      return;
    }

    container.innerHTML = Object.entries(groups).map(function (entry) {
      var band = entry[0];
      var freqs = entry[1];
      return '<div class="freq-group" style="margin-bottom:1.5rem">' +
        '<h3 style="font-size:0.8rem; color:var(--accent-amber); margin-bottom:0.75rem; padding-bottom:0.4rem; border-bottom:1px solid var(--border); text-transform:uppercase; letter-spacing:1px; font-weight:700">' +
          band + ' <span style="font-size:0.65rem; color:var(--text-muted); text-transform:none; letter-spacing:0">' + freqs.length + ' Einträge</span>' +
        '</h3>' +
        '<div class="table-wrap">' +
          '<table>' +
            '<thead><tr>' +
              '<th>Frequenz</th>' +
              '<th>Modus</th>' +
              '<th>Beschreibung</th>' +
              '<th>Region</th>' +
              '<th>Typ</th>' +
            '</tr></thead>' +
            '<tbody>' +
              freqs.map(function (f) {
                var regionTag = f.region === 'intl' ? '<span class="tag">International</span>' :
                                f.region === 'dach' ? '<span class="tag">D/A/CH</span>' :
                                f.region === 'deutschland' ? '<span class="tag">Deutschland</span>' :
                                f.region === 'norden' ? '<span class="tag">Norden</span>' :
                                '<span class="tag">' + f.region + '</span>';
                var typeTag = f.type === 'emergency' ? '<span class="tag tag-emergency">Notruf</span>' :
                              '<span class="tag">Standard</span>';
                return '<tr>' +
                  '<td><span class="freq-val" onclick="AppFreq.copyFreq(this, \'' + f.freq + '\')">' + fmtFreq(f.freq) + '</span></td>' +
                  '<td><span class="mode-tag">' + f.mode + '</span></td>' +
                  '<td style="font-size:0.85rem">' + f.desc + '</td>' +
                  '<td>' + regionTag + '</td>' +
                  '<td>' + typeTag + '</td>' +
                '</tr>';
              }).join('')
            + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function filterByBand(band, btn) {
    currentFilter = band;
    document.querySelectorAll('.filter-btn').forEach(function (b) {
      b.classList.remove('active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    renderFrequencies(band, document.getElementById('search-input').value);
  }

  function filterFrequencies() {
    renderFrequencies(currentFilter, document.getElementById('search-input').value);
  }

  function clearSearch() {
    document.getElementById('search-input').value = '';
    renderFrequencies(currentFilter);
  }

  function copyFreq(el, freq) {
    if (window.copyToClipboard) {
      window.copyToClipboard(freq.toString(), el);
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    renderFrequencies();
  });

  return {
    filterByBand: filterByBand,
    filterFrequencies: filterFrequencies,
    clearSearch: clearSearch,
    copyFreq: copyFreq
  };
})();
