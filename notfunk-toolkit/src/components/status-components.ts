// Status-Anzeige Komponenten für NotFunk-Nord Dashboard
// Visuelle Komponenten für Echtzeit-Statusanzeigen

// Allgemeine Status-Komponente
export interface StatusComponent {
  id: string;
  title: string;
  status: 'ok' | 'warning' | 'critical' | 'unknown';
  value?: string | number;
  unit?: string;
  lastUpdate?: string;
  trend?: 'up' | 'down' | 'stable';
  history?: StatusHistoryPoint[];
}

// Historische Datenpunkte für Trends
export interface StatusHistoryPoint {
  timestamp: string;
  value: number;
  status: 'ok' | 'warning' | 'critical' | 'unknown';
}

// Status-Card Komponente für das Dashboard
export class StatusCard {
  private component: StatusComponent;
  private onUpdate?: (component: StatusComponent) => void;
  
  constructor(component: StatusComponent, onUpdate?: (component: StatusComponent) => void) {
    this.component = component;
    this.onUpdate = onUpdate;
  }
  
  // Status aktualisieren
  updateStatus(newStatus: StatusComponent): void {
    this.component = { ...this.component, ...newStatus };
    
    // Historie aktualisieren
    if (newStatus.value !== undefined && typeof newStatus.value === 'number') {
      this.addToHistory(newStatus.value, newStatus.status);
    }
    
    // Callback ausführen
    if (this.onUpdate) {
      this.onUpdate(this.component);
    }
    
    console.log(`[StatusCard] Updated ${this.component.id}: ${this.component.status}`);
  }
  
  // Wert zur Historie hinzufügen
  private addToHistory(value: number, status: StatusComponent['status']): void {
    const timestamp = new Date().toISOString();
    
    this.component.history = this.component.history || [];
    this.component.history.push({ timestamp, value, status });
    
    // Begrenzen der Historie auf die letzten 50 Einträge
    if (this.component.history.length > 50) {
      this.component.history = this.component.history.slice(-50);
    }
    
    // Trend berechnen
    if (this.component.history.length >= 2) {
      const last = this.component.history[this.component.history.length - 1];
      const prev = this.component.history[this.component.history.length - 2];
      
      if (last.value > prev.value) {
        this.component.trend = 'up';
      } else if (last.value < prev.value) {
        this.component.trend = 'down';
      } else {
        this.component.trend = 'stable';
      }
    }
  }
  
  // Aktuellen Status abrufen
  getStatus(): StatusComponent {
    return { ...this.component };
  }
  
  // Status-basierte Farbe zurückgeben
  getColor(): string {
    switch (this.component.status) {
      case 'ok': return '#4CAF50'; // Grün
      case 'warning': return '#FF9800'; // Orange
      case 'critical': return '#F44336'; // Rot
      default: return '#9E9E9E'; // Grau
    }
  }
  
  // Status-basiertes Icon zurückgeben
  getIcon(): string {
    switch (this.component.status) {
      case 'ok': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '?';
    }
  }
}

// Zusammenfassungs-Komponente für mehrere Statuswerte
export class StatusSummary {
  private components: Map<string, StatusCard> = new Map();
  private onSummaryUpdate?: (summary: StatusSummaryData) => void;
  
  constructor(onSummaryUpdate?: (summary: StatusSummaryData) => void) {
    this.onSummaryUpdate = onSummaryUpdate;
  }
  
  // Status-Komponente hinzufügen
  addComponent(component: StatusComponent): void {
    const card = new StatusCard(component, () => this.updateSummary());
    this.components.set(component.id, card);
    this.updateSummary();
  }
  
  // Status-Komponente aktualisieren
  updateComponent(id: string, newData: Partial<StatusComponent>): void {
    const card = this.components.get(id);
    if (card) {
      const current = card.getStatus();
      card.updateStatus({ ...current, ...newData });
    }
  }
  
  // Zusammenfassung aktualisieren
  private updateSummary(): void {
    if (this.onSummaryUpdate) {
      this.onSummaryUpdate(this.getSummary());
    }
  }
  
