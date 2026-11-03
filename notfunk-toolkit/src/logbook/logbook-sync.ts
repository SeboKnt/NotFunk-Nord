// Logbuch Sync für NotFunk-Nord
// Synchronisation von Logbucheinträgen mit externen Diensten

// Typdefinitionen
export interface LogbookEntry {
  id?: number;
  date: string; // ISO Format
  time: string; // HHMM in UTC
  callsign: string;
  frequency: number; // MHz
  mode: string;
  rstSent: string;
  rstReceived: string;
  locator?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  comments?: string;
  qslStatus?: 'pending' | 'sent' | 'confirmed' | 'rejected';
  qslDate?: string; // ISO Format
  eqslStatus?: 'pending' | 'sent' | 'confirmed' | 'rejected';
  lotwStatus?: 'pending' | 'sent' | 'confirmed' | 'rejected';
  qrzStatus?: 'pending' | 'uploaded' | 'confirmed';
  syncStatus: 'pending' | 'synced' | 'failed';
  syncAttempts: number;
  lastSyncAttempt?: number;
}

// Sync-Status für externe Dienste
export interface ExternalSyncStatus {
  service: string;
  lastSync: number;
  entriesSynced: number;
  entriesFailed: number;
  errorMessage?: string;
}

// Logbuch Sync Manager
export class LogbookSyncManager {
  private storageKey = 'logbook_entries';
  private syncStatusKey = 'sync_status';
  
  // Fügt einen Logbucheintrag hinzu
  async addEntry(entry: Omit<LogbookEntry, 'id' | 'syncStatus' | 'syncAttempts'>): Promise<LogbookEntry> {
    try {
      const entries = this.getAllEntriesSync();
      
      // Neue ID generieren
      const newId = Date.now();
      const newEntry: LogbookEntry = {
        id: newId,
        syncStatus: 'pending',
        syncAttempts: 0,
        ...entry
      };
      
      entries.push(newEntry);
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
      
      console.log(`[Logbook] Entry added for ${entry.callsign} on ${entry.frequency} ${entry.mode}`);
      return newEntry;
    } catch (error) {
      console.error('[Logbook] Error adding entry:', error);
      throw error;
    }
  }
  
