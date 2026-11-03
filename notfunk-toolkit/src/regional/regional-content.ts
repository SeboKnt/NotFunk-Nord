// Regionale Inhalte für NotFunk-Nord
// Tipps, Wissen und Best Practices für Funkbetrieb in Deutschland/Nord

// Typdefinitionen
export interface RegionalTip {
  id: string;
  title: string;
  category: 'operation' | 'equipment' | 'regulations' | 'emergency' | 'contesting';
  content: string;
  region?: string; // z.B. 'DE' für Deutschland, 'SH' für Schleswig-Holstein
  frequency?: string; // Empfohlene Frequenzen
  applicableBands?: string[]; // z.B. ['2m', '70cm']
  lastUpdated: string; // ISO Datum
  source?: string; // Referenzquelle
}

export interface RegionalKnowledgeBase {
  tips: RegionalTip[];
  regulations: RegionalRegulation[];
  emergencyProcedures: EmergencyProcedure[];
  contestingGuidelines: ContestingGuideline[];
}

export interface RegionalRegulation {
  id: string;
  title: string;
  description: string;
  regulationNumber?: string;
  effectiveDate?: string;
  authority: 'BNetzA' | 'IARU' | 'DARC' | 'EU' | 'International';
  links?: string[]; // Offizielle Quellen
}

export interface EmergencyProcedure {
  id: string;
  scenario: string;
  procedure: string;
  contacts: Array<{
    name: string;
    callsign?: string;
    phone?: string;
    email?: string;
  }>;
  frequencies: string[]; // Notfallfrequenzen
  equipment?: string[]; // Benötigte Ausrüstung
}

export interface ContestingGuideline {
  id: string;
  name: string;
  description: string;
  rules: string[];
  recommendedFrequencies: Array<{
    band: string;
    frequency: number; // MHz
    mode: string;
  }>;
  exchangeInfo: string; // Was wird beim Contest ausgetauscht?
}

// Regionale Inhalte Manager
export class RegionalContentManager {
  private storageKey = 'regional_content';
  
  // Lade Standard-Inhalte für Deutschland/Nord
  getDefaultContent(): RegionalKnowledgeBase {
    return {
      tips: this.getDefaultTips(),
      regulations: this.getDefaultRegulations(),
      emergencyProcedures: this.getDefaultEmergencyProcedures(),
      contestingGuidelines: this.getDefaultContestingGuidelines()
    };
  }
  
  // Standard-Tipps für Funkbetrieb in Deutschland/Nord
  getDefaultTips(): RegionalTip[] {
    return [
      {
        id: 'tip-001',
        title: 'Standortabhängige Frequenzwahl',
        category: 'operation',
        content: `In Norddeutschland sind aufgrund der flachen Topografie und guten Ausbreitungsbedingungen insbesondere auf VHF/UHF (2m/70cm) oft sehr gute Verbindungen über große Entfernungen möglich.
        
Empfehlungen:
- 145.500 MHz Simplex-Sprechfrequenz
- 439.800 MHz Simplex-Sprechfrequenz
- Bei hoher Dichte an Repeatern auf Duplex-Betrieb achten`,
        region: 'DE',
        applicableBands: ['2m', '70cm'],
        lastUpdated: '2023-10-15'
      },
      {
        id: 'tip-002',
        title: 'Winterbetrieb in Norddeutschland',
        category: 'operation',
        content: `Im Winter können besondere Ausbreitungsbedingungen auftreten:
        
- Troposphärenduct (Tropo) ermöglicht Verbindungen bis weit über 1000km
- Aurora-Effekte bei geomagnetischen Stürmen
- Skip-Zone durch sporadische E-Lagen (Es)
- Frostbeeinflussung von Antennen und Koax-Leitungen beachten`,
        region: 'DE',
        lastUpdated: '2023-10-15'
      },
      {
        id: 'tip-003',
        title: 'Küstennähe Betrieb',
        category: 'operation',
        content: `Besonderheiten beim Funkbetrieb in Küstennähe:
        
- Starke Ausbreitung über Salzwasser (Long Path Effekte)
- Mehrwegeausbreitung durch Reflexion an Wasserfläche
- Seewinde kann Antennenmechanik beeinflussen
- Maritime Mobile Stationen (Schiffe) beachten`,
        region: 'DE',
        lastUpdated: '2023-10-15'
      },
      {
        id: 'tip-004',
        title: 'Handy-Abschirmung in Gebäuden',
        category: 'operation',
        content: `Norddeutsche Bürogebäude haben oft starke Handy-Abschirmung:
        
Empfehlungen:
- Hohe Gebäude mit direktem Zugang zur Dachfläche bevorzugen
- Fensterlose Räume vermeiden
- Außenantennen mit niedrigem Stehwellenverhältnis wählen
- FM-Transceiver mit guter Empfindlichkeit nutzen`,
        region: 'DE',
        lastUpdated: '2023-10-15'
      }
    ];
  }
  
