# NotFunk-Nord - Verbesserungsplan

## 1. 🗺️ Karte verbessern

### Aktuelle Situation
- Nur ein vereinfachtes SVG von Norddeutschland ohne echte Geografie
- Keine echten Kartenfunktionen

### Vorschläge

**A) Leaflet + OpenStreetMap (Empfohlen)**
- Open-source Kartenbibliothek, klein (~70KB minified)
- Kostet nichts, kein API-Key nötig
- Kann offline funktionieren mit Tile-Caching via Service Worker
- Marker für alle Notfunk-Stationen

**B) Mapbox GL JS**
- Schöner, aber benötigt API-Key und hat Kosten
- Nicht empfohlen für kostenlosen/privaten Einsatz

**C) Eigenes SVG mit echten Grenzen**
- GeoJSON von Deutschland hochladen
- Keine externen Abhängigkeiten
- Aber: aufwendiger zu implementieren

→ **Empfehlung: Leaflet + OSM**

---

## 2. 🤖 KI-Anbindung (EU/Deutschland)

### Option A: Hugging Face Inference API
- Server in EU (Frankfurt)
- Kostenlose Tier verfügbar
- Models: Gemma, Mistral, Llama
- API-Key benötigt (kostenlos registrieren)

### Option B: OpenRouter
- Aggregiert verschiedene Modelle
- EU-Server verfügbar
- Pay-per-use

### Option C: Lokales Modell (Edge)
- Über Cloudflare Workers + edge inference
- Noch experimentell
- Für einfache Q&A ausreichend

→ **Empfehlung: Hugging Face Inference API**
(Gratis, EU-Server, gut dokumentiert)

---

## 3. 📡 LoRa-Fokus verstärken

### Was fehlt aktuell
- LoRa nur 4 Frequenzen in der Liste
- Keine separaten LoRa-Sektionen
- Keine Erklärung was LoRa ist
- Kein "LoRa Mesh Network" Konzept

### Vorschläge
- **Eigene Seite `/lora`** mit:
  - Was ist LoRa?
  - Frequenzen (ISMs: 433/868/915 MHz)
  - Reichweiten-Übersicht
  - Equipment-Empfehlungen (SX1262, etc.)
  - Mesh-Netzwerk Topologie erklären
- **LoRa-Netz-Karte** mit geplanten Knotenpunkten
- **LoRa-Gateway-Status** (live oder simuliert)

---

## 4. 📰 News-Aggregation (RSS)

### Quellen die relevant sind
**Deutschland-spezifisch:**
- DARC Notfunk-Referat Blog
- THW Infos
- Bundesamt für Bevölkerungsschutz (BBK)
- RBB/BBC Notfunk-Nachrichten

**International:**
- IARU News
- ARRL (American Radio Relay League)
- HamRadio News

### Technische Umsetzung
- Cloudflare Worker aggregiert RSS-Feeds
- Cache für 15-30 Minuten
- Einfache API: `GET /api/news`
- Frontend zeigt 5-10 aktuelle Meldungen

→ **Empfehlung: Eigener Aggregator-Worker + RSS API**

---

## 5. 📴 Offline-Fähigkeit (PWA)

### Service Worker Features
- HTML/CSS/JS cachen nach erstem Besuch
- API-Aufrufe cachen (localStorage oder Cache API)
- Hintergrund-Sync wenn wieder online
- Icon für "Add to Home Screen"

### Größe optimieren
- Kein Framework (jetzt schon gut)
- CSS komprimieren
- JS lazy-load wo möglich
- Images als WebP
- Ziel: < 500KB total

### Was offline funktioniert
- Grid Square Rechner
- Frequenz-Tabelle
- Tool-Karten
- News (zuletzt geladen)

### Was online benötigt
- Propagation/Solar-Daten (API-Call)
- Live-Karte (Tiles)
- KI-Chat

→ **Empfehlung: Service Worker + Cache API**

---

## Prioritäten

| # | Feature | Aufwand | Nutzen | Empfehlung |
|---|---------|---------|--------|------------|
| 1 | Service Worker (Offline) | Mittel | Hoch | Sofort umsetzen |
| 2 | LoRa-Seite | Klein | Hoch | Kurzfristig |
| 3 | Bessere Karte (Leaflet) | Mittel | Hoch | Kurzfristig |
| 4 | RSS News API | Mittel | Mittel | Mittelfristig |
| 5 | KI-Chat (Hugging Face) | Mittel | Mittel | Langfristig |

---

## Technische Überlegungen

### Cloudflare Limits
- Workers: 100k req/day gratis
- Pages Functions: 100k req/day gratis
- KV Storage: 1GB gratis
- R2 Storage: 10GB gratis (für Kacheln?)

### Hosting-Strategie
```
├── public/          → Cloudflare Pages (Static)
├── src/routes/      → Cloudflare Workers (API)
│   ├── /api/news    → RSS Aggregator
│   ├── /api/kai     → Hugging Face Proxy
│   └── /api/map     → Kartendaten
└── sw.js            → Service Worker (PWA)
```
