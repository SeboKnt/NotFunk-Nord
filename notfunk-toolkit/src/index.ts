import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

import { qthRoutes } from './routes/qth'
import { frequencyRoutes } from './routes/frequency'
import { propagationRoutes } from './routes/propagation'
import { solarRoutes } from './routes/solar'
import { logbookRoutes } from './routes/logbook'
import { netRoutes } from './routes/net'
import { emergencyRoutes } from './routes/emergency'

type Bindings = {
  ENVIRONMENT: string
  // Add KV/D1/R2 bindings here later if needed
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', logger())
app.use('*', cors())
app.use('*', prettyJSON())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'notfunk-toolkit', version: '1.0.0' }))

// API Routes
app.route('/api/qth', qthRoutes)
app.route('/api/frequency', frequencyRoutes)
app.route('/api/propagation', propagationRoutes)
app.route('/api/solar', solarRoutes)
app.route('/api/logbook', logbookRoutes)
app.route('/api/net', netRoutes)
app.route('/api/emergency', emergencyRoutes)

// Root endpoint with API documentation
app.get('/', (c) => {
  return c.json({
    name: 'NotFunk-Nord Toolkit',
    description: 'Amateurfunk-Notfunk Werkzeuge für Cloudflare Workers',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      qth: {
        locator: '/api/qth/locator?lat=53.55&lon=10.0',
        decode: '/api/qth/decode?locator=JO43',
        distance: '/api/qth/distance?from=JO43&to=JO31',
        bearing: '/api/qth/bearing?from=JO43&to=JO31',
      },
      frequency: {
        bands: '/api/frequency/bands',
        band: '/api/frequency/band/40m',
        modes: '/api/frequency/modes',
        search: '/api/frequency/search?mode=SSB&band=20m',
      },
      propagation: {
        muf: '/api/propagation/muf?lat=53.55&lon=10.0',
        luf: '/api/propagation/luf?lat=53.55&lon=10.0',
        foF2: '/api/propagation/fof2?lat=53.55&lon=10.0',
      },
      solar: {
        flux: '/api/solar/flux',
        kp: '/api/solar/kp',
        xray: '/api/solar/xray',
        summary: '/api/solar/summary',
      },
      logbook: {
        list: '/api/logbook',
        create: 'POST /api/logbook',
        get: '/api/logbook/:id',
        update: 'PUT /api/logbook/:id',
        delete: 'DELETE /api/logbook/:id',
      },
      net: {
        list: '/api/net',
        create: 'POST /api/net',
        checkin: 'POST /api/net/:id/checkin',
      },
      emergency: {
        frequencies: '/api/emergency/frequencies',
        protocols: '/api/emergency/protocols',
        protocol: '/api/emergency/protocol/mayday',
      },
    },
    links: {
      github: 'https://github.com/NotFunk-Nord',
      wikipedia: 'https://de.wikipedia.org/wiki/Notfunk',
      darc: 'https://www.darc.de/referate/notfunk/',
    },
  })
})

export default app
