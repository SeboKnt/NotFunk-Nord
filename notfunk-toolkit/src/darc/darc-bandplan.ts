// DARC Bandpläne und VFO-Einstellungen für NotFunk-Nord
// Frequenzbereiche und Betriebsarten nach DARC-Empfehlungen

// Typdefinitionen
export interface DarcBand {
  band: string; // z.B. '80m', '40m', '20m', '17m', '15m', '12m', '10m', '6m', '2m', '70cm'
  frequencyRange: {
    start: number; // MHz
    end: number;   // MHz
  };
  recommendedModes: Array<{
    mode: string; // z.B. 'CW', 'SSB', 'FT8', 'FT4', 'DIGI'
    frequencyRange: {
      start: number; // MHz
      end: number;   // MHz
    };
  }>;
  simplexChannels?: Array<{
    frequency: number; // MHz
    mode: string;
    purpose: string; // z.B. 'Calling', 'EME', 'Beacon'
  }>;
  satelliteChannels?: Array<{
    uplink: number; // MHz
    downlink: number; // MHz
    mode: string;
  }>;
  notes?: string[];
}

export interface VfoSetting {
  band: string;
  mode: string;
  frequency: number; // MHz
  stepSize: number; // kHz
  filterWidth: number; // Hz
  ritEnabled: boolean;
  xitEnabled: boolean;
  splitEnabled: boolean;
  antennaSelection?: string; // z.B. 'ANT1', 'ANT2'
  powerLevel?: number; // Prozent
  name?: string; // Beschreibung der Einstellung
}

export interface RigConfiguration {
  rigModel: string;
  bands: DarcBand[];
  vfoPresets: VfoSetting[];
  antennaSwitching?: Array<{
    band: string;
    antenna: string;
    description: string;
  }>;
}

// DARC Bandplan Manager
export class DarcBandplanManager {
  private storageKey = 'darc_bandplan';
  private rigConfigKey = 'rig_configurations';
  
