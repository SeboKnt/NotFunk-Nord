// Vereinfachte localStorage-basierte Speicherung für NotFunk-Nord
// Alternative zur IndexedDB für Umgebungen ohne volle IndexedDB-Unterstützung

// Typdefinitionen
interface StorageData {
  [key: string]: any;
}

// Allgemeiner Storage Manager
export class StorageManager {
  private prefix = 'notfunk_';
  
  // Daten speichern
  setItem(key: string, value: any): void {
    try {
      const fullKey = this.prefix + key;
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(fullKey, serializedValue);
    } catch (error) {
      console.error(`[Storage] Error saving ${key}:`, error);
    }
  }
  
  // Daten abrufen
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const fullKey = this.prefix + key;
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return defaultValue;
      }
      
      return JSON.parse(item);
    } catch (error) {
      console.error(`[Storage] Error retrieving ${key}:`, error);
      return defaultValue;
    }
  }
  
  // Daten löschen
  removeItem(key: string): void {
    try {
      const fullKey = this.prefix + key;
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  }
  
  // Alle NotFunk-Daten löschen
  clearAll(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[Storage] Error clearing all data:', error);
    }
  }
  
  // Prüfen ob ein Schlüssel existiert
  hasItem(key: string): boolean {
    const fullKey = this.prefix + key;
    return localStorage.getItem(fullKey) !== null;
  }
}

// APRS-Positionen Manager
export class APRSPositionManager {
  private storage = new StorageManager();
  private storeKey = 'aprs_positions';
  
  async savePosition(position: any): Promise<void> {
    try {
      // Eindeutige ID generieren
      const id = `${position.callsign}_${position.timestamp}`;
      
      // Existierende Positionen laden
      const positions = this.getAllPositionsSync();
      
      // Neue Position hinzufügen oder aktualisieren
      positions[id] = { id, ...position };
      
      // In Storage speichern
      this.storage.setItem(this.storeKey, positions);
      
      console.log(`[APRS] Position saved for ${position.callsign}`);
    } catch (error) {
      console.error('[APRS] Error saving position:', error);
    }
  }
  
  async getPosition(callsign: string): Promise<any> {
    const positions = this.getAllPositionsSync();
    const callsignPositions = Object.values(positions).filter(
      (pos: any) => pos.callsign === callsign
    );
    
    // Neueste Position zurückgeben
    return (callsignPositions as any[]).sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }
  
  getAllPositionsSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getAllPositions(): Promise<any[]> {
    const positions = this.getAllPositionsSync();
    return Object.values(positions);
  }
  
  async getPositionsByLocator(locator: string): Promise<any[]> {
    const positions = this.getAllPositionsSync();
    return Object.values(positions).filter(
      (pos: any) => pos.locator === locator
    ) as any[];
  }
  
  async cleanupOldPositions(maxAgeHours = 24): Promise<void> {
    try {
      const positions = this.getAllPositionsSync();
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      let cleanedCount = 0;
      
      Object.keys(positions).forEach(id => {
        if (positions[id].timestamp < cutoffTime) {
          delete positions[id];
          cleanedCount++;
        }
      });
      
      // Bereinigte Daten speichern
      this.storage.setItem(this.storeKey, positions);
      
      console.log(`[APRS] Cleaned up ${cleanedCount} old positions`);
    } catch (error) {
      console.error('[APRS] Error cleaning up positions:', error);
    }
  }
}

// Wetterdaten Manager
export class WeatherDataManager {
  private storage = new StorageManager();
  private storeKey = 'weather_data';
  
  async saveWeatherData(weather: any): Promise<void> {
    try {
      // Eindeutige ID generieren
      const id = `${weather.callsign}_${weather.timestamp}`;
      
      // Existierende Wetterdaten laden
      const weatherData = this.getAllWeatherDataSync();
      
      // Neue Daten hinzufügen oder aktualisieren
      weatherData[id] = { id, ...weather };
      
      // In Storage speichern
      this.storage.setItem(this.storeKey, weatherData);
      
      console.log(`[Weather] Data saved for ${weather.callsign}`);
    } catch (error) {
      console.error('[Weather] Error saving data:', error);
    }
  }
  
  async getLatestWeather(callsign: string): Promise<any> {
    const weatherData = this.getAllWeatherDataSync();
    const callsignData = Object.values(weatherData).filter(
      (data: any) => data.callsign === callsign
    );
    
    // Neueste Wetterdaten zurückgeben
    return (callsignData as any[]).sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  }
  
  getAllWeatherDataSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getAllWeatherData(): Promise<any[]> {
    const weatherData = this.getAllWeatherDataSync();
    return Object.values(weatherData);
  }
}

// Relaisdaten Manager
export class RepeaterManager {
  private storage = new StorageManager();
  private storeKey = 'repeaters';
  
  async saveRepeater(repeater: any): Promise<void> {
    try {
      const repeaters = this.getAllRepeatersSync();
      repeaters[repeater.callsign] = repeater;
      this.storage.setItem(this.storeKey, repeaters);
      
      console.log(`[Repeater] Saved data for ${repeater.callsign}`);
    } catch (error) {
      console.error('[Repeater] Error saving data:', error);
    }
  }
  
  async getRepeater(callsign: string): Promise<any> {
    const repeaters = this.getAllRepeatersSync();
    return repeaters[callsign] || null;
  }
  
  getAllRepeatersSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getAllRepeaters(): Promise<any[]> {
    const repeaters = this.getAllRepeatersSync();
    return Object.values(repeaters);
  }
  
  async getRepeatersByStatus(status: string): Promise<any[]> {
    const repeaters = this.getAllRepeatersSync();
    return Object.values(repeaters).filter(
      (r: any) => r.status === status
    ) as any[];
  }
  
  async getRepeatersByBand(band: string): Promise<any[]> {
    const repeaters = this.getAllRepeatersSync();
    
    return Object.values(repeaters).filter((r: any) => {
      const freq = r.frequencyOut;
      switch (band) {
        case '2m': return freq >= 144 && freq < 146;
        case '70cm': return freq >= 430 && freq < 440;
        case '23cm': return freq >= 1240 && freq < 1300;
        default: return false;
      }
    }) as any[];
  }
}

// Logbuch Manager
export class LogbookManager {
  private storage = new StorageManager();
  private storeKey = 'logbook';
  
  async addEntry(entry: any): Promise<number> {
    try {
      const entries = this.getAllEntriesSync();
      
      // Neue ID generieren
      const newId = Date.now(); // Einfache ID-Generierung
      const data = {
        id: newId,
        ...entry,
        date: entry.date || new Date().toISOString()
      };
      
      entries[newId] = data;
      this.storage.setItem(this.storeKey, entries);
      
      console.log(`[Logbook] Entry added with ID ${newId}`);
      return newId;
    } catch (error) {
      console.error('[Logbook] Error adding entry:', error);
      throw error;
    }
  }
  
  getAllEntriesSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getEntries(): Promise<any[]> {
    const entries = this.getAllEntriesSync();
    const result = Object.values(entries);
    
    // Nach Datum sortieren (neueste zuerst)
    return result.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  
  async getEntriesByCallsign(callsign: string): Promise<any[]> {
    const entries = this.getAllEntriesSync();
    return Object.values(entries).filter(
      (entry: any) => entry.callsign === callsign
    ) as any[];
  }
  
  async getEntriesByDate(date: string): Promise<any[]> {
    const entries = this.getAllEntriesSync();
    return Object.values(entries).filter(
      (entry: any) => entry.date.startsWith(date)
    ) as any[];
  }
  
  async deleteEntry(id: number): Promise<void> {
    try {
      const entries = this.getAllEntriesSync();
      delete entries[id];
      this.storage.setItem(this.storeKey, entries);
      
      console.log(`[Logbook] Entry ${id} deleted`);
    } catch (error) {
      console.error(`[Logbook] Error deleting entry ${id}:`, error);
    }
  }
}

// NET-Checkin Manager
export class NetCheckinManager {
  private storage = new StorageManager();
  private storeKey = 'net_checkins';
  
  async addCheckin(checkin: any): Promise<number> {
    try {
      const checkins = this.getAllCheckinsSync();
      
      // Neue ID generieren
      const newId = Date.now();
      const data = {
        id: newId,
        ...checkin,
        timestamp: checkin.timestamp || Date.now()
      };
      
      checkins[newId] = data;
      this.storage.setItem(this.storeKey, checkins);
      
      console.log(`[NET] Checkin added with ID ${newId}`);
      return newId;
    } catch (error) {
      console.error('[NET] Error adding checkin:', error);
      throw error;
    }
  }
  
  getAllCheckinsSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getCheckins(): Promise<any[]> {
    const checkins = this.getAllCheckinsSync();
    return Object.values(checkins);
  }
  
  async getCheckinsByNet(netId: string): Promise<any[]> {
    const checkins = this.getAllCheckinsSync();
    return Object.values(checkins).filter(
      (checkin: any) => checkin.netId === netId
    ) as any[];
  }
  
  async getCheckinsByCallsign(callsign: string): Promise<any[]> {
    const checkins = this.getAllCheckinsSync();
    return Object.values(checkins).filter(
      (checkin: any) => checkin.callsign === callsign
    ) as any[];
  }
}

// Einstellungs-Manager
export class SettingsManager {
  private storage = new StorageManager();
  private storeKey = 'settings';
  
  async saveSetting(key: string, value: any): Promise<void> {
    try {
      const settings = this.getAllSettingsSync();
      settings[key] = value;
      this.storage.setItem(this.storeKey, settings);
      
      console.log(`[Settings] Saved ${key}`);
    } catch (error) {
      console.error(`[Settings] Error saving ${key}:`, error);
    }
  }
  
  async getSetting(key: string): Promise<any> {
    const settings = this.getAllSettingsSync();
    return settings[key] || null;
  }
  
  getAllSettingsSync(): StorageData {
    return this.storage.getItem<StorageData>(this.storeKey, {}) || {};
  }
  
  async getAllSettings(): Promise<Record<string, any>> {
    return this.getAllSettingsSync();
  }
}

// Export der Manager
export const storageManager = new StorageManager();
export const aprsPositionManager = new APRSPositionManager();
export const weatherDataManager = new WeatherDataManager();
export const repeaterManager = new RepeaterManager();
export const logbookManager = new LogbookManager();
export const netCheckinManager = new NetCheckinManager();
export const settingsManager = new SettingsManager();

// Initialisierung
console.log('[Storage] NotFunk Storage initialized');