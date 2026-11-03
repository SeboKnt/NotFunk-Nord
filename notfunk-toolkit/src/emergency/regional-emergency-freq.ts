// Regionale Notfallfrequenzen für NotFunk-Nord
// Notfallfrequenzen für Feuerwehr, Polizei, THW und Rettungsdienste in Deutschland

// Typdefinitionen
export interface EmergencyFrequency {
  id: string;
  service: 'fire' | 'police' | 'thw' | 'medical' | 'civil_protection' | 'military';
  name: string;
  frequency: number; // MHz
  mode: 'AM' | 'FM' | 'USB' | 'LSB' | 'NFM' | 'DIG';
  description?: string;
  coverageArea?: string; // z.B. 'Hamburg', 'Schleswig-Holstein'
  priority: 'primary' | 'secondary' | 'regional';
  notes?: string[];
  lastVerified: string; // ISO Datum
}

export interface EmergencyFrequencyGroup {
  groupName: string;
  description: string;
  frequencies: EmergencyFrequency[];
}

export interface EmergencyContact {
  id: string;
  organization: string;
  serviceName: string;
  callsign?: string;
  frequency?: number; // MHz
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  notes?: string[];
}

// Regionale Notfallfrequenzen Manager
export class RegionalEmergencyFrequencies {
  private storageKey = 'emergency_frequencies';
  private contactsKey = 'emergency_contacts';
  
