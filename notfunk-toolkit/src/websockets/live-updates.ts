// WebSocket Live Updates für NotFunk-Nord
// Implementierung von Echtzeit-Datenübertragung

// Client-seitige WebSocket Verbindung
export class NotFunkWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number = 5000; // 5 Sekunden
  private maxReconnectAttempts: number = 10;
  private reconnectAttempts: number = 0;
  
  constructor(url: string) {
    this.url = url;
  }
  
  // Verbindung herstellen
  connect(): void {
    try {
      this.ws = new WebSocket(this.url);
      
      this.ws.addEventListener('open', () => {
        console.log('[NotFunk WS] Connected to live updates');
        this.reconnectAttempts = 0;
        this.onOpen();
      });
      
      this.ws.addEventListener('message', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('[NotFunk WS] Error parsing message:', error);
        }
      });
      
      this.ws.addEventListener('close', (event: CloseEvent) => {
        console.log(`[NotFunk WS] Connection closed: ${event.reason}`);
        this.onClose(event);
        
        // Automatisch reconnecten
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`[NotFunk WS] Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.connect();
          }, this.reconnectInterval);
        }
      });
      
      this.ws.addEventListener('error', (error: Event) => {
        console.error('[NotFunk WS] WebSocket error:', error);
        this.onError(error);
      });
    } catch (error) {
      console.error('[NotFunk WS] Failed to create WebSocket:', error);
    }
  }
  
  // Nachricht senden
  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[NotFunk WS] Cannot send message - not connected');
    }
  }
  
  // Verbindung schließen
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
  
  // Event Handler (können überschrieben werden)
  protected onOpen(): void {
    console.log('[NotFunk WS] WebSocket opened');
  }
  
  protected onMessage(data: any): void {
    console.log('[NotFunk WS] Received message:', data);
  }
  
  protected onClose(event: CloseEvent): void {
    console.log('[NotFunk WS] WebSocket closed');
  }
  
  protected onError(error: Event): void {
    console.error('[NotFunk WS] WebSocket error:', error);
  }
}

// WebSocket Server für Cloudflare Workers
// Hinweis: In Cloudflare Workers müssen WebSockets über Durable Objects verwaltet werden
export interface WebSocketServerHandlers {
  onConnect?: (ws: WebSocket) => void;
  onMessage?: (ws: WebSocket, message: string) => void;
  onClose?: (ws: WebSocket, code: number, reason: string) => void;
  onError?: (ws: WebSocket, error: Error) => void;
}

// Einfacher Broadcast Manager für Live-Daten
export class LiveDataBroadcaster {
  private subscribers: WebSocket[] = [];
  
  // Neuen Subscriber hinzufügen
  subscribe(ws: WebSocket): void {
    this.subscribers.push(ws);
    console.log(`[LiveData] New subscriber. Total: ${this.subscribers.length}`);
  }
  
  // Subscriber entfernen
  unsubscribe(ws: WebSocket): void {
    const index = this.subscribers.indexOf(ws);
    if (index > -1) {
      this.subscribers.splice(index, 1);
      console.log(`[LiveData] Subscriber removed. Total: ${this.subscribers.length}`);
    }
  }
  
  // Daten an alle Subscriber senden
  broadcast(data: any): void {
    const message = JSON.stringify(data);
    const deadConnections: WebSocket[] = [];
    
    this.subscribers.forEach(ws => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        } else {
          deadConnections.push(ws);
        }
      } catch (error) {
        console.error('[LiveData] Error broadcasting to subscriber:', error);
        deadConnections.push(ws);
      }
    });
    
    // Tote Verbindungen entfernen
    deadConnections.forEach(ws => this.unsubscribe(ws));
  }
  
  // Anzahl der aktiven Subscriber
  getSubscriberCount(): number {
    return this.subscribers.length;
  }
}

// Typen für Live-Daten
export type LiveDataType = 'aprs_position' | 'aprs_weather' | 'repeater_status' | 'net_activity';

export interface LiveDataMessage {
  type: LiveDataType;
  timestamp: string;
  data: any;
}

// Beispiel für APRS Live-Daten
export interface APRSLivePosition extends LiveDataMessage {
  type: 'aprs_position';
  data: {
    callsign: string;
    lat: number;
    lng: number;
    symbol: string;
    comment: string;
    speed?: number;
    direction?: number;
    altitude?: number;
  };
}

// Beispiel für Wetter Live-Daten
export interface APRSLiveWeather extends LiveDataMessage {
  type: 'aprs_weather';
  data: {
    callsign: string;
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed?: number;
    windDirection?: number;
    rain1h?: number;
  };
}

// Beispiel für Relaisstatus Live-Daten
export interface RepeaterLiveStatus extends LiveDataMessage {
  type: 'repeater_status';
  data: {
    callsign: string;
    status: 'online' | 'offline' | 'unknown';
    lastHeard: string;
    rxTraffic?: number;
    txTraffic?: number;
  };
}

// Beispiel für NET Aktivitätsdaten
export interface NetLiveActivity extends LiveDataMessage {
  type: 'net_activity';
  data: {
    netId: string;
    eventName: string;
    participant?: string;
    message?: string;
  };
}