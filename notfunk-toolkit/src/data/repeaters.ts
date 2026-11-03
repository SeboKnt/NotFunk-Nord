// DARC Relais Datenstruktur und Beispiel für Relaisstatus Integration

export type Repeater = {
  // Basisinformationen
  callsign: string;           // Rufzeichen des Relais (z.B. DB0XYZ)
  frequencyOut: number;       // Ausgabefrequenz in MHz
  frequencyIn: number;        // Eingabefrequenz in MHz
  shift: number;              // Frequenzshift in MHz
  mode: string;               // Betriebsart (FM, DMR, D-STAR, C4FM, ATV, etc.)
  ctcssHz?: number;           // CTCSS-Ton in Hz (optional)
  location: string;           // Standortbeschreibung
  locator: string;            // Maidenhead Locator
  distance?: number;          // Entfernung in km (wenn Bezugspunkt bekannt)
  azimuth?: number;           // Richtung in Grad (wenn Bezugspunkt bekannt)
  
  // Statusinformationen (Live-Daten)
  status?: 'online' | 'offline' | 'unknown';  // Aktueller Status
  lastHeard?: string;         // Zeitstempel letztes Signal (ISO 8601)
  rxTraffic?: number;         // Empfangspegel in dBm (wenn verfügbar)
  txTraffic?: number;         // Sendungsauslastung in %
  sysop?: string;             // Betreuer des Relais
  comment?: string;           // Zusätzliche Informationen
  
  // Technische Details
  antenna?: string;           // Antennentyp
  height?: number;            // Antennenhöhe in m ü. NN
  power?: number;             // Sendeleistung in Watt
  access?: string;            // Zugriffsart (Ton, Rufton, Digital, etc.)
  
  // Netzwerkinformationen
  network?: string;           // Netzwerk (BrandMeister, DMR+, C4FM Netz, etc.)
  nodeId?: string;            // Netzwerk Node-ID (falls digital)
  url?: string;               // Webseite mit weiteren Informationen
};

// Beispiel einer Relaisliste (basierend auf DARC-Formaten)
export const SAMPLE_REPEATERS: Repeater[] = [
  {
    callsign: 'DB0XYZ',
    frequencyOut: 145.600,
    frequencyIn: 145.000,
    shift: -0.600,
    mode: 'FM',
    ctcssHz: 71.9,
    location: 'Beispielstadt',
    locator: 'JO31XX',
    status: 'online',
    lastHeard: new Date().toISOString(),
    sysop: 'DL1ABC',
    comment: 'Aktives Öffentliches Relais',
    antenna: 'Diamond X-50A',
    height: 50,
    power: 25,
    access: 'CTCSS'
  },
  {
    callsign: 'DB0ABC',
    frequencyOut: 438.500,
    frequencyIn: 430.900,
    shift: -7.600,
    mode: 'DMR',
    location: 'Musterort',
    locator: 'JO42YY',
    status: 'offline',
    lastHeard: new Date(Date.now() - 86400000).toISOString(), // Gestern
    sysop: 'DL2DEF',
    comment: 'DMR Hotspot via BrandMeister',
    network: 'BrandMeister',
    nodeId: '2621234',
    url: 'https://brandmeister.network/?page=contact'
  },
  {
    callsign: 'DB0TEST',
    frequencyOut: 145.6125,
    frequencyIn: 145.0125,
    shift: -0.600,
    mode: 'FM',
    location: 'Testgelände',
    locator: 'JO53ZZ',
    status: 'unknown',
    sysop: 'DL3GHI',
    comment: 'Experimentelles Relais für Tests',
    power: 10,
    access: '1750Hz Tone'
  }
];

// Simulierte Funktion zum Abrufen von Relaisdaten
export async function getRepeaterStatus(callsign?: string): Promise<Repeater[]> {
  // In einer echten Implementierung würden hier verschiedene Quellen
  // abgefragt werden, z.B.:
  // 1. APRS-IS für aktuelle Statusinformationen
  // 2. DARC Relaisdatenbank
  // 3. Netzwerk APIs (BrandMeister, DMR+, etc.)
  
  if (callsign) {
    const repeater = SAMPLE_REPEATERS.find(r => r.callsign === callsign);
    return repeater ? [repeater] : [];
  }
  
  // Ohne spezifisches Rufzeichen alle Beispielrelais zurückgeben
  return SAMPLE_REPEATERS.map(r => ({
    ...r,
    // Simuliere leichte Variationen in Statusdaten
    lastHeard: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    rxTraffic: Math.round(Math.random() * 100),
    txTraffic: Math.round(Math.random() * 100)
  }));
}