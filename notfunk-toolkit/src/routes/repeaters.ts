import { Hono } from 'hono'
import { z } from 'zod'
import { Repeater, getRepeaterStatus, SAMPLE_REPEATERS } from '../data/repeaters'

type RepeaterBindings = {
  // Zukünftige Umgebungsvariablen für externe APIs
}

const repeaterRoutes = new Hono<{ Bindings: RepeaterBindings }>()

// Validation schemas
const repeaterQuerySchema = z.object({
  callsign: z.string().min(1).max(20).optional(),
  mode: z.string().min(1).max(10).optional(),
  band: z.enum(['2m', '70cm', '23cm', '13cm', '3cm']).optional(),
  status: z.enum(['online', 'offline', 'unknown']).optional()
})

// GET /api/repeaters - List all repeaters or filter by criteria
repeaterRoutes.get('/', async (c) => {
  const { callsign, mode, band, status } = c.req.query()
  
  try {
    // Hole alle Relaisdaten (simuliert)
    let repeaters = await getRepeaterStatus(callsign)
    
    // Filter anwenden
    if (mode) {
      repeaters = repeaters.filter(r => r.mode.toLowerCase() === mode.toLowerCase())
    }
    
    if (band) {
      repeaters = repeaters.filter(r => {
        const freq = r.frequencyOut
        switch (band) {
          case '2m': return freq >= 144 && freq < 146
          case '70cm': return freq >= 430 && freq < 440
          case '23cm': return freq >= 1240 && freq < 1300
          case '13cm': return freq >= 2300 && freq < 2450
          case '3cm': return freq >= 10000 && freq < 11000
          default: return true
        }
      })
    }
    
    if (status) {
      repeaters = repeaters.filter(r => r.status === status)
    }
    
    return c.json({ 
      success: true,
      count: repeaters.length,
      data: repeaters
    })
  } catch (error) {
    console.error('[Repeaters] List error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/repeaters/:callsign - Get specific repeater details
repeaterRoutes.get('/:callsign', async (c) => {
  const callsign = c.req.param('callsign')
  
  try {
    const repeaters = await getRepeaterStatus(callsign)
    
    if (repeaters.length === 0) {
      return c.json({ error: 'Repeater not found' }, 404)
    }
    
    return c.json({ 
      success: true,
      data: repeaters[0]
    })
  } catch (error) {
    console.error('[Repeaters] Detail error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/repeaters/nearby - Get repeaters near a specific location
repeaterRoutes.get('/nearby', async (c) => {
  const lat = c.req.query('lat')
  const lng = c.req.query('lng')
  const range = c.req.query('range') || '50' // Default 50km
  
  if (!lat || !lng) {
    return c.json({ error: 'lat and lng parameters required' }, 400)
  }
  
  try {
    // In einer echten Implementierung würden hier Entfernungsrechnungen
    // und geografische Filter angewendet werden
    
    // Momentan geben wir einfach alle Relais zurück mit simulierten Distanzen
    const repeaters = await getRepeaterStatus()
    const nearbyRepeaters = repeaters.map(r => ({
      ...r,
      // Simuliere Distanz und Azimuth
      distance: Math.round(Math.random() * parseInt(range) * 10) / 10,
      azimuth: Math.round(Math.random() * 360)
    }))
    
    return c.json({ 
      success: true,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      range: parseInt(range),
      count: nearbyRepeaters.length,
      data: nearbyRepeaters
    })
  } catch (error) {
    console.error('[Repeaters] Nearby error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/repeaters/stats - Get statistics about repeaters
repeaterRoutes.get('/stats', (c) => {
  const stats = {
    total: SAMPLE_REPEATERS.length,
    online: SAMPLE_REPEATERS.filter(r => r.status === 'online').length,
    offline: SAMPLE_REPEATERS.filter(r => r.status === 'offline').length,
    unknown: SAMPLE_REPEATERS.filter(r => r.status === 'unknown').length,
    modes: {} as Record<string, number>,
    bands: {} as Record<string, number>
  }
  
  // Mode statistics
  SAMPLE_REPEATERS.forEach(r => {
    const mode = r.mode || 'unknown'
    stats.modes[mode] = (stats.modes[mode] || 0) + 1
  })
  
  // Band statistics
  SAMPLE_REPEATERS.forEach(r => {
    const freq = r.frequencyOut
    let band = 'other'
    if (freq >= 144 && freq < 146) band = '2m'
    else if (freq >= 430 && freq < 440) band = '70cm'
    else if (freq >= 1240 && freq < 1300) band = '23cm'
    else if (freq >= 2300 && freq < 2450) band = '13cm'
    else if (freq >= 10000 && freq < 11000) band = '3cm'
    
    stats.bands[band] = (stats.bands[band] || 0) + 1
  })
  
  return c.json({ 
    success: true,
    data: stats
  })
})

export { repeaterRoutes }