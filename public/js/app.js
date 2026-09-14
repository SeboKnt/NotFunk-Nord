// Shared utilities for NotFunk-Nord

// Clock
function updateClock() {
  const now = new Date();
  const el = document.getElementById('clock');
  if (el) {
    el.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  }
}
setInterval(updateClock, 1000);
updateClock();

// Maidencodehead Locator functions
function toLocator(lat, lon, precision = 6) {
  lat = Math.max(-90, Math.min(90, lat));
  lon = Math.max(-180, Math.min(180, lon));

  const lonAdj = lon + 180;
  const latAdj = lat + 90;

  let result = '';

  // Field
  const fieldLon = Math.floor(lonAdj / 20);
  const fieldLat = Math.floor(latAdj / 10);
  result += String.fromCharCode(65 + fieldLon) + String.fromCharCode(65 + fieldLat);

  if (precision <= 2) return result;

  // Square
  const sqLon = Math.floor((lonAdj % 20) / 2);
  const sqLat = Math.floor((latAdj % 10) / 1);
  result += sqLon.toString() + sqLat.toString();

  if (precision <= 4) return result;

  // Subsquare
  const lonRem = (lonAdj % 2) * 60;
  const latRem = (latAdj % 1) * 60;
  const subLon = Math.floor(lonRem / 5);
  const subLat = Math.floor(latRem / 2.5);
  result += String.fromCharCode(97 + subLon) + String.fromCharCode(97 + subLat);

  return result;
}

function fromLocator(locator) {
  const loc = locator.trim().toUpperCase();
  if (loc.length < 4) throw new Error('Mindestens 4 Zeichen');

  let lon = (loc.charCodeAt(0) - 65) * 20 - 180;
  let lat = (loc.charCodeAt(1) - 65) * 10 - 90;

  if (loc.length >= 4) {
    lon += parseInt(loc[2], 10) * 2;
    lat += parseInt(loc[3], 10) * 1;
  }

  if (loc.length >= 6) {
    lon += ((loc.charCodeAt(4) - 97) * 5) / 60;
    lat += ((loc.charCodeAt(5) - 97) * 2.5) / 60;
  }

  const corner = { lat, lon };
  const center = {
    lat: lat + (loc.length >= 6 ? 1.25 : 0.5),
    lon: lon + (loc.length >= 6 ? 2.5 : 1)
  };

  return { corner, center };
}

function haversine(a, b) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearing(a, b) {
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;
  const dLon = toRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat));
  const x = Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
            Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

const compassDirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').substring(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Highlight active nav link based on scroll position
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (scrollY >= s.offsetTop - 100) current = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});