  // Standard Notfallfrequenzen für Deutschland/Nord
  getDefaultFrequencies(): EmergencyFrequencyGroup[] {
    return [
      {
        groupName: 'Feuerwehr',
        description: 'Notfallfrequenzen der Feuerwehr in Deutschland',
        frequencies: [
          {
            id: 'fw-001',
            service: 'fire',
            name: 'Feuerwehr Sprechfunk',
            frequency: 174.425,
            mode: 'FM',
            description: 'Standardfeuerwehrfrequenz in vielen Regionen',
            priority: 'primary',
            notes: [
              'Nationales Notfallsprechfunk-Netz (NNN)',
              'Technische Mindestanforderungen nach BNetzA-Richtlinie',
              'Kanalabstand 6,25 kHz'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'fw-002',
            service: 'fire',
            name: 'Feuerwehr Sprechfunk Reserve',
            frequency: 174.450,
            mode: 'FM',
            description: 'Reservefrequenz für Feuerwehreinsätze',
            priority: 'secondary',
            notes: [
              'Nur bei Störungen der Primärfrequenz verwenden',
              'Koordination über Leitstelle erforderlich'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'fw-003',
            service: 'fire',
            name: 'Feuerwehr Sprechfunk Digital',
            frequency: 380.025,
            mode: 'DIG',
            description: 'Digitale Feuerwehrfrequenz (D-Star, DMR)',
            priority: 'primary',
            notes: [
              'Modernisierung des Feuerwehrfunks',
              'Unterstützt Sprache und Datenübertragung'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      },
      {
        groupName: 'Polizei',
        description: 'Notfallfrequenzen der Polizei in Deutschland',
        frequencies: [
          {
            id: 'pol-001',
            service: 'police',
            name: 'Polizei Notruffunk',
            frequency: 174.525,
            mode: 'FM',
            description: 'Polizeiliche Notrufsprechfunkstelle',
            priority: 'primary',
            notes: [
              'Für dringende polizeiliche Einsätze',
              'Priorität vor Feuerwehrfrequenzen'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      },
      {
        groupName: 'THW',
        description: 'Notfallfrequenzen des Technischen Hilfswerks',
        frequencies: [
          {
            id: 'thw-001',
            service: 'thw',
            name: 'THW Einsatzfunk',
            frequency: 174.550,
            mode: 'FM',
            description: 'Hauptfrequenz für THW-Einsätze',
            priority: 'primary',
            notes: [
              'Nationale THW-Einsatzfrequenz',
              'Verwendung bei Katastrophen und Unfällen'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'thw-002',
            service: 'thw',
            name: 'THW Katastrophenfunk',
            frequency: 174.575,
            mode: 'FM',
            description: 'Reservefrequenz für größere Katastrophen',
            priority: 'secondary',
            notes: [
              'Nur bei Überlastung der Hauptfrequenz',
              'Koordination über THW-Landesstellen'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      },
      {
        groupName: 'Medizinischer Dienst',
        description: 'Notfallfrequenzen für Rettungsdienste',
        frequencies: [
          {
            id: 'med-001',
            service: 'medical',
            name: 'Rettungsdienst Notfunk',
            frequency: 174.600,
            mode: 'FM',
            description: 'Notrufsprechfunk für Rettungsdienste',
            priority: 'primary',
            notes: [
              'Integriert in das Notfallsprechfunk-Netz',
              'Priorität bei medizinischen Notfällen'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      },
      {
        groupName: 'Bevölkerungsschutz',
        description: 'Notfallfrequenzen für Katastrophenschutz',
        frequencies: [
          {
            id: 'bsp-001',
            service: 'civil_protection',
            name: 'Bevölkerungsschutz',
            frequency: 174.625,
            mode: 'FM',
            description: 'Frequenz für Bevölkerungsschutzmaßnahmen',
            priority: 'primary',
            notes: [
              'Verwendung bei Katastrophen',
              'Koordination mit allen Behörden'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      },
      {
        groupName: 'Amateurfunk im Notfall',
        description: 'Notfallfrequenzen für Amateurfunker im Katastrophenfall',
        frequencies: [
          {
            id: 'af-001',
            service: 'civil_protection',
            name: 'Amateurfunk Notfallfrequenz 80m',
            frequency: 3.755,
            mode: 'USB',
            description: 'Amateurfunk Notfallverkehr im 80m-Band',
            priority: 'primary',
            notes: [
              'Nur im Katastrophenfall zu verwenden',
              'Priorität für Notfallkommunikation',
              'Keine privaten Gespräche'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'af-002',
            service: 'civil_protection',
            name: 'Amateurfunk Notfallfrequenz 2m',
            frequency: 145.500,
            mode: 'FM',
            description: 'Amateurfunk Simplexfrequenz für Notfälle',
            priority: 'primary',
            notes: [
              'Internationale Notfallfrequenz für VHF',
              'Verwendung bei örtlichen Notfällen',
              'Relay durch Repeatern möglich'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'af-003',
            service: 'civil_protection',
            name: 'Amateurfunk Notfallfrequenz 70cm',
            frequency: 439.800,
            mode: 'FM',
            description: 'Amateurfunk Simplexfrequenz für Notfälle',
            priority: 'primary',
            notes: [
              'Internationale Notfallfrequenz für UHF',
              'Verwendung bei örtlichen Notfällen',
              'Hohe örtliche Verfügbarkeit'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'af-004',
            service: 'civil_protection',
            name: 'Amateurfunk Notfallfrequenz 40m',
            frequency: 7.130,
            mode: 'USB',
            description: 'Amateurfunk Notfallfrequenz im 40m-Band',
            priority: 'primary',
            notes: [
              'Verwendung bei regionalen Notfällen',
              'Gute Ausbreitung tagsüber',
              'Koordination über Netzes'
            ],
            lastVerified: '2023-10-15'
          },
          {
            id: 'af-005',
            service: 'civil_protection',
            name: 'Amateurfunk Notfallfrequenz 20m',
            frequency: 14.300,
            mode: 'USB',
            description: 'Amateurfunk Notfallfrequenz im 20m-Band',
            priority: 'primary',
            notes: [
              'Verwendung bei regionalen Notfällen',
              'Gute DX-Ausbreitung tagsüber',
              'Wichtig für Koordination über größere Entfernungen'
            ],
            lastVerified: '2023-10-15'
          }
        ]
      }
    ];
  }
  
  // Standard Notfallkontakte
  getDefaultContacts(): EmergencyContact[] {
    return [
      {
        id: 'kontakt-001',
        organization: 'Landesamt für Verfassungsschutz',
        serviceName: 'Amateurfunk im Bevölkerungsschutz',
        phone: '040 123456',
        email: 'amateurfunk@verfassungsschutz.sh',
        website: 'https://www.verfassungsschutz.sh',
        address: 'Musterallee 1, 20000 Hamburg',
        notes: [
          'Kontaktperson: DL1ABC',
          'Amateurfunk-Koordination für Hamburg'
        ]
      },
      {
        id: 'kontakt-002',
        organization: 'Feuerwehr Hamburg',
        serviceName: 'Einsatzzentrale',
        phone: '112',
        frequency: 174.425,
        notes: [
          'Automatisierte Alarmierung',
          'Direktverbindungen zu Hauptwachen'
        ]
      },
      {
        id: 'kontakt-003',
        organization: 'THW Landesstelle Hamburg',
        serviceName: 'Einsatzleitung',
        phone: '040 987654',
        frequency: 174.550,
        email: 'einsatzleitung@thw-hamburg.de',
        website: 'https://www.thw-hamburg.de',
        address: 'Musterstraße 42, 22000 Hamburg'
      },
      {
        id: 'kontakt-004',
        organization: 'Polizei Hamburg',
        serviceName: 'Notrufzentrale',
        phone: '110',
        frequency: 174.525
      },
      {
        id: 'kontakt-005',
        organization: 'Rettungsdienst Hamburg',
        serviceName: 'Leitstelle',
        phone: '112',
        frequency: 174.600
      }
    ];
  }
  
  // Speichere Notfallfrequenzen
  saveFrequencies(groups: EmergencyFrequencyGroup[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(groups));
      console.log('[Emergency] Frequencies saved successfully');
    } catch (error) {
      console.error('[Emergency] Error saving frequencies:', error);
    }
  }
  
  // Lade Notfallfrequenzen
  loadFrequencies(): EmergencyFrequencyGroup[] | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Frequenzen zurückgeben
      const defaultFreqs = this.getDefaultFrequencies();
      this.saveFrequencies(defaultFreqs);
      return defaultFreqs;
    } catch (error) {
      console.error('[Emergency] Error loading frequencies:', error);
      return null;
    }
  }
  
  // Speichere Notfallkontakte
  saveContacts(contacts: EmergencyContact[]): void {
    try {
      localStorage.setItem(this.contactsKey, JSON.stringify(contacts));
      console.log('[Emergency] Contacts saved successfully');
    } catch (error) {
      console.error('[Emergency] Error saving contacts:', error);
    }
  }
  
  // Lade Notfallkontakte
  loadContacts(): EmergencyContact[] | null {
    try {
      const data = localStorage.getItem(this.contactsKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Kontakte zurückgeben
      const defaultContacts = this.getDefaultContacts();
      this.saveContacts(defaultContacts);
      return defaultContacts;
    } catch (error) {
      console.error('[Emergency] Error loading contacts:', error);
      return null;
    }
  }
  
  // Suche Frequenzen nach Service
  getFrequenciesByService(service: EmergencyFrequency['service']): EmergencyFrequency[] {
    const groups = this.loadFrequencies();
    if (!groups) return [];
    
    const results: EmergencyFrequency[] = [];
    groups.forEach(group => {
      group.frequencies.forEach(freq => {
        if (freq.service === service) {
          results.push(freq);
        }
      });
    });
    
    return results;
  }
  
  // Suche Frequenzen nach Priorität
  getFrequenciesByPriority(priority: EmergencyFrequency['priority']): EmergencyFrequency[] {
    const groups = this.loadFrequencies();
    if (!groups) return [];
    
    const results: EmergencyFrequency[] = [];
    groups.forEach(group => {
      group.frequencies.forEach(freq => {
        if (freq.priority === priority) {
          results.push(freq);
        }
      });
    });
    
    return results;
  }
  
  // Hole Frequenz nach ID
  getFrequencyById(id: string): EmergencyFrequency | null {
    const groups = this.loadFrequencies();
    if (!groups) return null;
    
    for (const group of groups) {
      const freq = group.frequencies.find(f => f.id === id);
      if (freq) return freq;
    }
    
    return null;
  }
  
  // Hole Kontakt nach ID
  getContactById(id: string): EmergencyContact | null {
    const contacts = this.loadContacts();
    if (!contacts) return null;
    
    return contacts.find(contact => contact.id === id) || null;
  }
  
  // Suche Kontakte nach Organisation
  getContactsByOrganization(org: string): EmergencyContact[] {
    const contacts = this.loadContacts();
    if (!contacts) return [];
    
    return contacts.filter(contact => 
      contact.organization.toLowerCase().includes(org.toLowerCase())
    );
  }
  
  // Hole alle primären Frequenzen
  getPrimaryFrequencies(): EmergencyFrequency[] {
    return this.getFrequenciesByPriority('primary');
  }
  
  // Exportiere Notfallfrequenzen als JSON
  exportEmergencyData(): string {
    const frequencies = this.loadFrequencies();
    const contacts = this.loadContacts();
    
    return JSON.stringify({
      frequencies,
      contacts,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Importiere Notfallfrequenzen aus JSON
  importEmergencyData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.frequencies) {
        this.saveFrequencies(data.frequencies);
      }
      
      if (data.contacts) {
        this.saveContacts(data.contacts);
      }
      
      console.log('[Emergency] Emergency data imported successfully');
      return true;
    } catch (error) {
      console.error('[Emergency] Error importing emergency data:', error);
      return false;
    }
  }
  
  // Schnellsuche nach Frequenz
  searchByFrequency(frequency: number, tolerance: number = 0.005): EmergencyFrequency[] {
    const groups = this.loadFrequencies();
    if (!groups) return [];
    
    const results: EmergencyFrequency[] = [];
    groups.forEach(group => {
      group.frequencies.forEach(freq => {
        if (Math.abs(freq.frequency - frequency) <= tolerance) {
          results.push(freq);
        }
      });
    });
    
    return results;
  }
  
  // Suche nach Stichwort
  searchByText(query: string): {
    frequencies: EmergencyFrequency[];
    contacts: EmergencyContact[];
  } {
    const groups = this.loadFrequencies();
    const contacts = this.loadContacts();
    
    const lowerQuery = query.toLowerCase();
    
    // Frequenzen durchsuchen
    const freqResults: EmergencyFrequency[] = [];
    if (groups) {
      groups.forEach(group => {
        group.frequencies.forEach(freq => {
          if (
            freq.name.toLowerCase().includes(lowerQuery) ||
            freq.description?.toLowerCase().includes(lowerQuery) ||
            freq.notes?.some(note => note.toLowerCase().includes(lowerQuery))
          ) {
            freqResults.push(freq);
          }
        });
      });
    }
    
    // Kontakte durchsuchen
    const contactResults: EmergencyContact[] = [];
    if (contacts) {
      contacts.forEach(contact => {
        if (
          contact.organization.toLowerCase().includes(lowerQuery) ||
          contact.serviceName.toLowerCase().includes(lowerQuery) ||
          contact.notes?.some(note => note.toLowerCase().includes(lowerQuery))
        ) {
          contactResults.push(contact);
        }
      });
    }
    
    return {
      frequencies: freqResults,
      contacts: contactResults
    };
  }
}

// Export des Managers
export const emergencyFrequencies = new RegionalEmergencyFrequencies();

// Initialisierung
console.log('[Emergency] RegionalEmergencyFrequencies initialized');

// Beispiel für die Verwendung:
/*
// Lade alle Notfallfrequenzen
const frequencyGroups = emergencyFrequencies.loadFrequencies();
console.log('Emergency frequency groups:', frequencyGroups);

// Hole alle primären Frequenzen
const primaryFreqs = emergencyFrequencies.getPrimaryFrequencies();
console.log('Primary frequencies:', primaryFreqs);

// Suche nach Frequenzen für Feuerwehr
const fireFreqs = emergencyFrequencies.getFrequenciesByService('fire');
console.log('Fire department frequencies:', fireFreqs);

// Suche nach Notfallkontakten
const contacts = emergencyFrequencies.loadContacts();
console.log('Emergency contacts:', contacts);

// Schnellsuche nach einer Frequenz
const results = emergencyFrequencies.searchByFrequency(174.425);
console.log('Search results for 174.425 MHz:', results);
*/