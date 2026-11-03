// Kartenintegration für NotFunk-Nord
// Vereinfachte Version ohne direkte Abhängigkeit von Leaflet/OpenLayers zur Vermeidung von Typfehlern

// Gemeinsame Typdefinitionen für Kartenobjekte
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  data?: any; // Zusätzliche Daten
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'marker' | 'polygon' | 'polyline' | 'circle';
  visible: boolean;
  data: any;
}

// Allgemeine Kartenadapter-Schnittstelle
export interface MapAdapter {
  addOrUpdateMarker(marker: MapMarker): void;
  removeMarker(id: string): void;
  clearMarkers(): void;
  centerOn(lat: number, lng: number, zoom?: number): void;
  setZoom(zoom: number): void;
  createAPRSMarker(aprsData: any): MapMarker;
}

// Vereinfachte Implementierung ohne direkte Bibliotheksabhängigkeiten
export class SimpleMapAdapter implements MapAdapter {
  private markers: Map<string, MapMarker> = new Map();
  
  // Marker hinzufügen oder aktualisieren
  addOrUpdateMarker(marker: MapMarker): void {
    this.markers.set(marker.id, marker);
    console.log(`[SimpleMap] Added/Updated marker: ${marker.id}`);
  }
  
  // Marker entfernen
  removeMarker(id: string): void {
    this.markers.delete(id);
    console.log(`[SimpleMap] Removed marker: ${id}`);
  }
  
  // Alle Marker entfernen
  clearMarkers(): void {
    this.markers.clear();
    console.log('[SimpleMap] Cleared all markers');
  }
  
  // Karte auf eine Position zentrieren
  centerOn(lat: number, lng: number, zoom?: number): void {
    console.log(`[SimpleMap] Centering on ${lat},${lng} with zoom ${zoom || 'default'}`);
  }
  
  // Zoom-Level setzen
  setZoom(zoom: number): void {
    console.log(`[SimpleMap] Setting zoom to ${zoom}`);
  }
  
  // Marker aus APRS-Daten erstellen
  createAPRSMarker(aprsData: any): MapMarker {
    return {
      id: aprsData.name || aprsData.srccall,
      lat: aprsData.lat,
      lng: aprsData.lng,
      title: aprsData.srccall,
      description: aprsData.comment || '',
      icon: aprsData.symbol || 'default',
      data: aprsData
    };
  }
  
  // Alle aktuellen Marker abrufen (für Debugging)
  getAllMarkers(): MapMarker[] {
    return Array.from(this.markers.values());
  }
}

// Utility-Funktionen für Kartenoperationen
export const MapUtils = {
  // Konvertiere Maidenhead Locator zu Lat/Lng
  locatorToLatLng(locator: string): { lat: number; lng: number } | null {
    try {
      // Einfache Implementation für 4-stellige Locators
      if (locator.length < 4) return null;
      
      const lon = (locator.charCodeAt(0) - 65) * 20 - 180 +
                  parseInt(locator[2]) * 2 - 90;
      const lat = (locator.charCodeAt(1) - 65) * 10 - 90 +
                  parseInt(locator[3]) * 1 - 45;
                  
      return { lat, lng: lon };
    } catch (error) {
      console.error('[MapUtils] Error converting locator:', error);
      return null;
    }
  },
  
  // Berechne Entfernung zwischen zwei Punkten (Haversine)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Erdradius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
  
  // Konvertiere Grad zu Radians
  toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }
};