  // Regionale Regelungen für Deutschland
  getDefaultRegulations(): RegionalRegulation[] {
    return [
      {
        id: 'reg-001',
        title: 'Begrenzung der Strahlungsleistung',
        description: `Nach BNetzA-Vorschriften ist die Strahlungsleistung auf 75 Watt begrenzt.`,
        regulationNumber: 'BNetzA-StrV §6',
        authority: 'BNetzA',
        links: ['https://www.bundesnetzagentur.de/SharedDocs/Downloads/DE/Sachgebiete/Telekommunikation/Unternehmen_Institutionen/Frequenzen/Amateurfunk/Amtsblatt/2018_11_2b_pdf.pdf']
      },
      {
        id: 'reg-002',
        title: 'Betriebsarten in verschiedenen Frequenzbereichen',
        description: `In Deutschland gelten im Amateurfunkdienst bestimmte Einschränkungen je nach Frequenzbereich.`,
        authority: 'BNetzA',
        links: ['https://www.bundesnetzagentur.de/DE/Fachthemen/Telekommunikation/Frequenzen/Amateurfunk/start.html']
      },
      {
        id: 'reg-003',
        title: 'Notfallfrequenzen und Prioritäten',
        description: `Während Katastrophen haben Rettungsdienste im Amateurfunk Vorrang.`,
        authority: 'BNetzA',
        links: ['https://www.amateurfunk-dh3wr.de/freq/notruf.html']
      }
    ];
  }
  
  // Standard-Notfallverfahren für Deutschland
  getDefaultEmergencyProcedures(): EmergencyProcedure[] {
    return [
      {
        id: 'emerg-001',
        scenario: 'Brandbekämpfung',
        procedure: `Bei Waldbränden oder anderen Bränden:
        
1. Unverzüglich 123 (Feuerwehr) rufen
2. Auf 145.500 MHz oder anderen Notfallfrequenzen melden
3. Informationen wie Standort, Größe und Windrichtung angeben
4. Feuerwehr als Relay-Station benutzen`,
        contacts: [
          { name: 'Leitstelle Feuerwehr', phone: '123' },
          { name: 'Regionaler ARV', callsign: 'DB0...' }
        ],
        frequencies: ['145.500', '439.800', '7.130', '14.300'],
        equipment: ['FM-Transceiver', 'Antenne', 'Notfallversorgung']
      },
      {
        id: 'emerg-002',
        scenario: 'Überschwemmung',
        procedure: `Bei Hochwasser:
        
1. Sofort Rettungsdienst 112 informieren
2. Auf Hochwassernotfrequenzen melden
3. Koordination über ARI (Amateurfunk-Rettungsdienst)`,
        contacts: [
          { name: 'Rettungsdienst', phone: '112' },
          { name: 'ARI Koordination', phone: '...' }
        ],
        frequencies: ['7.130', '14.300']
      }
    ];
  }
  
