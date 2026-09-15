# NotFunk-Nord - Development Guide

## Architecture Overview

```
NotFunk-Nord/
├── notfunk-toolkit/          # Cloudflare Worker (API Backend)
│   ├── src/
│   │   ├── index.ts         # Main Hono app, route registration
│   │   └── routes/          # API endpoint modules
│   │       ├── ai.ts        # Hugging Face AI assistant
│   │       ├── emergency.ts # Emergency frequencies & protocols
│   │       ├── frequency.ts # Band/mode database
│   │       ├── logbook.ts   # QSO logbook CRUD
│   │       ├── net.ts       # Net check-in system
│   │       ├── news.ts      # RSS aggregator with KV caching
│   │       ├── propagation.ts # MUF/LUF/foF2 predictions
│   │       ├── qth.ts       # Maidenhead locator math
│   │       └── solar.ts     # Solar flux, Kp-index
│   ├── wrangler.jsonc       # Workers config + KV binding
│   └── package.json
├── public/                   # Static assets (Cloudflare Pages)
│   ├── css/
│   │   └── base.css         # Design system (amber/green/dark)
│   ├── js/
│   │   ├── app.js           # Shared utilities, nav, clock
│   │   ├── ai.js            # Chat interface
│   │   ├── frequencies.js   # Table rendering + filters
│   │   ├── index.js         # Landing page logic
│   │   ├── map.js           # Leaflet map integration
│   │   ├── news.js          # News feed component
│   │   ├── pwa.js           # Service worker registration
│   │   └── tools.js         # Tool calculators
│   ├── *.html               # Page templates (no build step)
│   ├── manifest.json        # PWA manifest
│   ├── offline.html         # Fallback for offline
│   └── sw.js                # Service worker (cache strategy)
└── tasks.md                 # Work tracking (not committed)
```

## Key Design Decisions

### Stack
- **Backend**: Cloudflare Workers + Hono.js (TypeScript)
- **Frontend**: Vanilla HTML/CSS/JS (no framework, no build step)
- **Hosting**: Cloudflare Pages (static) + Workers (API)
- **Database**: In-memory for dev, KV for caching, D1 optional later
- **AI**: Hugging Face Inference API (Mistral 7B, EU server)

### Why this stack?
- Zero cold starts for static assets (Pages CDN)
- Edge-native API (sub-50ms responses)
- No build pipeline = simple deployment
- Offline-first by design (PWA)
- Cost: Free tier covers all usage (< 100k req/day)

### Design System
- **Colors**: Amber (#f0c040) + Green (#3fb950) on dark navy (#0d1117)
- **Font**: System sans-serif for body, monospace for data
- **No scanlines, no gaming aesthetics** - professional tool feel
- **Mobile-first**: Touch targets, readable at arm's length

## API Endpoints

### Core Tools
- `GET /api/qth/locator?lat=X&lon=Y` - Lat/lon → Grid Square
- `GET /api/qth/decode?locator=JO43` - Grid Square → coords
- `GET /api/qth/distance?from=A&to=B` - Haversine distance
- `GET /api/qth/bearing?from=A&to=B` - Compass bearing

### Propagation
- `GET /api/propagation/muf?lat=X&lon=Y` - Max usable frequency
- `GET /api/propagation/status` - Default Hamburg status
- `GET /api/solar/summary` - Flux, Kp, Xray, trends

### News
- `GET /api/news` - Aggregated RSS (DARC, THW, ARRL)
- `GET /api/news?category=BOS` - Filter by category
- `GET /api/news?refresh=1` - Bypass cache
- `GET /api/news/sources` - Available feeds

### AI
- `GET /api/ai/chat?question=...` - Mistral 7B Q&A
- `POST /api/ai/chat` - With conversation history
- `GET /api/ai/suggest` - Suggested questions

### Logbook
- `GET /api/logbook` - List QSOs
- `POST /api/logbook` - Add entry
- `PUT /api/logbook/:id` - Update
- `DELETE /api/logbook/:id` - Remove

## Key Implementation Details

### Service Worker (sw.js)
- Precaches HTML/CSS/JS on first visit
- Runtime cache for API responses (15 min TTL)
- Network-first for dynamic content
- Returns offline.html when no connection

### Map (map.js)
- Uses Leaflet + OpenStreetMap tiles
- Stations: Hamburg (JO43), Bremen (JO33), Kiel (JO44), etc.
- Color coding: Blue=net, Green=station, Yellow=relay
- Click markers for info popup
- Locator search with zoom-to

### Caching Strategy
- KV namespace `NEWS_CACHE` for RSS aggregation (15min TTL)
- KV namespace `AI_CACHE` for chat responses (optional)
- Browser Cache API for API responses
- Force-refresh via `?refresh=1` query param

### Time Format
- NATO DTTM: `DDTHHMMZ` (e.g., `151106Z` = 15:11:06 UTC on 26th)
- UTC only, no timezone conversion
- Displayed in header on all pages

## Environment Variables

```
# wrangler.jsonc
{
  "kv_namespaces": [
    { "binding": "NEWS_CACHE", "id": "YOUR_ID" }
  ],
  "vars": {
    "HF_API_KEY": "hf_..."  // Optional, for AI feature
  }
}
```

## Performance Constraints
- Total size: < 500KB (currently ~172KB)
- No external JS frameworks
- No build step
- All CSS inline or single file
- Images: SVG only, no external assets

## Common Tasks

### Adding a new API route
1. Create `src/routes/<name>.ts`
2. Export routes with `export const <name>Routes = new Hono()`
3. Import and register in `src/index.ts`
4. Add to `Bindings` type if using KV/D1

### Adding a new page
1. Create `public/<page>.html`
2. Link from navigation in other pages
3. Add JS module in `public/js/<page>.js`
4. Include script tag in HTML

### Updating styles
1. Edit `public/css/base.css`
2. Use CSS custom properties (e.g., `var(--accent-amber)`)
3. Keep mobile-responsive in mind

## Testing
```bash
npm run dev          # Start local dev server
npm run typecheck    # TypeScript validation
npx wrangler deploy  # Deploy to Cloudflare
```

## Deployment
1. Push to `main` branch
2. Cloudflare Pages auto-deploys static assets
3. Workers auto-deploys on `wrangler.jsonc` changes
4. Custom domain: `notfunk-nord.de` (DNS via Cloudflare)

## Notes for Future Agents
- This is a **production emergency tool**, not a demo
- Keep code minimal and purposeful
- No decorative animations or effects
- All features must work offline after first load
- German language throughout UI
- Radio amateurs may be stressed - clarity over cleverness
