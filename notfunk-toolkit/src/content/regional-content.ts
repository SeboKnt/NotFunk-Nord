// Regionale Inhalte und Tipps für NotFunk-Nord
// Lokale Kenntnisse und bewährte Verfahren für norddeutsche Amateurfunker

// Typdefinitionen
export interface RegionalTip {
  id: string;
  title: string;
  category: 'operation' | 'equipment' | 'regulations' | 'contesting' | 'dx' | 'emergency';
  content: string;
  author?: string;
  updatedAt: string; // ISO Datum
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  references?: string[]; // Links zu weiterführenden Informationen
}

export interface RegionalKnowledgeBase {
  tips: RegionalTip[];
  contributors: string[];
  lastUpdated: string;
}

// Regionale Inhalte Manager
export class RegionalContentManager {
  private storageKey = 'regional_content';
  private contributorKey = 'contributors';
  
  // Standard regionale Tipps für Norddeutschland
  getDefaultTips(): RegionalTip[] {
    return [
      {
        id: 'tip-001',
        title: 'Betrieb auf 80m in Norddeutschland',
        category: 'operation',
        content: `Im 80m-Band (3.5-3.8 MHz) gibt es in Norddeutschland einige Besonderheiten:
        
        Frequenzverteilung:
        - 3.500-3.510 MHz: CW-QRP-Betrieb (besonders beliebt bei Contesten)
        - 3.630-3.650 MHz: FT8-Digitale Betrieb (hoher Traffic)
        - 3.700-3.800 MHz: SSB-Betrieb (Split-Betrieb oft erforderlich)
        
        Hinweise:
        - Tagsüber auf höhere Frequenzen (>3.6 MHz) bevorzugen
        - Bei starkem Aurora-Skip auch 3.5 MHz nutzbar
        - Antennenresonanz in diesem Band oft kritisch (z.B. Dipol: ~40m Länge)
        
        Bewährte Praxis:
        - Split-Betrieb bei Contesten mit +5 kHz
        - QRP-Betrieb im unteren Teil des Bands`,
        author: 'DL1ABC',
        updatedAt: '2023-10-15',
        tags: ['80m', 'cw', 'ssb', 'contest', 'antenna'],
        difficulty: 'intermediate',
        references: [
          'https://www.darc.de/der-club/referate/afu/frequenzbereiche/',
          'https://www.qsl.net/dl1bav/'
        ]
      },
      {
        id: 'tip-002',
        title: 'VHF/UHF-Betrieb in Norddeutschland',
        category: 'operation',
        content: `Norddeutschland bietet besondere Möglichkeiten im VHF/UHF-Betrieb:
        
        2m-Band (144-146 MHz):
        - Relaisbetrieb: 145.6-145.8 MHz
        - E-Skip zu England/Dänemark möglich (besonders Sommer)
        - Satellitenbetrieb: AO-92, SO-50
        
        70cm-Band (430-450 MHz):
        - Breites Relaisnetz (besonders Hamburg/Kiel Umgebung)
        - ATV-Betrieb ab 436 MHz
        - Digitalmodulationen wie D-Star, DMR
        
        Antennentipps:
        - Yagi-Antennen für DX-Betrieb geeignet
        - Mobile Antennen: Magnetfuß oder Fiberglas
        - Beachball-Yagis für Portabelbetrieb effektiv
        
        Lokale Besonderheiten:
        - Nordlicht-Effekte können Ausbreitung verbessern
        - Seefunk kann Störungen verursachen`,
        author: 'DK2XYZ',
        updatedAt: '2023-10-15',
        tags: ['vhf', 'uhf', 'satellite', 'mobile', 'antenna'],
        difficulty: 'beginner',
        references: [
          'https://www.afuwiki.de/wiki/index.php/HF_Funksprüche',
          'https://www.ukw.de/'
        ]
      },
      {
        id: 'tip-003',
        title: 'Winterbetrieb mit Batterieversorgung',
        category: 'equipment',
        content: `Im Winter sinken Temperaturen in Norddeutschland unter 0°C, was Batterien beeinträchtigt:
        
        Akku-Charakteristik:
        - Li-Ion-Akkus: Leistung reduziert sich unter -10°C
        - NiMH-Akkus: Verlieren schnell Kapazität bei Kälte
        - Blei-Gel-Akkus: Robust gegen Kälte aber schwer
        
        Empfehlungen:
        - Tragbare Stationen: LiFePO4-Akkus (guter Kälteschutz)
        - Reserveakkus warm halten (Isoliertasche)
        - Ladegeräte für niedrige Temperaturen nutzen
        
        Heizung der Geräte:
        - Yaesu/Generic Heizkörper für Rig
        - Isolierte Shack-Umgebung
        - Power-supply Heizung für stabile Spannung
        
        Field-Day Erfahrung:
        - Mindestens 30% mehr Kapazität einplanen
        - Externe Powerbank als Backup
        - Kurzschluss-Schutz wichtig bei Kondenswasser`,
        author: 'DL3DEF',
        updatedAt: '2023-10-15',
        tags: ['battery', 'winter', 'portable', 'power'],
        difficulty: 'intermediate',
        references: [
          'https://www.batteryuniversity.com/article/bu-503-how-to-charge-non-lithium-batteries',
          'https://www.eham.net/ehamforum/smf/index.php?topic=109596.0'
        ]
      },
      {
        id: 'tip-004',
        title: 'DX-Führerschein nach Klasse E',
        category: 'regulations',
        content: `Mit der Amateurfunkklasse E gelten besondere Privilegien und Regeln in Norddeutschland:
        
        Frequenzbereiche:
        - 160m-10m komplett verfügbar (-5W EIRP in Klasse A)
        - 6m-70cm vollständiger Zugriff
        
        Technische Anforderungen:
        - Selbstbaugeräte erlaubt bis 500W Ausgangsleistung
        - Experimentelle Antennen (z.B. Windom, Off-Center-Fed)
        - Digitale Modulation eigener Entwicklung
        
        Praktische Aspekte:
        - Kein Rufzeichenzwang bei internationalem Betrieb
        - Experimentelle Datenübertragung (z.B. HF-Packet-Radio)
        - Satellitenexperimente (z.B. APRS-IS Gateway)
        
        Wichtige Dokumentation:
        - Technisches Tagebuch für Experimente
        - Frequenzmessungen dokumentieren
        - Selbstbau-Konstruktionsunterlagen aufbewahren
        
        Compliance-Tipps:
        - BNetzA-Richtlinien beachten
        - EMV-Vorschriften einhalten
        - Nachbarschutz berücksichtigen`,
        author: 'DG4HIJ',
        updatedAt: '2023-10-15',
        tags: ['license', 'regulations', 'experiment', 'power'],
        difficulty: 'advanced',
        references: [
          'https://www.bundesnetzagentur.de/DE/Sachgebiete/Telekommunikation/Unternehmen_Institutionen/Frequenzen/Amateurfunk/Amateurfunk_node.html',
          'https://www.darc-rsgp.de/'
        ]
      },
      {
        id: 'tip-005',
        title: 'Portabler Betrieb an der Nordsee',
        category: 'operation',
        content: `Die Nordseeküste bietet besondere Möglichkeiten und Herausforderungen für Portabelbetrieb:
        
        Standorte:
        - Helgoland (besonders DX)
        - Sylt-Ost (freie Sicht zum Meer)
        - Dithmarschen Küstenbereich
        
        Antennenaufbau:
        - Windlast beachten (>100 km/h)
        - Korrosion durch Salzwasser
        - Erdung in feuchtem Sand schwierig
        
        Frequenzen:
        - 20m besonders effektiv wegen Wasserweg
        - 40m für lokale Kommunikation
        - 10m bei guten Bedingungen (EU-Kontinent)
        
        Zubehör:
        - Wasserfester Rig-Cover
        - Seetaugliche Stromversorgung
        - Antennenanker für Sanddünen
        
        Sicherheit:
        - Flutzeiten beachten
        - Seewettervorhersage regelmäßrig prüfen
        - Seenotrettung informieren (VHF Kanal 16)`,
        author: 'PD1KLM',
        updatedAt: '2023-10-15',
        tags: ['portable', 'marine', 'antenna', 'safety'],
        difficulty: 'intermediate',
        references: [
          'https://www.dxnews.com/articles/10848.shtml',
          'https://www.seewetter.info/'
        ]
      }
    ];
  }
  