  // Contesting-Regeln für Deutschland
  getDefaultContestingGuidelines(): ContestingGuideline[] {
    return [
      {
        id: 'contest-001',
        name: 'CQ WW WPX Contest',
        description: `Weltweiter Kontestrufzeichen-Wettbewerb`,
        rules: [
          'Jeder Multiplier (Land/Zone) max. einmal pro Band/MODE',
          'Exchange: Seriennummer',
          'Nur vollständige QSOs zählen'
        ],
        recommendedFrequencies: [
          { band: '80m', frequency: 3.550, mode: 'CW' },
          { band: '40m', frequency: 7.130, mode: 'CW' },
          { band: '20m', frequency: 14.030, mode: 'CW' },
          { band: '15m', frequency: 21.030, mode: 'CW' },
          { band: '10m', frequency: 28.030, mode: 'CW' }
        ],
        exchangeInfo: 'Seriennummer'
      },
      {
        id: 'contest-002',
        name: 'DARC VHF-UHF Frühjahrs-Winter-Contest',
        description: `Deutscher VHF/UHF Contest`,
        rules: [
          'Deutsche Stationen tauschen DOK aus',
          'Europäische Stationen tauschen Locator aus',
          'Max. 100 QSOs pro Band pro Tag'
        ],
        recommendedFrequencies: [
          { band: '2m', frequency: 145.300, mode: 'SSB' },
          { band: '70cm', frequency: 432.300, mode: 'SSB' }
        ],
        exchangeInfo: 'DOK für DL-Stationen, Locator für DX'
      }
    ];
  }
  
  // Speichere regionale Inhalte
  saveContent(content: RegionalKnowledgeBase): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(content));
      console.log('[Regional] Content saved successfully');
    } catch (error) {
      console.error('[Regional] Error saving content:', error);
    }
  }
  
  // Lade regionale Inhalte
  loadContent(): RegionalKnowledgeBase | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Inhalte zurückgeben
      const defaultContent = this.getDefaultContent();
      this.saveContent(defaultContent);
      return defaultContent;
    } catch (error) {
      console.error('[Regional] Error loading content:', error);
      return null;
    }
  }
  
  // Hole Tipps für eine bestimmte Kategorie
  getTipsByCategory(category: RegionalTip['category']): RegionalTip[] {
    const content = this.loadContent();
    if (!content) return [];
    
    return content.tips.filter(tip => tip.category === category);
  }
  
  // Suche nach Tipps mit einem Suchbegriff
  searchTips(query: string): RegionalTip[] {
    const content = this.loadContent();
    if (!content) return [];
    
    const lowerQuery = query.toLowerCase();
    return content.tips.filter(tip => 
      tip.title.toLowerCase().includes(lowerQuery) ||
      tip.content.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Hole alle Notfallverfahren
  getAllEmergencyProcedures(): EmergencyProcedure[] {
    const content = this.loadContent();
    return content?.emergencyProcedures || [];
  }
  
  // Hole Contesting-Informationen
  getContestingGuidelines(): ContestingGuideline[] {
    const content = this.loadContent();
    return content?.contestingGuidelines || [];
  }
  
  // Aktualisiere einen bestehenden Tipp
  updateTip(updatedTip: RegionalTip): void {
    const content = this.loadContent();
    if (!content) return;
    
    const index = content.tips.findIndex(tip => tip.id === updatedTip.id);
    if (index >= 0) {
      content.tips[index] = updatedTip;
      this.saveContent(content);
      console.log(`[Regional] Tip ${updatedTip.id} updated`);
    }
  }
  
  // Füge einen neuen Tipp hinzu
  addTip(newTip: Omit<RegionalTip, 'lastUpdated'>): RegionalTip {
    const content = this.loadContent();
    if (!content) {
      throw new Error('Could not load content');
    }
    
    const tip: RegionalTip = {
      ...newTip,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    content.tips.push(tip);
    this.saveContent(content);
    
    console.log(`[Regional] New tip added: ${tip.title}`);
    return tip;
  }
}

// Export des Managers
export const regionalContentManager = new RegionalContentManager();

// Initialisierung
console.log('[Regional] RegionalContentManager initialized');

// Beispiel für die Verwendung:
/*
// Lade alle Inhalte
const content = regionalContentManager.loadContent();
console.log('Regional content loaded:', content);

// Hole Operations-Tipps
const operationTips = regionalContentManager.getTipsByCategory('operation');
console.log('Operation tips:', operationTips);

// Suche nach einem bestimmten Thema
const winterTips = regionalContentManager.searchTips('winter');
console.log('Winter-related tips:', winterTips);
*/