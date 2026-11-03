// Vereinfachte IndexedDB Wrapper für NotFunk-Nord
// Lokale Datenhaltung für Offline-Funktionalität

// Storage Manager (ohne IndexedDB wegen Kompatibilitätsproblemen)
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

// IndexedDB Wrapper
class NotFunkDB {
  private db: IDBDatabase | null = null;
  private dbName = 'NotFunkNordDB';
  private version = 1;
  
  // Öffnet die Datenbank
  async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('[IndexedDB] Error opening database:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Database opened successfully');
        resolve(request.result);
      };
      
      // Datenbankstruktur erstellen/updaten
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // APRS-Positionen Store
        if (!db.objectStoreNames.contains('aprsPositions')) {
          const positionStore = db.createObjectStore('aprsPositions', { keyPath: 'id' });
          positionStore.createIndex('callsign', 'callsign', { unique: false });
          positionStore.createIndex('timestamp', 'timestamp', { unique: false });
          positionStore.createIndex('locator', 'locator', { unique: false });
        }
        
        // Wetterdaten Store
        if (!db.objectStoreNames.contains('weatherData')) {
          const weatherStore = db.createObjectStore('weatherData', { keyPath: 'id' });
          weatherStore.createIndex('callsign', 'callsign', { unique: false });
          weatherStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Relaisdaten Store
        if (!db.objectStoreNames.contains('repeaters')) {
          const repeaterStore = db.createObjectStore('repeaters', { keyPath: 'callsign' });
          repeaterStore.createIndex('status', 'status', { unique: false });
          repeaterStore.createIndex('frequency', 'frequencyOut', { unique: false });
        }
        
        // Logbucheinträge Store
        if (!db.objectStoreNames.contains('logbook')) {
          const logbookStore = db.createObjectStore('logbook', { keyPath: 'id', autoIncrement: true });
          logbookStore.createIndex('date', 'date', { unique: false });
          logbookStore.createIndex('callsign', 'callsign', { unique: false });
        }
        
        // NET-Checkins Store
        if (!db.objectStoreNames.contains('netCheckins')) {
          const netStore = db.createObjectStore('netCheckins', { keyPath: 'id', autoIncrement: true });
          netStore.createIndex('netId', 'netId', { unique: false });
          netStore.createIndex('callsign', 'callsign', { unique: false });
          netStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Einstellungen Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
        
        console.log('[IndexedDB] Database structure created');
      };
    });
  }
  
  // Holt einen Datensatz
  async get(storeName: string, key: string | number): Promise<any> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Fügt einen Datensatz hinzu oder aktualisiert ihn
  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Löscht einen Datensatz
  async delete(storeName: string, key: string | number): Promise<void> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Holt alle Datensätze aus einem Store
  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Holt Datensätze mit einem Index
  async getByIndex(storeName: string, indexName: string, key: any): Promise<any[]> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(key);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Löscht alle Datensätze aus einem Store
  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  // Schließt die Datenbank
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[IndexedDB] Database closed');
    }
  }
}

// Singleton-Instanz
const notfunkDB = new NotFunkDB();

// APRS-Positionen Manager
export class APRSPositionManager {
  private storeName = 'aprsPositions';
  
  async savePosition(position: any): Promise<void> {
    // Eindeutige ID generieren
    const id = `${position.callsign}_${position.timestamp}`;
    const data = { id, ...position };
    
    await notfunkDB.put(this.storeName, data);
    console.log(`[APRS] Position saved for ${position.callsign}`);
  }
  
  async getPosition(callsign: string): Promise<any> {
    const results = await notfunkDB.getByIndex(this.storeName, 'callsign', callsign);
    // Neueste Position zurückgeben
    return results.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
  
  async getAllPositions(): Promise<any[]> {
    return await notfunkDB.getAll(this.storeName);
  }
  
  async getPositionsByLocator(locator: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'locator', locator);
  }
  
  async cleanupOldPositions(maxAgeHours = 24): Promise<void> {
    const allPositions = await this.getAllPositions();
    const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
    
    for (const position of allPositions) {
      if (position.timestamp < cutoffTime) {
        await notfunkDB.delete(this.storeName, position.id);
      }
    }
    
    console.log(`[APRS] Cleaned up old positions`);
  }
}

// Wetterdaten Manager
export class WeatherDataManager {
  private storeName = 'weatherData';
  
  async saveWeatherData(weather: any): Promise<void> {
    // Eindeutige ID generieren
    const id = `${weather.callsign}_${weather.timestamp}`;
    const data = { id, ...weather };
    
    await notfunkDB.put(this.storeName, data);
    console.log(`[Weather] Data saved for ${weather.callsign}`);
  }
  