  // Hole Standard-Mitwirkende
  getDefaultContributors(): string[] {
    return [
      'DL1ABC',
      'DK2XYZ',
      'DL3DEF',
      'DG4HIJ',
      'PD1KLM'
    ];
  }
  
  // Speichere regionale Inhalte
  saveRegionalContent(content: RegionalKnowledgeBase): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(content));
      console.log('[Content] Regional content saved successfully');
    } catch (error) {
      console.error('[Content] Error saving regional content:', error);
    }
  }
  
  // Lade regionale Inhalte
  loadRegionalContent(): RegionalKnowledgeBase | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Inhalte zurückgeben
      const defaultContent: RegionalKnowledgeBase = {
        tips: this.getDefaultTips(),
        contributors: this.getDefaultContributors(),
        lastUpdated: new Date().toISOString()
      };
      
      this.saveRegionalContent(defaultContent);
      return defaultContent;
    } catch (error) {
      console.error('[Content] Error loading regional content:', error);
      return null;
    }
  }
  
  // Füge neuen Tipp hinzu
  addTip(tip: RegionalTip): void {
    const content = this.loadRegionalContent();
    if (!content) return;
    
    // Prüfen ob ID bereits existiert
    const existingIndex = content.tips.findIndex(t => t.id === tip.id);
    if (existingIndex >= 0) {
      content.tips[existingIndex] = tip;
    } else {
      content.tips.push(tip);
    }
    
    content.lastUpdated = new Date().toISOString();
    this.saveRegionalContent(content);
    console.log(`[Content] Tip ${tip.id} added/updated`);
  }
  
  // Entferne Tipp
  removeTip(id: string): void {
    const content = this.loadRegionalContent();
    if (!content) return;
    
    const initialLength = content.tips.length;
    content.tips = content.tips.filter(tip => tip.id !== id);
    
    if (content.tips.length < initialLength) {
      content.lastUpdated = new Date().toISOString();
      this.saveRegionalContent(content);
      console.log(`[Content] Tip ${id} removed`);
    }
  }
  
  // Suche Tipps nach Kategorie
  getTipsByCategory(category: RegionalTip['category']): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    return content.tips.filter(tip => tip.category === category);
  }
  
  // Suche Tipps nach Schwierigkeit
  getTipsByDifficulty(difficulty: RegionalTip['difficulty']): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    return content.tips.filter(tip => tip.difficulty === difficulty);
  }
  
  // Suche Tipps nach Tags
  getTipsByTag(tag: string): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    return content.tips.filter(tip => tip.tags.includes(tag));
  }
  
  // Suche Tipps mit Textsuche
  searchTips(query: string): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    const lowerQuery = query.toLowerCase();
    return content.tips.filter(tip => 
      tip.title.toLowerCase().includes(lowerQuery) ||
      tip.content.toLowerCase().includes(lowerQuery) ||
      tip.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
  
  // Hole Tipp nach ID
  getTipById(id: string): RegionalTip | null {
    const content = this.loadRegionalContent();
    if (!content) return null;
    
    return content.tips.find(tip => tip.id === id) || null;
  }
  
  // Hole Mitwirkende
  getContributors(): string[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    return content.contributors;
  }
  
  // Füge Mitwirkenden hinzu
  addContributor(contributor: string): void {
    const content = this.loadRegionalContent();
    if (!content) return;
    
    if (!content.contributors.includes(contributor)) {
      content.contributors.push(contributor);
      content.lastUpdated = new Date().toISOString();
      this.saveRegionalContent(content);
      console.log(`[Content] Contributor ${contributor} added`);
    }
  }
  
  // Exportiere regionale Inhalte als JSON
  exportRegionalContent(): string {
    const content = this.loadRegionalContent();
    
    return JSON.stringify({
      content,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Importiere regionale Inhalte aus JSON
  importRegionalContent(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.content) {
        this.saveRegionalContent(data.content);
      }
      
      console.log('[Content] Regional content imported successfully');
      return true;
    } catch (error) {
      console.error('[Content] Error importing regional content:', error);
      return false;
    }
  }
  
  // Generiere monatliche Tippsammlung
  generateMonthlyTips(month: number, year: number): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    // Filtere Tipps nach Erstellungsdatum/Update
    const monthTips = content.tips.filter(tip => {
      const tipDate = new Date(tip.updatedAt);
      return tipDate.getMonth() === month && tipDate.getFullYear() === year;
    });
    
    return monthTips.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  // Hole neueste Tipps
  getLatestTips(limit: number = 5): RegionalTip[] {
    const content = this.loadRegionalContent();
    if (!content) return [];
    
    return content.tips
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}

// Export des Managers
export const regionalContentManager = new RegionalContentManager();

// Initialisierung
console.log('[Content] RegionalContentManager initialized');

// Beispiel für die Verwendung:
/*
// Lade alle regionalen Inhalte
const content = regionalContentManager.loadRegionalContent();
console.log('Regional content:', content);

// Suche nach Tipps in der Kategorie 'operation'
const operationTips = regionalContentManager.getTipsByCategory('operation');
console.log('Operation tips:', operationTips);

// Suche nach Einsteiger-Tipps
const beginnerTips = regionalContentManager.getTipsByDifficulty('beginner');
console.log('Beginner tips:', beginnerTips);

// Textsuche
const searchResults = regionalContentManager.searchTips('80m');
console.log('Search results for "80m":', searchResults);
*/