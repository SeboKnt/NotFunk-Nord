# NotFunk-Nord Monitoring und Cron System

## Übersicht
Dieses Dokument beschreibt das erweiterte Monitoring- und Cron-System für NotFunk-Nord.

## Komponenten

### 1. Status-Check System (`src/status-check.js`)
Das erweiterte Status-Check-System führt verschiedene Prüfungen durch:

- **Website-Check**: Prüft Verfügbarkeit und Antwortzeiten der Hauptwebsite
- **Wikipedia-Referenz**: Verifiziert, dass notfunk-nord.de im Wikipedia-Artikel verlinkt ist
- **API-Status**: Prüft die Verfügbarkeit der internen API-Endpunkte

### 2. E-Mail-Benachrichtigungen (`src/utils/email.js`)
Sendet detaillierte Status-Benachrichtigungen bei Problemen oder regelmäßig.

### 3. Cron-Skripte (`cron-scripts/scheduled-status-check.js`)
Separate ausführbare Skripte, die periodisch vom System-Cron aufgerufen werden können.

### 4. Cloudflare Worker Cron Endpunkte (`src/cron.ts`)
HTTP-Endpunkte für Cloudflare Worker Cron-Triggers.

## Einrichtung

### System-Crontab
Fügen Sie folgenden Eintrag zum Crontab hinzu:
```bash
# Status-Check alle 15 Minuten
*/15 * * * * cd /pfad/zum/notfunk-toolkit && node cron-scripts/scheduled-status-check.js

# Täglicher Report um 09:00 Uhr
0 9 * * * cd /pfad/zum/notfunk-toolkit && node cron-scripts/daily-report.js
```

## Umgebungsvariablen
```
EMAIL_PASSWORD=ihre_email_passwort
NOTFUNK_API_KEY=api_schluessel_fuer_erweiterte_pruefungen
```

## API Endpunkte

### GET /cron/status-check
Triggert einen Status-Check und gibt das Ergebnis zurück.

## Ausgabeformat
Die Skripte geben strukturierte JSON-Daten sowie menschenlesbare Logs aus.