  // Holt alle Einträge
  getAllEntriesSync(): LogbookEntry[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Logbook] Error retrieving entries:', error);
      return [];
    }
  }
  
  // Holt Einträge nach Rufzeichen
  getEntriesByCallsign(callsign: string): LogbookEntry[] {
    const entries = this.getAllEntriesSync();
    return entries.filter(entry => entry.callsign === callsign);
  }
  
  // Holt Einträge nach Datum
  getEntriesByDate(date: string): LogbookEntry[] {
    const entries = this.getAllEntriesSync();
    return entries.filter(entry => entry.date === date);
  }
  
  // Holt Einträge nach Frequenzband
  getEntriesByBand(frequency: number): LogbookEntry[] {
    const entries = this.getAllEntriesSync();
    
    // Bestimme Band basierend auf Frequenz
    let band = '';
    if (frequency >= 1.8 && frequency < 2.0) band = '160m';
    else if (frequency >= 3.5 && frequency < 4.0) band = '80m';
    else if (frequency >= 7.0 && frequency < 7.3) band = '40m';
    else if (frequency >= 10.1 && frequency < 10.15) band = '30m';
    else if (frequency >= 14.0 && frequency < 14.35) band = '20m';
    else if (frequency >= 18.068 && frequency < 18.168) band = '17m';
    else if (frequency >= 21.0 && frequency < 21.45) band = '15m';
    else if (frequency >= 24.890 && frequency < 24.99) band = '12m';
    else if (frequency >= 28.0 && frequency < 29.7) band = '10m';
    else if (frequency >= 50.0 && frequency < 52.0) band = '6m';
    else if (frequency >= 144.0 && frequency < 148.0) band = '2m';
    else if (frequency >= 430.0 && frequency < 450.0) band = '70cm';
    else band = 'other';
    
    return entries.filter(entry => {
      const entryFreq = entry.frequency;
      let entryBand = '';
      if (entryFreq >= 1.8 && entryFreq < 2.0) entryBand = '160m';
      else if (entryFreq >= 3.5 && entryFreq < 4.0) entryBand = '80m';
      else if (entryFreq >= 7.0 && entryFreq < 7.3) entryBand = '40m';
      else if (entryFreq >= 10.1 && entryFreq < 10.15) entryBand = '30m';
      else if (entryFreq >= 14.0 && entryFreq < 14.35) entryBand = '20m';
      else if (entryFreq >= 18.068 && entryFreq < 18.168) entryBand = '17m';
      else if (entryFreq >= 21.0 && entryFreq < 21.45) entryBand = '15m';
      else if (entryFreq >= 24.890 && entryFreq < 24.99) entryBand = '12m';
      else if (entryFreq >= 28.0 && entryFreq < 29.7) entryBand = '10m';
      else if (entryFreq >= 50.0 && entryFreq < 52.0) entryBand = '6m';
      else if (entryFreq >= 144.0 && entryFreq < 148.0) entryBand = '2m';
      else if (entryFreq >= 430.0 && entryFreq < 450.0) entryBand = '70cm';
      else entryBand = 'other';
      
      return entryBand === band;
    });
  }
  
  // Aktualisiert einen Eintrag
  async updateEntry(id: number, updates: Partial<LogbookEntry>): Promise<LogbookEntry | null> {
    try {
      const entries = this.getAllEntriesSync();
      const index = entries.findIndex(entry => entry.id === id);
      
      if (index === -1) {
        console.warn(`[Logbook] Entry ${id} not found`);
        return null;
      }
      
      entries[index] = { ...entries[index], ...updates };
      localStorage.setItem(this.storageKey, JSON.stringify(entries));
      
      console.log(`[Logbook] Entry ${id} updated`);
      return entries[index];
    } catch (error) {
      console.error(`[Logbook] Error updating entry ${id}:`, error);
      throw error;
    }
  }
  
  // Löscht einen Eintrag
  async deleteEntry(id: number): Promise<boolean> {
    try {
      const entries = this.getAllEntriesSync();
      const filtered = entries.filter(entry => entry.id !== id);
      
      if (filtered.length === entries.length) {
        console.warn(`[Logbook] Entry ${id} not found`);
        return false;
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      console.log(`[Logbook] Entry ${id} deleted`);
      return true;
    } catch (error) {
      console.error(`[Logbook] Error deleting entry ${id}:`, error);
      return false;
    }
  }
  
  // Holt wartende Einträge zur Synchronisation
  getPendingEntries(): LogbookEntry[] {
    const entries = this.getAllEntriesSync();
    return entries.filter(entry => entry.syncStatus === 'pending');
  }
  
  // Markiert Eintrag als synchronisiert
  async markAsSynced(id: number): Promise<LogbookEntry | null> {
    return this.updateEntry(id, {
      syncStatus: 'synced',
      syncAttempts: 0,
      lastSyncAttempt: Date.now()
    });
  }
  
  // Markiert Eintrag als fehlgeschlagen
  async markAsFailed(id: number): Promise<LogbookEntry | null> {
    const entry = this.getAllEntriesSync().find(e => e.id === id);
    
    if (!entry) {
      console.warn(`[Logbook] Entry ${id} not found`);
      return null;
    }
    
    return this.updateEntry(id, {
      syncStatus: 'failed',
      syncAttempts: entry.syncAttempts + 1,
      lastSyncAttempt: Date.now()
    });
  }
  
  // Holt Sync-Status für externe Dienste
  getSyncStatus(service?: string): ExternalSyncStatus[] | ExternalSyncStatus | null {
    try {
      const data = localStorage.getItem(this.syncStatusKey);
      const statuses: ExternalSyncStatus[] = data ? JSON.parse(data) : [];
      
      if (service) {
        return statuses.find(s => s.service === service) || null;
      }
      
      return statuses;
    } catch (error) {
      console.error('[Logbook] Error retrieving sync status:', error);
      return service ? null : [];
    }
  }
  
  // Aktualisiert Sync-Status
  updateSyncStatus(status: ExternalSyncStatus): void {
    try {
      const statuses = this.getSyncStatus() as ExternalSyncStatus[] || [];
      const index = statuses.findIndex(s => s.service === status.service);
      
      if (index >= 0) {
        statuses[index] = status;
      } else {
        statuses.push(status);
      }
      
      localStorage.setItem(this.syncStatusKey, JSON.stringify(statuses));
      console.log(`[Logbook] Sync status updated for ${status.service}`);
    } catch (error) {
      console.error(`[Logbook] Error updating sync status for ${status.service}:`, error);
    }
  }
  
  // QSL-Karte senden
  async sendQSL(entryId: number): Promise<boolean> {
    try {
      const entry = this.getAllEntriesSync().find(e => e.id === entryId);
      
      if (!entry) {
        console.warn(`[Logbook] Entry ${entryId} not found`);
        return false;
      }
      
      // Simuliere QSL-Sendeoperation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aktualisiere Status
      await this.updateEntry(entryId, {
        qslStatus: 'sent',
        qslDate: new Date().toISOString().split('T')[0]
      });
      
      console.log(`[Logbook] QSL sent for entry ${entryId}`);
      return true;
    } catch (error) {
      console.error(`[Logbook] Error sending QSL for entry ${entryId}:`, error);
      return false;
    }
  }
  
  // eQSL hochladen
  async uploadEQSL(entryId: number): Promise<boolean> {
    try {
      const entry = this.getAllEntriesSync().find(e => e.id === entryId);
      
      if (!entry) {
        console.warn(`[Logbook] Entry ${entryId} not found`);
        return false;
      }
      
      // Simuliere eQSL-Upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aktualisiere Status
      await this.updateEntry(entryId, {
        eqslStatus: 'sent'
      });
      
      console.log(`[Logbook] eQSL uploaded for entry ${entryId}`);
      return true;
    } catch (error) {
      console.error(`[Logbook] Error uploading eQSL for entry ${entryId}:`, error);
      return false;
    }
  }
  
  // LoTW bestätigen
  async confirmLoTW(entryId: number): Promise<boolean> {
    try {
      const entry = this.getAllEntriesSync().find(e => e.id === entryId);
      
      if (!entry) {
        console.warn(`[Logbook] Entry ${entryId} not found`);
        return false;
      }
      
      // Simuliere LoTW-Bestätigung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aktualisiere Status
      await this.updateEntry(entryId, {
        lotwStatus: 'confirmed'
      });
      
      console.log(`[Logbook] LoTW confirmed for entry ${entryId}`);
      return true;
    } catch (error) {
      console.error(`[Logbook] Error confirming LoTW for entry ${entryId}:`, error);
      return false;
    }
  }
  
  // Exportiert Logbuch als ADIF
  exportADIF(): string {
    const entries = this.getAllEntriesSync();
    
    // ADIF Header
    let adif = `Generated by NotFunk-Nord Logbook\n<adif_ver:5>3.1.2\n<programid:15>NotFunk-Nord\n<programversion:5>1.0.0\n<created_timestamp:15>${new Date().toISOString().replace(/[-:]/g, '').replace('T', ' ').substring(0, 15)}\n<eor>\n\n`;
    
    // Einträge konvertieren
    entries.forEach(entry => {
      adif += `<call:${entry.callsign.length}>${entry.callsign}`;
      adif += `<qso_date:8>${entry.date.replace(/-/g, '')}`;
      adif += `<time_on:4>${entry.time}`;
      adif += `<freq:${entry.frequency.toString().length}>${entry.frequency}`;
      adif += `<mode:${entry.mode.length}>${entry.mode}`;
      adif += `<rst_sent:${entry.rstSent.length}>${entry.rstSent}`;
      adif += `<rst_rcvd:${entry.rstReceived.length}>${entry.rstReceived}`;
      
      if (entry.locator) {
        adif += `<gridsquare:${entry.locator.length}>${entry.locator}`;
      }
      
      if (entry.comments) {
        adif += `<comment:${entry.comments.length}>${entry.comments}`;
      }
      
      adif += '<eor>\n';
    });
    
    return adif;
  }
  
  // Importiert Logbuch aus ADIF
  importADIF(adifData: string): number {
    try {
      // Einfache ADIF-Parsing-Logik (könnte erweitert werden)
      const records = adifData.split('<eor>');
      let importedCount = 0;
      
      records.forEach(record => {
        if (record.trim() && !record.includes('Generated by NotFunk-Nord')) {
          // Extrahiere Felder (vereinfachte Version)
          const getField = (fieldName: string): string | null => {
            const regex = new RegExp(`<${fieldName}:(\\d+)>([^<]+)`, 'i');
            const match = record.match(regex);
            return match ? match[2] : null;
          };
          
          const callsign = getField('call');
          const date = getField('qso_date');
          const time = getField('time_on');
          const freq = getField('freq');
          const mode = getField('mode');
          const rstSent = getField('rst_sent') || '59';
          const rstRcvd = getField('rst_rcvd') || '59';
          const locator = getField('gridsquare');
          const comment = getField('comment');
          
          if (callsign && date && time && freq && mode) {
            // Konvertiere Datumsformat
            const formattedDate = `${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}`;
            
            // Füge Eintrag hinzu
            this.addEntry({
              date: formattedDate,
              time,
              callsign,
              frequency: parseFloat(freq),
              mode,
              rstSent,
              rstReceived: rstRcvd,
              locator: locator || undefined,
              comments: comment || undefined
            });
            
            importedCount++;
          }
        }
      });
      
      console.log(`[Logbook] Imported ${importedCount} entries from ADIF`);
      return importedCount;
    } catch (error) {
      console.error('[Logbook] Error importing ADIF data:', error);
      throw error;
    }
  }
  
  // Automatische Synchronisation
  async autoSync(): Promise<void> {
    console.log('[Logbook] Starting auto-sync');
    
    // Versuche fehlgeschlagene Einträge erneut
    const failedEntries = this.getAllEntriesSync().filter(
      entry => entry.syncStatus === 'failed' && entry.syncAttempts < 3
    );
    
    for (const entry of failedEntries) {
      // Hier würden echte Sync-Operationen stattfinden
      console.log(`[Logbook] Retrying sync for entry ${entry.id}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.markAsSynced(entry.id!);
    }
    
    // Synchronisiere neue Einträge
    const pendingEntries = this.getPendingEntries();
    
    for (const entry of pendingEntries) {
      // Hier würden echte Sync-Operationen stattfinden
      console.log(`[Logbook] Syncing entry ${entry.id}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      await this.markAsSynced(entry.id!);
    }
    
    // Aktualisiere Sync-Status
    this.updateSyncStatus({
      service: 'auto-sync',
      lastSync: Date.now(),
      entriesSynced: pendingEntries.length + failedEntries.length,
      entriesFailed: 0
    });
    
    console.log('[Logbook] Auto-sync completed');
  }
}

// Export des Managers
export const logbookSyncManager = new LogbookSyncManager();

// Initialisierung
console.log('[Logbook] LogbookSyncManager initialized');

// Beispiel für die Verwendung:
/*
// Neuen Eintrag hinzufügen
const entry = await logbookSyncManager.addEntry({
  date: '2023-10-15',
  time: '1430',
  callsign: 'DL1ABC',
  frequency: 14.250,
  mode: 'SSB',
  rstSent: '59',
  rstReceived: '59',
  locator: 'JO31',
  comments: 'First contact after rig repair'
});

// ADIF exportieren
const adif = logbookSyncManager.exportADIF();
console.log('ADIF Export:', adif);

// Automatische Synchronisation
await logbookSyncManager.autoSync();
*/