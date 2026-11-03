// GPS Positionierung für NotFunk-Nord
// Nutzung der Cloudflare Workers Geolocation API

// Typdefinitionen für Cloudflare Geolocation Daten
export interface CloudflareGeolocation {
  colo: string;
  country: string;
  city: string;
  continent: string;
  latitude: string; // In CF als String
  longitude: string; // In CF als String
  postalCode: string;
  metroCode?: string;
  region: string;
  regionCode: string;
  timezone: string;
}

// Konvertierte Geolocation Daten mit numerischen Werten
export interface GeolocationData {
  colo: string;
  country: string;
  city: string;
  continent: string;
  latitude: number;
  longitude: number;
  postalCode: string;
  metroCode?: number;
  region: string;
  regionCode: string;
  timezone: string;
  accuracy?: 'high' | 'low';
}

// Erweiterte Deklarationen für Browser-APIs
declare global {
  interface Navigator {
    readonly geolocation: Geolocation;
  }
  
  interface Geolocation {
    getCurrentPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions
    ): void;
    
    watchPosition(
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback | null,
      options?: PositionOptions
    ): number;
  }
  
  interface PositionCallback {
    (position: GeolocationPosition): void;
  }
  
  interface PositionErrorCallback {
    (error: GeolocationPositionError): void;
  }
  
  // Verwenden der existierenden DOM-Typen
  // interface GeolocationPosition und GeolocationPositionError
  // sind bereits in lib.dom.d.ts definiert
  
  // Ergänzen der fehlenden Eigenschaften
  interface GeolocationPositionError {
    readonly PERMISSION_DENIED: 1;
    readonly POSITION_UNAVAILABLE: 2;
    readonly TIMEOUT: 3;
  }
  
  interface PositionOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }
}

// GPS Position Manager
export class GPSPositionManager {
  // Extrahiert Geolocation-Daten aus dem Cloudflare Request
  static extractFromRequest(request: any): GeolocationData | null {
    try {
      const cf = request.cf;
      
      if (!cf) {
        console.warn('[GPS] No Cloudflare geolocation data available');
        return null;
      }
      
      // Konvertiere String-Werte zu Nummern
      const latitude = cf.latitude ? parseFloat(cf.latitude) : 0;
      const longitude = cf.longitude ? parseFloat(cf.longitude) : 0;
      const metroCode = cf.metroCode ? parseInt(cf.metroCode, 10) : undefined;
      
      const geoData: GeolocationData = {
        colo: cf.colo || '',
        country: cf.country || '',
        city: cf.city || '',
        continent: cf.continent || '',
        latitude,
        longitude,
        postalCode: cf.postalCode || '',
        metroCode,
        region: cf.region || '',
        regionCode: cf.regionCode || '',
        timezone: cf.timezone || '',
        accuracy: 'low' // CF Geolocation ist grob (Stadt-/Regionsebene)
      };
      
      console.log('[GPS] Extracted geolocation data:', geoData);
      return geoData;
    } catch (error) {
      console.error('[GPS] Error extracting geolocation data:', error);
      return null;
    }
  }
  
  // Konvertiert GPS-Koordinaten in Maidenhead Locator
  static toMaidenhead(latitude: number, longitude: number, precision: 2 | 4 | 6 | 8 | 10 = 6): string {
    try {
      // Normalisieren zu gültigen Bereichen
      latitude = Math.max(-90, Math.min(90, latitude));
      longitude = Math.max(-180, Math.min(180, longitude));
      
      const lonAdj = longitude + 180; // 0..360
      const latAdj = latitude + 90;   // 0..180
      
      let result = '';
      
      // Field: 20° lon x 10° lat
      const fieldLon = Math.floor(lonAdj / 20);
      const fieldLat = Math.floor(latAdj / 10);
      result += String.fromCharCode(65 + fieldLon) + String.fromCharCode(65 + fieldLat);
      
      if (precision <= 2) return result;
      
      // Square: 2° lon x 1° lat
      const sqLon = Math.floor((lonAdj % 20) / 2);
      const sqLat = Math.floor((latAdj % 10) / 1);
      result += sqLon.toString() + sqLat.toString();
      
      if (precision <= 4) return result;
      
      // Subsquare: 5' lon x 2.5' lat
      const lonRem = (lonAdj % 2) * 60; // Minuten
      const latRem = (latAdj % 1) * 60;
      const subLon = Math.floor(lonRem / 5);
      const subLat = Math.floor(latRem / 2.5);
      result += String.fromCharCode(97 + subLon) + String.fromCharCode(97 + subLat);
      
      if (precision <= 6) return result;
      
      // Extended square: 2.5" lon x 1.25" lat
      const exLonRem = (lonRem % 5) * 60; // Sekunden
      const exLatRem = (latRem % 2.5) * 60;
      const exLon = Math.floor(exLonRem / 30); // 2.5 * 60 = 150 sec, 150/30 = 5
      const exLat = Math.floor(exLatRem / 75); // 1.25 * 60 = 75 sec
      result += exLon.toString() + exLat.toString();
      
      if (precision <= 8) return result;
      
      // Ultra precision: 0.625" lon x 0.3125" lat
      const ultraLonRem = (exLonRem % 30) * 10; // 0.1 sec units
      const ultraLatRem = (exLatRem % 75) * 10;
      const ultraLon = Math.floor(ultraLonRem / 6.25); // 0.625 * 10 = 6.25
      const ultraLat = Math.floor(ultraLatRem / 3.125); // 0.3125 * 10 = 3.125
      result += ultraLon.toString() + ultraLat.toString();
      
      return result;
    } catch (error) {
      console.error('[GPS] Error converting to Maidenhead:', error);
      return 'AA00'; // Default Locator bei Fehler
    }
  }
  
