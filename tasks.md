# NotFunk-Nord - Entwicklungsaufgaben

## Überblick
Diese Datei enthält alle Aufgaben aus dem Plan. Markiere bearbeitete Tasks mit `[x]`.

---

## 1. 🗺️ Karte verbessern (Leaflet + OpenStreetMap)

**Status:** ⏳ Bereit
**Aufwand:** Mittel
**Benötigt:** Keine API-Keys

- [x] Task 1.1: Leaflet + OSM in `map.html` einbinden (CDN)
- [x] Task 1.3: Notfunk-Stationen als Marker einfügen (Hamburg, Bremen, Kiel, etc.)
- [x] Task 1.5: Locator-Suche mit Map-Zoom zu Standort
- [ ] Task 1.6: Offline-Tile-Caching über Service Worker (optional)

---

## 2. 🤖 KI-Anbindung (Hugging Face EU)

**Status:** ⏳ Bereit
**Aufwand:** Mittel
**Benötigt:** Hugging Face API-Key (gratis)

- [ ] Task 2.1: Hugging Face Inference API Integration in Worker
- [ ] Task 2.2: Prompt-Template für Notfunk-Q&A erstellen
- [ ] Task 2.3: Frontend-Chat Interface auf `/kai` oder im Tools-Tab
- [ ] Task 2.4: Caching von Antworten (KV Store für häufige Fragen)
- [ ] Task 2.5: Rate-Limiting und Error-Handling implementieren

---

## 3. 📡 LoRa-Fokus verstärken

**Status:** ✅ In Arbeit (Agent beginnt hier)
**Aufwand:** Klein
**Benötigt:** Keine externen Dependencies

- [x] Task 3.1: Neue Seite `/lora` erstellt mit:
  - Was ist LoRa? (Erklärung)
  - Frequenzen (433/868/915 MHz ISM)
  - Reichweiten-Übersicht
  - Equipment-Empfehlungen (SX1262, Heltec, etc.)
  - Mesh-Netzwerk Topologie erklären
- [ ] Task 3.2: LoRa-Knotenpunkt-Karte auf der bestehenden Map
- [ ] Task 3.3: Live-Status von LoRa-Gateways (simuliert oder real)
- [ ] Task 3.4: Distanz-Rechner für LoRa-Links (mit Haversine)

---

## 4. 📰 News-Aggregation (RSS)

**Status:** ✅ Erledigt
**Aufwand:** Mittel
**Benötigt:** Keine API-Keys (RSS-Parsing im Worker)

- [x] Task 4.1: RSS-Feeds definieren (DARC, THW, IARU, ARRL)
- [x] Task 4.2: Worker-Route `/api/news` mit Parsing-Logik
- [x] Task 4.3: Caching-Layer (KV Store 15min TTL, forceRefresh-Parameter)
- [x] Task 4.4: Frontend-Komponente für News-Feed (Startseite integriert)
- [ ] Task 4.5: Category-Filter (BOS, Weather, Events)
- [ ] Task 4.6: "Was interessiert dich?" Onboarding

---

## 5. 📴 Offline-Fähigkeit (PWA)

**Status:** ✅ Erledigt
**Aufwand:** Mittel
**Benötigt:** Service Worker

- [x] Task 5.1: Service Worker (`sw.js`) erstellen
- [x] Task 5.2: precache HTML/CSS/JS Assets (in sw.js integriert)
- [x] Task 5.3: Runtime-Cache für API-Aufrufe (Cache API)
- [x] Task 5.4: manifest.json für "Add to Home Screen"
- [x] Task 5.5: Offline-Fallback-Seite erstellen (`offline.html`)
- [x] Task 5.6: Größeneinschränkung geprüft (172KB < 500KB) ✅

---

## 6. Bonus / Weitere Ideen

- [ ] LoRa-Distanz-Visualisierung auf der Karte
- [ ] QR-Code Generator für Locator (für Ausweise)
- [ ] CW-Decoder (Morsecode abspielen)
- [ ] SSB/FT8 Audio-Player für Live-Streams
- [ ] Export-Funktion für QSO-Logbuch (ADIF, CSV)
- [ ] Dark/Light Mode Toggle (automatisch nach Sonnenuntergang)
- [ ] Sprachausgabe für wichtige Frequenzen ("Jetzt auf 3573 kHz")

---

## Prioritäten (wenn du nicht weißt, wo anfangen)

1. **LoRa-Seite** (kleinster Aufwand, großer Mehrwert)
2. **Service Worker** (Offline-Fähigkeit = Kernnutzen)
3. **Karte verbessern** (visuell sehr ansprechend)
4. **News-Aggregation** (aktuelle Infos)
5. **KI-Anbindung** (interessant, aber nicht kritisch)