  // Zusammenfassungsdaten erstellen
  getSummary(): StatusSummaryData {
    const components = Array.from(this.components.values()).map(card => card.getStatus());
    
    // Gesamtstatus berechnen
    let overallStatus: 'ok' | 'warning' | 'critical' | 'unknown' = 'unknown';
    
    if (components.some(c => c.status === 'critical')) {
      overallStatus = 'critical';
    } else if (components.some(c => c.status === 'warning')) {
      overallStatus = 'warning';
    } else if (components.every(c => c.status === 'ok')) {
      overallStatus = 'ok';
    }
    
    // Statistiken berechnen
    const stats = {
      total: components.length,
      ok: components.filter(c => c.status === 'ok').length,
      warning: components.filter(c => c.status === 'warning').length,
      critical: components.filter(c => c.status === 'critical').length,
      unknown: components.filter(c => c.status === 'unknown').length
    };
    
    return {
      overallStatus,
      components,
      stats,
      lastUpdate: new Date().toISOString()
    };
  }
  
  // Alle Komponenten abrufen
  getAllComponents(): StatusComponent[] {
    return Array.from(this.components.values()).map(card => card.getStatus());
  }
}

// Datenstruktur für die Zusammenfassung
export interface StatusSummaryData {
  overallStatus: 'ok' | 'warning' | 'critical' | 'unknown';
  components: StatusComponent[];
  stats: {
    total: number;
    ok: number;
    warning: number;
    critical: number;
    unknown: number;
  };
  lastUpdate: string;
}

// Spezialisierte Komponenten für verschiedene Anwendungsfälle

// APRS-Status Komponente
export class APRSStatusComponent extends StatusCard {
  constructor(onUpdate?: (component: StatusComponent) => void) {
    super({
      id: 'aprs-system',
      title: 'APRS System',
      status: 'unknown',
      value: 0,
      unit: 'aktive Stationen'
    }, onUpdate);
  }
  
  updateStationCount(count: number): void {
    const status: StatusComponent['status'] = 
      count > 100 ? 'ok' : 
      count > 50 ? 'warning' : 
      count > 0 ? 'critical' : 'unknown';
      
    this.updateStatus({
      id: 'aprs-system',
      title: 'APRS System',
      value: count,
      status,
      lastUpdate: new Date().toISOString()
    });
  }
}

// Wetterdaten Status Komponente
export class WeatherStatusComponent extends StatusCard {
  constructor(onUpdate?: (component: StatusComponent) => void) {
    super({
      id: 'weather-data',
      title: 'Wetterdaten',
      status: 'unknown',
      value: 0,
      unit: 'Stationen'
    }, onUpdate);
  }
  
  updateWeatherStations(active: number, total: number): void {
    const ratio = total > 0 ? active / total : 0;
    const status: StatusComponent['status'] = 
      ratio > 0.8 ? 'ok' : 
      ratio > 0.5 ? 'warning' : 
      ratio > 0 ? 'critical' : 'unknown';
      
    this.updateStatus({
      id: 'weather-data',
      title: 'Wetterdaten',
      value: active,
      status,
      lastUpdate: new Date().toISOString()
    });
  }
}

// Relaisstatus Komponente
export class RepeaterStatusComponent extends StatusCard {
  constructor(onUpdate?: (component: StatusComponent) => void) {
    super({
      id: 'repeaters',
      title: 'Relais',
      status: 'unknown',
      value: 0,
      unit: 'online'
    }, onUpdate);
  }
  
  updateRepeaterStatus(online: number, total: number): void {
    const ratio = total > 0 ? online / total : 0;
    const status: StatusComponent['status'] = 
      ratio > 0.9 ? 'ok' : 
      ratio > 0.7 ? 'warning' : 
      ratio > 0 ? 'critical' : 'unknown';
      
    this.updateStatus({
      id: 'repeaters',
      title: 'Relais',
      value: online,
      status,
      lastUpdate: new Date().toISOString()
    });
  }
}