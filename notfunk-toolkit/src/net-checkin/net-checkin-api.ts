// NET Checkin API für NotFunk-Nord
// Verwaltung von NET-Teilnahmen und Checkins

// Typdefinitionen
export interface NetCheckin {
  id?: number;
  netId: string;
  callsign: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    locator?: string;
  };
  status?: 'initial' | 'checkin' | 'checkout' | 'active';
  comment?: string;
  signalReport?: string;
  receivedReport?: string;
}

export interface NetInfo {
  id: string;
  name: string;
  description?: string;
  startTime: number;
  endTime?: number;
  frequency?: number;
  mode?: string;
  organizer: string;
  participants: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

// NET Checkin Manager
export class NetCheckinManager {
  private storageKey = 'net_checkins';
  private netsKey = 'nets';
  
  // Fügt einen Checkin hinzu
  async addCheckin(checkin: Omit<NetCheckin, 'id' | 'timestamp'>): Promise<NetCheckin> {
    try {
      const checkins = this.getAllCheckinsSync();
      
      // Neue ID generieren
      const newId = Date.now();
      const newCheckin: NetCheckin = {
        id: newId,
        timestamp: Date.now(),
        ...checkin
      };
      
      checkins.push(newCheckin);
      localStorage.setItem(this.storageKey, JSON.stringify(checkins));
      
      console.log(`[NET] Checkin added for ${checkin.callsign} in net ${checkin.netId}`);
      return newCheckin;
    } catch (error) {
      console.error('[NET] Error adding checkin:', error);
      throw error;
    }
  }
  
  // Holt alle Checkins
  getAllCheckinsSync(): NetCheckin[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[NET] Error retrieving checkins:', error);
      return [];
    }
  }
  
  // Holt Checkins für ein bestimmtes NET
  getCheckinsByNet(netId: string): NetCheckin[] {
    const checkins = this.getAllCheckinsSync();
    return checkins.filter(checkin => checkin.netId === netId);
  }
  
  // Holt Checkins nach Rufzeichen
  getCheckinsByCallsign(callsign: string): NetCheckin[] {
    const checkins = this.getAllCheckinsSync();
    return checkins.filter(checkin => checkin.callsign === callsign);
  }
  
  // Aktualisiert einen Checkin
  async updateCheckin(id: number, updates: Partial<NetCheckin>): Promise<NetCheckin | null> {
    try {
      const checkins = this.getAllCheckinsSync();
      const index = checkins.findIndex(checkin => checkin.id === id);
      
      if (index === -1) {
        console.warn(`[NET] Checkin ${id} not found`);
        return null;
      }
      
      checkins[index] = { ...checkins[index], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(checkins));
      
      console.log(`[NET] Checkin ${id} updated`);
      return checkins[index];
    } catch (error) {
      console.error(`[NET] Error updating checkin ${id}:`, error);
      throw error;
    }
  }
  