  async getLatestWeather(callsign: string): Promise<any> {
    const results = await notfunkDB.getByIndex(this.storeName, 'callsign', callsign);
    // Neueste Wetterdaten zurückgeben
    return results.sort((a, b) => b.timestamp - a.timestamp)[0];
  }
  
  async getAllWeatherData(): Promise<any[]> {
    return await notfunkDB.getAll(this.storeName);
  }
}

// Relaisdaten Manager
export class RepeaterManager {
  private storeName = 'repeaters';
  
  async saveRepeater(repeater: any): Promise<void> {
    await notfunkDB.put(this.storeName, repeater);
    console.log(`[Repeater] Saved data for ${repeater.callsign}`);
  }
  
  async getRepeater(callsign: string): Promise<any> {
    return await notfunkDB.get(this.storeName, callsign);
  }
  
  async getAllRepeaters(): Promise<any[]> {
    return await notfunkDB.getAll(this.storeName);
  }
  
  async getRepeatersByStatus(status: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'status', status);
  }
  
  async getRepeatersByBand(band: string): Promise<any[]> {
    // Band-Filterung muss clientseitig erfolgen
    const allRepeaters = await this.getAllRepeaters();
    return allRepeaters.filter(r => {
      const freq = r.frequencyOut;
      switch (band) {
        case '2m': return freq >= 144 && freq < 146;
        case '70cm': return freq >= 430 && freq < 440;
        case '23cm': return freq >= 1240 && freq < 1300;
        default: return false;
      }
    });
  }
}

// Logbuch Manager
export class LogbookManager {
  private storeName = 'logbook';
  
  async addEntry(entry: any): Promise<number> {
    const data = {
      ...entry,
      date: entry.date || new Date().toISOString()
    };
    
    // @ts-ignore - autoIncrement key
    const id = await notfunkDB.put(this.storeName, data);
    console.log(`[Logbook] Entry added with ID ${id}`);
    // @ts-ignore
    return id;
  }
  
  async getEntries(): Promise<any[]> {
    const entries = await notfunkDB.getAll(this.storeName);
    // Nach Datum sortieren
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getEntriesByCallsign(callsign: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'callsign', callsign);
  }
  
  async getEntriesByDate(date: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'date', date);
  }
  
  async deleteEntry(id: number): Promise<void> {
    await notfunkDB.delete(this.storeName, id);
    console.log(`[Logbook] Entry ${id} deleted`);
  }
}

// NET-Checkin Manager
export class NetCheckinManager {
  private storeName = 'netCheckins';
  
  async addCheckin(checkin: any): Promise<number> {
    const data = {
      ...checkin,
      timestamp: checkin.timestamp || Date.now()
    };
    
    // @ts-ignore - autoIncrement key
    const id = await notfunkDB.put(this.storeName, data);
    console.log(`[NET] Checkin added with ID ${id}`);
    // @ts-ignore
    return id;
  }
  
  async getCheckins(): Promise<any[]> {
    return await notfunkDB.getAll(this.storeName);
  }
  
  async getCheckinsByNet(netId: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'netId', netId);
  }
  
  async getCheckinsByCallsign(callsign: string): Promise<any[]> {
    return await notfunkDB.getByIndex(this.storeName, 'callsign', callsign);
  }
}

// Einstellungs-Manager
export class SettingsManager {
  private storeName = 'settings';
  
  async saveSetting(key: string, value: any): Promise<void> {
    const setting = { key, value };
    await notfunkDB.put(this.storeName, setting);
    console.log(`[Settings] Saved ${key}`);
  }
  
  async getSetting(key: string): Promise<any> {
    const setting = await notfunkDB.get(this.storeName, key);
    return setting ? setting.value : null;
  }
  
  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await notfunkDB.getAll(this.storeName);
    const result: Record<string, any> = {};
    
    settings.forEach(setting => {
      result[setting.key] = setting.value;
    });
    
    return result;
  }
}

// Export der Manager
export const aprsPositionManager = new APRSPositionManager();
export const weatherDataManager = new WeatherDataManager();
export const repeaterManager = new RepeaterManager();
export const logbookManager = new LogbookManager();
export const netCheckinManager = new NetCheckinManager();
export const settingsManager = new SettingsManager();

// Initialisierung
(async () => {
  try {
    await notfunkDB.open();
    console.log('[IndexedDB] NotFunkDB initialized successfully');
  } catch (error) {
    console.error('[IndexedDB] Failed to initialize NotFunkDB:', error);
  }
})();