# NotFunk-Nord.de

> "Wenn der Strom ausfällt, bleibt der Funk."

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com)
[![Hono](https://img.shields.io/badge/Hono-v4-green?style=flat-square&logo=cloudflare)](https://hono.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)

## Was ist NotFunk-Nord?

**NotFunk-Nord** ist ein Open-Source Toolkit für Amateurfunk im Notfall. Es bietet Werkzeuge für Funkamateure im Norden und darüber hinaus.

## API Toolkit

Das Backend ist ein [Cloudflare Worker](https://developers.cloudflare.com/workers/) basierend auf [Hono](https://hono.dev).

### Endpunkte

| Modul | Endpunkte | Beschreibung |
|-------|-----------|--------------|
| **QTH** | `/api/qth/*` | Maidenhead Grid Square Converter, Entfernung, Richtung |
| **Frequency** | `/api/frequency/*` | Bänder, Modi, Suchfunktion |
| **Propagation** | `/api/propagation/*` | MUF/LUF/Vorhersage für jeden Standort |
| **Solar** | `/api/solar/*` | Solar Flux, Kp-Index, Xray-Klasse |
| **Emergency** | `/api/emergency/*` | Notruf-Frequenzen, Protokolle |
| **Logbook** | `/api/logbook/*` | QSO-Logbuch (CRUD) |
| **Net** | `/api/net/*` | Funknetz-Verwaltung, Check-in |

### Schnellstart

```bash
cd notfunk-toolkit
npm install
npm run dev        # Lokaler Dev-Server
npm run typecheck  # TypeScript prüfen
```

### Deployment

```bash
npx wrangler login
npx wrangler deploy
```

## Statische Website

Eine Dark-Mode Terminal-ästhetik Website mit Echtzeit-API-Integration für:
- Grid Square Konverter
- Distanz- & Richtungsrechner
- Propagations-Status
- Solar-Daten

Die Frontend-Dateien liegen im `public/`-Ordner. Für Cloudflare Pages:

```bash
npx wrangler pages deploy public/
```

## Projektstruktur

```
├── public/              # Statische Website
├── notfunk-toolkit/
│   ├── src/routes/      # API-Endpunkte
│   ├── package.json
│   └── wrangler.jsonc
└── README.md
```

## Technologie-Stack

- **Runtime**: Cloudflare Workers (Edge)
- **Framework**: Hono (Web Framework for Edge)
- **Language**: TypeScript 5+
- **CLI**: Wrangler 4
- **Hosting**: Cloudflare Pages (Static) + Workers (API)

## Lizenz

MIT License - frei für Notfunk-Operationen weltweit.

---

Built with ❤️ for the amateur radio community.