  // Löscht einen Checkin
  async deleteCheckin(id: number): Promise<boolean> {
    try {
      const checkins = this.getAllCheckinsSync();
      const filtered = checkins.filter(checkin => checkin.id !== id);
      
      if (filtered.length === checkins.length) {
        console.warn(`[NET] Checkin ${id} not found`);
        return false;
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log(`[NET] Checkin ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`[NET] Error deleting checkin ${id}:`, error);
      return false;
    }
  }
  
  // Erstellt ein neues NET
  async createNet(netInfo: Omit<NetInfo, 'participants'>): Promise<NetInfo> {
    try {
      const nets = this.getAllNetsSync();
      
      // Prüfen ob NET bereits existiert
      const existing = nets.find(net => net.id === netInfo.id);
      if (existing) {
        throw new Error(`NET ${netInfo.id} already exists`);
      }
      
      const newNet: NetInfo = {
        ...netInfo,
        participants: 0
      };
      
      nets.push(newNet);
      localStorage.setItem(this.netsKey, JSON.stringify(nets));
      
      console.log(`[NET] Created new net ${netInfo.id}`);
      return newNet;
    } catch (error) {
      console.error('[NET] Error creating net:', error);
      throw error;
    }
  }
  
  // Holt alle NETs
  getAllNetsSync(): NetInfo[] {
    try {
      const data = localStorage.getItem(this.netsKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[NET] Error retrieving nets:', error);
      return [];
    }
  }
  
  // Holt ein bestimmtes NET
  getNetById(netId: string): NetInfo | null {
    const nets = this.getAllNetsSync();
    return nets.find(net => net.id === netId) || null;
  }
  
  // Aktualisiert ein NET
  async updateNet(netId: string, updates: Partial<NetInfo>): Promise<NetInfo | null> {
    try {
      const nets = this.getAllNetsSync();
      const index = nets.findIndex(net => net.id === netId);
      
      if (index === -1) {
        console.warn(`[NET] Net ${netId} not found`);
        return null;
      }
      
      nets[index] = { ...nets[index], ...updates };
      localStorage.setItem(this.netsKey, JSON.stringify(nets));
      
      console.log(`[NET] Net ${netId} updated`);
      return nets[index];
    } catch (error) {
      console.error(`[NET] Error updating net ${netId}:`, error);
      throw error;
    }
  }
  
  // Löscht ein NET
  async deleteNet(netId: string): Promise<boolean> {
    try {
      const nets = this.getAllNetsSync();
      const filtered = nets.filter(net => net.id !== netId);
      
      if (filtered.length === nets.length) {
        console.warn(`[NET] Net ${netId} not found`);
        return false;
      }
      
      localStorage.setItem(this.netsKey, JSON.stringify(filtered));
      
      // Auch alle Checkins für dieses NET löschen
      const checkins = this.getAllCheckinsSync();
      const remainingCheckins = checkins.filter(checkin => checkin.netId !== netId);
      localStorage.setItem(this.storageKey, JSON.stringify(remainingCheckins));
      
      console.log(`[NET] Net ${netId} deleted`);
      return true;
    } catch (error) {
      console.error(`[NET] Error deleting net ${netId}:`, error);
      return false;
    }
  }
  
  // Holt Teilnehmer eines NETs
  getNetParticipants(netId: string): NetCheckin[] {
    return this.getCheckinsByNet(netId);
  }
  
  // Berechnet Anzahl der Teilnehmer in einem NET
  getParticipantCount(netId: string): number {
    return this.getCheckinsByNet(netId).length;
  }
  
  // Setzt den Status eines NETs
  async setNetStatus(netId: string, status: NetInfo['status']): Promise<NetInfo | null> {
    return this.updateNet(netId, { status });
  }
  
  // Fügt einen Kommentar zu einem Checkin hinzu
  async addComment(checkinId: number, comment: string): Promise<NetCheckin | null> {
    const checkin = this.getAllCheckinsSync().find(c => c.id === checkinId);
    
    if (!checkin) {
      console.warn(`[NET] Checkin ${checkinId} not found`);
      return null;
    }
    
    const updates: Partial<NetCheckin> = {
      comment: checkin.comment ? `${checkin.comment}\n${comment}` : comment
    };
    
    return this.updateCheckin(checkinId, updates);
  }
  
  // Exportiert NET-Daten als JSON
  exportNetData(netId: string): string {
    const net = this.getNetById(netId);
    const checkins = this.getCheckinsByNet(netId);
    
    return JSON.stringify({
      net,
      checkins,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Importiert NET-Daten aus JSON
  importNetData(jsonData: string): { net: NetInfo | null; checkinsAdded: number } {
    try {
      const data = JSON.parse(jsonData);
      let netAdded: NetInfo | null = null;
      let checkinsAdded = 0;
      
      // NET importieren falls vorhanden
      if (data.net) {
        const existingNet = this.getNetById(data.net.id);
        if (!existingNet) {
          this.createNet(data.net);
          netAdded = data.net;
        }
      }
      
      // Checkins importieren falls vorhanden
      if (Array.isArray(data.checkins)) {
        const existingCheckins = this.getAllCheckinsSync();
        const newCheckins = data.checkins.filter(
          (newCheckin: NetCheckin) => !existingCheckins.some(
            existing => existing.id === newCheckin.id
          )
        );
        
        if (newCheckins.length > 0) {
          const allCheckins = [...existingCheckins, ...newCheckins];
          localStorage.setItem(this.storageKey, JSON.stringify(allCheckins));
          checkinsAdded = newCheckins.length;
        }
      }
      
      console.log(`[NET] Imported ${checkinsAdded} checkins`);
      return { net: netAdded, checkinsAdded };
    } catch (error) {
      console.error('[NET] Error importing data:', error);
      throw error;
    }
  }
}

// Export des Managers
export const netCheckinManager = new NetCheckinManager();

// Initialisierung
console.log('[NET] NetCheckinManager initialized');

// Beispiel für die Verwendung:
/*
// Neues NET erstellen
const net = await netCheckinManager.createNet({
  id: 'test-net-001',
  name: 'Test NET',
  description: 'Ein Test-NET für Entwicklung',
  startTime: Date.now(),
  organizer: 'DL1ABC',
  status: 'planned'
});

// Checkin hinzufügen
const checkin = await netCheckinManager.addCheckin({
  netId: 'test-net-001',
  callsign: 'DL2XYZ',
  status: 'checkin',
  location: {
    latitude: 51.5074,
    longitude: -0.1278,
    locator: 'IO91'
  }
});

// Checkins abrufen
const checkins = netCheckinManager.getCheckinsByNet('test-net-001');
console.log('Checkins:', checkins);
*/