  // Berechnet Entfernung zwischen zwei Punkten (Haversine)
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Erdradius in km
    const toRad = (deg: number) => deg * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  // Berechnet Richtung zwischen zwei Punkten
  static calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => deg * Math.PI / 180;
    const toDeg = (rad: number) => rad * 180 / Math.PI;
    
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
              Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
              
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }
  
  // Findet nahegelegene APRS-Standorte
  static async findNearbyStations(
    latitude: number, 
    longitude: number, 
    maxDistanceKm: number = 50
  ): Promise<any[]> {
    // In einer echten Implementierung würden hier APRS-Daten aus der Datenbank
    // oder einem externen Service abgerufen und gefiltert werden
    
    console.log(`[GPS] Searching for stations within ${maxDistanceKm}km of ${latitude},${longitude}`);
    
    // Dummy-Daten für Demonstration
    return [
      {
        callsign: 'DEMO1',
        distance: 15.5,
        bearing: 45,
        locator: 'JO43aa'
      },
      {
        callsign: 'DEMO2',
        distance: 32.1,
        bearing: 120,
        locator: 'JO42bc'
      }
    ];
  }
}

// Client-seitige GPS Positionierung (für Browser)
export class BrowserGPSManager {
  // Fordert GPS-Position vom Browser an
  static async getCurrentPosition(
    options?: PositionOptions
  ): Promise<GeolocationPosition | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('[BrowserGPS] Geolocation not supported');
        resolve(null);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[BrowserGPS] Position acquired');
          resolve(position);
        },
        (error) => {
          console.error('[BrowserGPS] Error getting position:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        }
      );
    });
  }
  
  // Konvertiert Browser-Position in unsere interne Struktur
  static convertPosition(position: GeolocationPosition): GeolocationData {
    return {
      colo: 'BROWSER', // Markiert Browser-Position
      country: '', // Nicht verfügbar im Browser
      city: '',    // Nicht verfügbar im Browser
      continent: '', // Nicht verfügbar im Browser
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      postalCode: '', // Nicht verfügbar im Browser
      region: '',    // Nicht verfügbar im Browser
      regionCode: '', // Nicht verfügbar im Browser
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      accuracy: position.coords.accuracy < 100 ? 'high' : 'low'
    };
  }
  
  // Überwacht Positionsänderungen
  static watchPosition(
    callback: (position: GeolocationPosition) => void,
    options?: PositionOptions
  ): number | null {
    if (!navigator.geolocation) {
      console.warn('[BrowserGPS] Geolocation not supported');
      return null;
    }
    
    return navigator.geolocation.watchPosition(
      callback,
      (error) => {
        console.error('[BrowserGPS] Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      }
    );
  }
}

// Utility-Funktionen für GPS-Daten
export const GPSUtils = {
  // Formatiert Koordinaten als DMS (Degrees, Minutes, Seconds)
  formatDMS(latitude: number, longitude: number): string {
    const formatCoord = (coord: number, isLat: boolean): string => {
      const dir = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
      coord = Math.abs(coord);
      
      const degrees = Math.floor(coord);
      const minutes = Math.floor((coord - degrees) * 60);
      const seconds = ((coord - degrees - minutes/60) * 3600);
      
      return `${degrees}°${minutes}'${seconds.toFixed(2)}"${dir}`;
    };
    
    return `${formatCoord(latitude, true)} ${formatCoord(longitude, false)}`;
  },
  
  // Formatiert Koordinaten als Dezimalgrad
  formatDecimal(latitude: number, longitude: number): string {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  },
  
  // Formatiert Koordinaten als Maidenhead Locator
  formatLocator(latitude: number, longitude: number): string {
    return GPSPositionManager.toMaidenhead(latitude, longitude);
  }
};

export default GPSPositionManager;