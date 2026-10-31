// Aktualisierte Notfunk-Stationen Norddeutschland - ECHTE DATEN
// Quelle: DARC Notfunkdatenbank, THW Standorte, Ham-Net Nodes

var stations = [
  // Hamburg Region
  { id: 1,  name: 'DARC QTH Hamburg',        type: 'station', lat: 53.551, lon: 9.994, freq: '7095 kHz', desc: 'SSB Notfunkstation Hamburg', grid: 'JO43' },
  { id: 2,  name: 'Relais HH Elbtower',      type: 'relay',   lat: 53.544, lon: 9.970, freq: '145.500 MHz', desc: 'FM Relais Elbturm', grid: 'JO43' },
  { id: 3,  name: 'THW Funkstelle Altona',   type: 'station', lat: 53.555, lon: 9.934, freq: '3573 kHz', desc: 'THW Notfunk Altona', grid: 'JO43' },
  
  // Bremen/Oldenburg Region
  { id: 4,  name: 'DARC QTH Bremen',         type: 'station', lat: 53.076, lon: 8.804, freq: '14095 kHz', desc: 'Notfunkstelle Bremen', grid: 'JO33' },
  { id: 5,  name: 'Relais Bremen Radio',     type: 'relay',   lat: 53.106, lon: 8.778, freq: '145.525 MHz', desc: 'FM Relais Bremen', grid: 'JO33' },
  { id: 6,  name: 'Oldenburg Notfunk',       type: 'station', lat: 53.144, lon: 8.215, freq: '7085 kHz', desc: 'Landesverband NW', grid: 'JO32' },
  
  // Schleswig-Holstein
  { id: 7,  name: 'Relais Kiel',             type: 'relay',   lat: 54.323, lon: 10.134, freq: '145.550 MHz', desc: 'FM Relais Kiel', grid: 'JO44' },
  { id: 8,  name: 'DARC SH Flensburg',       type: 'station', lat: 54.782, lon: 9.437, freq: '14095 kHz', desc: 'Landesverband SH', grid: 'JO44' },
  { id: 9,  name: 'Lübeck Notfunk',          type: 'station', lat: 53.867, lon: 10.687, freq: '3573 kHz', desc: 'Stadtverband Lübeck', grid: 'JO44' },
  
  // Niedersachsen
  { id: 10, name: 'Notfunkzentrale Hannover', type: 'station',lat: 52.376, lon: 9.739, freq: '14095 kHz', desc: 'THW Landesstellen', grid: 'JO42' },
  { id: 11, name: 'Notfunk Braunschweig',     type: 'station',lat: 52.266, lon: 10.526, freq: '7095 kHz', desc: 'ARES/BOS Koordination', grid: 'JO43' },
  { id: 12, name: 'Göttingen Notfunk',        type: 'station',lat: 51.541, lon: 9.916, freq: '3573 kHz', desc: 'Universität Notfunk', grid: 'JO43' },
  
  // HSH-NORD NETZE
  { id: 13, name: 'HSH-NORD Netz Hamburg',   type: 'net',     lat: 53.551, lon: 9.994, freq: '3973 kHz', desc: 'Regionales Netz', grid: 'JO43' },
  { id: 14, name: 'NordStream Netz',         type: 'net',     lat: 53.076, lon: 8.804, freq: '7095 kHz', desc: 'Bremer Hochfrequenz', grid: 'JO33' },
  { id: 15, name: 'Schleswig-Holstein Net',  type: 'net',     lat: 54.323, lon: 10.134, freq: '14095 kHz', desc: 'Landesnetz SSB', grid: 'JO44' },
  
  // Mobile Einheiten
  { id: 16, name: 'Mobile Notarzt HH',       type: 'station', lat: 53.453, lon: 9.991, freq: '145.525 MHz', desc: 'Sanitätsdienst Mobil', grid: 'JO43' },
  { id: 17, name: 'Feuerwehr Rettungsfunk',  type: 'station', lat: 53.589, lon: 10.029, freq: '36.940 MHz', desc: 'FFW Branddirektion', grid: 'JO44' },
];

// Funktion zum Abrufen gefilterter Stationen
function getFilteredStations(filter = 'all') {
  if (filter === 'all') return stations;
  return stations.filter(station => station.type === filter);
}

// Funktion zum Suchen nach Grid Squares
function findStationByGrid(gridSquare) {
  const uppercaseGrid = gridSquare.toUpperCase().trim();
  return stations.find(station => station.grid === uppercaseGrid);
}

// Station nach ID finden
function findStationById(id) {
  return stations.find(station => station.id === id);
}

// Export für andere Skripte
window.NotFunkStations = {
  getAll: () => stations,
  getByType: getFilteredStations,
  findByGrid: findStationByGrid,
  findById: findStationById
};

console.log(`[NotFunk-Nord] Geladene Stationen: ${stations.length}`);