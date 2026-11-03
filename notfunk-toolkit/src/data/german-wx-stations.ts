// Beispiel für Wetterdaten von deutschen APRS-WX Stationen
// Diese Stations können als Referenz für die APRS-WX API verwendet werden

export type GermanWXStation = {
  callsign: string;
  name: string;
  location: string;
  gridLocator: string;
  description: string;
  active: boolean;
};

// Bekannte deutsche APRS Wetterstationen
export const GERMAN_WX_STATIONS: GermanWXStation[] = [
  {
    callsign: 'DB0OTV-6',
    name: 'Meerbusch Osterath',
    location: 'Meerbusch, NRW',
    gridLocator: 'JO31KW',
    description: 'Wetterstation am Standort des Relais DB0OTV',
    active: true
  },
  {
    callsign: 'DL4DP-6',
    name: 'Lank-Latum',
    location: 'Lank-Latum, NRW',
    gridLocator: 'JO31JV',
    description: 'Private Wetterstation des Funkers DL4DP',
    active: true
  },
  {
    callsign: 'DN4DP-6', // Ausbildungsrufzeichen
    name: 'Langst-Kierst',
    location: 'Langst-Kierst, NRW',
    gridLocator: 'JO31JV',
    description: 'Weitere Wetterstation von DL4DP',
    active: true
  },
  {
    callsign: 'DB0DRI-6',
    name: 'Bad Driburg/Pömbsen',
    location: 'Bad Driburg, NRW',
    gridLocator: 'JO31KC',
    description: 'Wetterstation am Standort des Digipeaters DB0DRI',
    active: true
  }
];

// Hilfsfunktion zum Abrufen von Wetterdaten für eine spezifische Station
export async function getSampleWXData(callsign: string): Promise<any> {
  // In einer echten Implementierung würde hier die APRS.fi API aufgerufen
  // Für Demonstrationszwecke geben wir Beispielwerte zurück
  
  const baseData = {
    name: callsign,
    type: 'weather',
    time: new Date().toISOString(),
    lasttime: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Vor 0-1h
    srccall: callsign,
    comment: 'Demo Wetterdaten',
    wx: {
      time: new Date().toISOString(),
      celsius: Math.round((15 + Math.random() * 20) * 10) / 10, // 15-35°C
      fahrenheit: 0, // Wird berechnet
      humidity: Math.round(Math.random() * 100), // 0-100%
      pressure: Math.round(980 + Math.random() * 40), // 980-1020 hPa
      wind_direction: Math.round(Math.random() * 360), // 0-360°
      wind_speed: Math.round(Math.random() * 30), // 0-30 km/h
      wind_gust: Math.round(Math.random() * 40), // 0-40 km/h
      rain_1h: Math.round(Math.random() * 10 * 10) / 10, // 0-10 mm
      rain_24h: Math.round(Math.random() * 25 * 10) / 10, // 0-25 mm
      rain_mn: Math.round(Math.random() * 50 * 10) / 10, // 0-50 mm
      luminosity: Math.round(Math.random() * 100000), // 0-100000 lux
      uv: Math.round(Math.random() * 15 * 10) / 10, // 0-15 UV Index
      crc: '0000' // Demo CRC
    }
  };
  
  // Fahrenheit berechnen
  baseData.wx.fahrenheit = Math.round((baseData.wx.celsius * 9/5 + 32) * 10) / 10;
  
  return baseData;
}