  // Standard DARC-Bandpläne für Deutschland
  getDefaultBands(): DarcBand[] {
    return [
      {
        band: '80m',
        frequencyRange: { start: 3.5, end: 3.8 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 3.5, end: 3.51 } },
          { mode: 'SSB', frequencyRange: { start: 3.7, end: 3.8 } }
        ],
        simplexChannels: [
          { frequency: 3.69, mode: 'CW', purpose: 'CW Calling Frequency' }
        ],
        notes: [
          'Nur KW-Lizenz erlaubt',
          'Nachtbetrieb auf höhere Frequenzen (>3.6MHz) bevorzugen'
        ]
      },
      {
        band: '40m',
        frequencyRange: { start: 7.0, end: 7.2 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 7.0, end: 7.04 } },
          { mode: 'SSB', frequencyRange: { start: 7.1, end: 7.2 } }
        ],
        simplexChannels: [
          { frequency: 7.03, mode: 'CW', purpose: 'CW Calling Frequency' },
          { frequency: 7.13, mode: 'SSB', purpose: 'SSB Calling Frequency' }
        ],
        notes: [
          'Kein Betrieb zwischen 7.04-7.1 MHz tagsüber',
          'Nur KW-Lizenz erlaubt'
        ]
      },
      {
        band: '20m',
        frequencyRange: { start: 14.0, end: 14.35 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 14.0, end: 14.15 } },
          { mode: 'SSB', frequencyRange: { start: 14.15, end: 14.35 } }
        ],
        simplexChannels: [
          { frequency: 14.06, mode: 'CW', purpose: 'CW Calling Frequency' },
          { frequency: 14.285, mode: 'SSB', purpose: 'SSB Calling Frequency' }
        ],
        notes: [
          'Internationale Empfehlung beachten',
          'Nur KW-Lizenz erlaubt'
        ]
      },
      {
        band: '17m',
        frequencyRange: { start: 18.068, end: 18.168 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 18.068, end: 18.095 } },
          { mode: 'SSB', frequencyRange: { start: 18.13, end: 18.168 } }
        ],
        simplexChannels: [
          { frequency: 18.1, mode: 'CW', purpose: 'CW Calling Frequency' }
        ],
        notes: [
          'Nur KW-Lizenz erlaubt'
        ]
      },
      {
        band: '15m',
        frequencyRange: { start: 21.0, end: 21.45 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 21.0, end: 21.2 } },
          { mode: 'SSB', frequencyRange: { start: 21.2, end: 21.45 } }
        ],
        simplexChannels: [
          { frequency: 21.07, mode: 'CW', purpose: 'CW Calling Frequency' },
          { frequency: 21.34, mode: 'SSB', purpose: 'SSB Calling Frequency' }
        ],
        notes: [
          'Nur KW-Lizenz erlaubt'
        ]
      },
      {
        band: '12m',
        frequencyRange: { start: 24.89, end: 24.99 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 24.89, end: 24.91 } },
          { mode: 'SSB', frequencyRange: { start: 24.93, end: 24.99 } }
        ],
        simplexChannels: [
          { frequency: 24.93, mode: 'CW', purpose: 'CW Calling Frequency' }
        ],
        notes: [
          'Nur KW-Lizenz erlaubt'
        ]
      },
      {
        band: '10m',
        frequencyRange: { start: 28.0, end: 29.7 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 28.0, end: 28.2 } },
          { mode: 'SSB', frequencyRange: { start: 28.3, end: 28.5 } },
          { mode: 'AM', frequencyRange: { start: 29.0, end: 29.2 } },
          { mode: 'FM', frequencyRange: { start: 29.51, end: 29.7 } }
        ],
        simplexChannels: [
          { frequency: 28.07, mode: 'CW', purpose: 'CW Calling Frequency' },
          { frequency: 28.4, mode: 'SSB', purpose: 'SSB Calling Frequency' },
          { frequency: 29.6, mode: 'FM', purpose: 'FM Simplex Calling' }
        ],
        notes: [
          'KW- und UKW-Lizenzen erlaubt',
          'FM-Betrieb auch mit Grundkenntnisprüfung'
        ]
      },
      {
        band: '6m',
        frequencyRange: { start: 50.0, end: 52.0 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 50.0, end: 50.1 } },
          { mode: 'SSB', frequencyRange: { start: 50.1, end: 50.2 } },
          { mode: 'FM', frequencyRange: { start: 50.2, end: 52.0 } }
        ],
        simplexChannels: [
          { frequency: 50.25, mode: 'FM', purpose: 'FM Simplex Calling' }
        ],
        notes: [
          'UKW-Lizenz erforderlich',
          'E-Skip zu DX-Ländern möglich'
        ]
      },
      {
        band: '2m',
        frequencyRange: { start: 144.0, end: 146.0 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 144.0, end: 144.1 } },
          { mode: 'SSB', frequencyRange: { start: 144.1, end: 144.2 } },
          { mode: 'FM', frequencyRange: { start: 144.3, end: 146.0 } }
        ],
        simplexChannels: [
          { frequency: 145.5, mode: 'FM', purpose: 'FM Simplex Calling Frequency' }
        ],
        satelliteChannels: [
          { uplink: 145.8, downlink: 145.9, mode: 'FM' }
        ],
        notes: [
          'UKW-Lizenz erforderlich',
          'Repeater betreiben im 145.6-145.8 MHz Bereich'
        ]
      },
      {
        band: '70cm',
        frequencyRange: { start: 430.0, end: 450.0 },
        recommendedModes: [
          { mode: 'CW', frequencyRange: { start: 432.0, end: 432.1 } },
          { mode: 'SSB', frequencyRange: { start: 432.1, end: 432.2 } },
          { mode: 'FM', frequencyRange: { start: 432.2, end: 435.0 } }
        ],
        simplexChannels: [
          { frequency: 439.8, mode: 'FM', purpose: 'FM Simplex Calling Frequency' }
        ],
        satelliteChannels: [
          { uplink: 435.0, downlink: 436.0, mode: 'FM' },
          { uplink: 432.15, downlink: 435.15, mode: 'FM' }
        ],
        notes: [
          'UKW-Lizenz erforderlich',
          'ATV-Betrieb ab 436 MHz',
          'Digitalmodulationen ab 435 MHz'
        ]
      }
    ];
  }
  
  // Standard-VFO-Einstellungen für verschiedene Rigs
  getDefaultRigConfigurations(): RigConfiguration[] {
    return [
      {
        rigModel: 'Yaesu FT-991A',
        bands: this.getDefaultBands(),
        vfoPresets: [
          // HF-Bänder
          { band: '80m', mode: 'CW', frequency: 3.58, stepSize: 100, filterWidth: 500, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '80m CW General' },
          { band: '80m', mode: 'SSB', frequency: 3.75, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '80m SSB General' },
          { band: '40m', mode: 'CW', frequency: 7.03, stepSize: 100, filterWidth: 500, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '40m CW Calling' },
          { band: '40m', mode: 'SSB', frequency: 7.13, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '40m SSB Calling' },
          { band: '20m', mode: 'CW', frequency: 14.06, stepSize: 100, filterWidth: 500, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '20m CW Calling' },
          { band: '20m', mode: 'SSB', frequency: 14.285, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '20m SSB Calling' },
          { band: '15m', mode: 'CW', frequency: 21.07, stepSize: 100, filterWidth: 500, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '15m CW Calling' },
          { band: '15m', mode: 'SSB', frequency: 21.34, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '15m SSB General' },
          { band: '10m', mode: 'CW', frequency: 28.07, stepSize: 100, filterWidth: 500, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '10m CW Calling' },
          { band: '10m', mode: 'SSB', frequency: 28.4, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '10m SSB General' },
          { band: '10m', mode: 'FM', frequency: 29.6, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '10m FM Calling' },
          
          // VHF/UHF
          { band: '6m', mode: 'FM', frequency: 50.25, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '6m FM Calling' },
          { band: '2m', mode: 'FM', frequency: 145.5, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '2m FM Calling' },
          { band: '70cm', mode: 'FM', frequency: 439.8, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '70cm FM Calling' },
          
          // Satelliten
          { band: '2m', mode: 'FM', frequency: 145.9, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: true, splitEnabled: true, name: 'AO-92 Downlink' },
          { band: '70cm', mode: 'FM', frequency: 436.0, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: true, splitEnabled: true, name: 'AO-92 Uplink' }
        ]
      },
      {
        rigModel: 'Icom IC-7300',
        bands: this.getDefaultBands(),
        vfoPresets: [
          // HF-Bänder - Digimodi optimiert
          { band: '40m', mode: 'FT8', frequency: 7.074, stepSize: 100, filterWidth: 100, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '40m FT8' },
          { band: '20m', mode: 'FT8', frequency: 14.074, stepSize: 100, filterWidth: 100, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '20m FT8' },
          { band: '15m', mode: 'FT8', frequency: 21.074, stepSize: 100, filterWidth: 100, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '15m FT8' },
          { band: '10m', mode: 'FT8', frequency: 28.074, stepSize: 100, filterWidth: 100, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '10m FT8' },
          
          // SSB allgemein
          { band: '80m', mode: 'SSB', frequency: 3.75, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '80m SSB General' },
          { band: '40m', mode: 'SSB', frequency: 7.13, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '40m SSB Calling' },
          { band: '20m', mode: 'SSB', frequency: 14.285, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '20m SSB Calling' },
          { band: '15m', mode: 'SSB', frequency: 21.34, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '15m SSB General' },
          { band: '10m', mode: 'SSB', frequency: 28.4, stepSize: 1000, filterWidth: 2400, ritEnabled: true, xitEnabled: false, splitEnabled: false, name: '10m SSB General' },
          
          // VHF/UHF
          { band: '2m', mode: 'FM', frequency: 145.5, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '2m FM Calling' },
          { band: '70cm', mode: 'FM', frequency: 439.8, stepSize: 12500, filterWidth: 15000, ritEnabled: false, xitEnabled: false, splitEnabled: false, name: '70cm FM Calling' }
        ]
      }
    ];
  }
  
  // Speichere Bandpläne
  saveBands(bands: DarcBand[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(bands));
      console.log('[DARC] Bands saved successfully');
    } catch (error) {
      console.error('[DARC] Error saving bands:', error);
    }
  }
  
  // Lade Bandpläne
  loadBands(): DarcBand[] | null {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Bandpläne zurückgeben
      const defaultBands = this.getDefaultBands();
      this.saveBands(defaultBands);
      return defaultBands;
    } catch (error) {
      console.error('[DARC] Error loading bands:', error);
      return null;
    }
  }
  
  // Speichere Rig-Konfigurationen
  saveRigConfigurations(configs: RigConfiguration[]): void {
    try {
      localStorage.setItem(this.rigConfigKey, JSON.stringify(configs));
      console.log('[DARC] Rig configurations saved successfully');
    } catch (error) {
      console.error('[DARC] Error saving rig configurations:', error);
    }
  }
  
  // Lade Rig-Konfigurationen
  loadRigConfigurations(): RigConfiguration[] | null {
    try {
      const data = localStorage.getItem(this.rigConfigKey);
      if (data) {
        return JSON.parse(data);
      }
      
      // Falls keine gespeicherten Daten, Standard-Konfigurationen zurückgeben
      const defaultConfigs = this.getDefaultRigConfigurations();
      this.saveRigConfigurations(defaultConfigs);
      return defaultConfigs;
    } catch (error) {
      console.error('[DARC] Error loading rig configurations:', error);
      return null;
    }
  }
  
  // Hole Bandinformationen für eine bestimmte Frequenz
  getBandInfo(frequency: number): DarcBand | null {
    const bands = this.loadBands();
    if (!bands) return null;
    
    for (const band of bands) {
      if (frequency >= band.frequencyRange.start && frequency <= band.frequencyRange.end) {
        return band;
      }
    }
    
    return null;
  }
  
  // Hole empfohlene Betriebsart für eine Frequenz
  getRecommendedMode(frequency: number): string | null {
    const band = this.getBandInfo(frequency);
    if (!band) return null;
    
    for (const mode of band.recommendedModes) {
      if (frequency >= mode.frequencyRange.start && frequency <= mode.frequencyRange.end) {
        return mode.mode;
      }
    }
    
    // Wenn keine spezifische Mode gefunden, erste Mode des Bands zurückgeben
    return band.recommendedModes[0]?.mode || null;
  }
  
  // Hole Simplex-Kanäle für ein Band
  getSimplexChannels(bandName: string): DarcBand['simplexChannels'] {
    const bands = this.loadBands();
    if (!bands) return undefined;
    
    const band = bands.find(b => b.band === bandName);
    return band?.simplexChannels;
  }
  
  // Hole Satelliten-Kanäle für ein Band
  getSatelliteChannels(bandName: string): DarcBand['satelliteChannels'] {
    const bands = this.loadBands();
    if (!bands) return undefined;
    
    const band = bands.find(b => b.band === bandName);
    return band?.satelliteChannels;
  }
  
  // Hole VFO-Einstellung nach Name
  getVfoPreset(name: string): VfoSetting | null {
    const configs = this.loadRigConfigurations();
    if (!configs) return null;
    
    for (const config of configs) {
      const preset = config.vfoPresets.find(p => p.name === name);
      if (preset) return preset;
    }
    
    return null;
  }
  
  // Hole alle VFO-Einstellungen für ein Rig
  getVfoPresetsForRig(rigModel: string): VfoSetting[] | null {
    const configs = this.loadRigConfigurations();
    if (!configs) return null;
    
    const config = configs.find(c => c.rigModel === rigModel);
    return config?.vfoPresets || null;
  }
  
  // Aktualisiere oder füge eine VFO-Einstellung hinzu
  upsertVfoPreset(rigModel: string, preset: VfoSetting): void {
    const configs = this.loadRigConfigurations();
    if (!configs) return;
    
    const configIndex = configs.findIndex(c => c.rigModel === rigModel);
    if (configIndex === -1) {
      console.warn(`[DARC] Rig configuration for ${rigModel} not found`);
      return;
    }
    
    const presetIndex = configs[configIndex].vfoPresets.findIndex(p => p.name === preset.name);
    if (presetIndex >= 0) {
      configs[configIndex].vfoPresets[presetIndex] = preset;
    } else {
      configs[configIndex].vfoPresets.push(preset);
    }
    
    this.saveRigConfigurations(configs);
    console.log(`[DARC] VFO preset ${preset.name} updated for ${rigModel}`);
  }
  
  // Exportiere Bandplan als JSON
  exportBandPlan(): string {
    const bands = this.loadBands();
    const configs = this.loadRigConfigurations();
    
    return JSON.stringify({
      bands,
      rigConfigurations: configs,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  // Importiere Bandplan aus JSON
  importBandPlan(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.bands) {
        this.saveBands(data.bands);
      }
      
      if (data.rigConfigurations) {
        this.saveRigConfigurations(data.rigConfigurations);
      }
      
      console.log('[DARC] Band plan imported successfully');
      return true;
    } catch (error) {
      console.error('[DARC] Error importing band plan:', error);
      return false;
    }
  }
}

// Export des Managers
export const darcBandplanManager = new DarcBandplanManager();

// Initialisierung
console.log('[DARC] DarcBandplanManager initialized');

// Beispiel für die Verwendung:
/*
// Lade alle Bandpläne
const bands = darcBandplanManager.loadBands();
console.log('DARC bands loaded:', bands);

// Hole Bandinfo für eine Frequenz
const band = darcBandplanManager.getBandInfo(14.285);
console.log('Band info for 14.285 MHz:', band);

// Hole empfohlene Betriebsart
const mode = darcBandplanManager.getRecommendedMode(14.074);
console.log('Recommended mode for 14.074 MHz:', mode);

// Hole VFO-Einstellungen für ein Rig
const presets = darcBandplanManager.getVfoPresetsForRig('Yaesu FT-991A');
console.log('VFO presets for FT-991A:', presets);
*/