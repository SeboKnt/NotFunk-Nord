# NotFunk-Nord Toolkit

API-Toolkit für Amateurfunk-Notfunk mit Cloudflare Workers.

## API Endpunkte

### QTH Locator (Maidenhead Grid Square)
```
GET  /api/qth/locator?lat=53.55&lon=10.0
GET  /api/qth/decode?locator=JO43
GET  /api/qth/distance?from=JO43&to=JO31
GET  /api/qth/bearing?from=JO43&to=JO31
POST /api/qth/locator  (body: { lat, lon })
```

### Frequenzen & Bänder
```
GET  /api/frequency/bands
GET  /api/frequency/band/40m
GET  /api/frequency/modes
GET  /api/frequency/search?mode=SSB&band=20m
```

### Propagation
```
GET  /api/propagation/muf?lat=53.55&lon=10.0
GET  /api/propagation/luf?lat=53.55&lon=10.0
GET  /api/propagation/fof2?lat=53.55&lon=10.0
GET  /api/propagation/status  (Default Hamburg)
```

### Solar
```
GET  /api/solar/flux
GET  /api/solar/kp
GET  /api/solar/xray
GET  /api/solar/summary
```

### Notfunk
```
GET  /api/emergency/frequencies?region=Norddeutschland
GET  /api/emergency/protocols
GET  /api/emergency/protocol/mayday
```

### Net
```
GET  /api/net
POST /api/net
POST /api/net/:id/checkin
GET  /api/net/preset
```

### Logbook
```
GET  /api/logbook
POST /api/logbook
GET  /api/logbook/:id
PUT  /api/logbook/:id
DELETE /api/logbook/:id
GET  /api/logbook/stats
```

## Development

```bash
npm install
npm run dev          # Startet lokalen Dev-Server
npm run typecheck    # TypeScript-Prüfung
```

## Deployment

```bash
npx wrangler login
npx wrangler deploy
```

## Lizenz

MIT
