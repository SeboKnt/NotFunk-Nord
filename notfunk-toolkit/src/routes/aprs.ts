import { Hono } from 'hono'
import { z } from 'zod'
import { GERMAN_WX_STATIONS, getSampleWXData } from '../data/german-wx-stations'

// APRS.fi API Types
type APRSLocation = {
  name: string
  type: string
  time: string
  lasttime: string
  lat: number
  lng: number
  symbol: string
  srccall: string
  dst: string
  comment: string
  path: string[]
  altitude: number
  speed: number
  direction: number
  phg: string
  status: string
  status_lasttime: string
}

type APRSWeather = {
  name: string
  type: string
  time: string
  lasttime: string
  lat: number
  lng: number
  symbol: string
  srccall: string
  comment: string
  wx: {
    time: string
    celsius: number
    fahrenheit: number
    humidity: number
    pressure: number
    wind_direction: number
    wind_speed: number
    wind_gust: number
    rain_1h: number
    rain_24h: number
    rain_mn: number
    luminosity: number
    uv: number
    crc: string
  }
}

type APRSApiResponse<T> = {
  command: string
  result: string
  what: string
  entries: T[]
}

// Environment bindings
type APRSBindings = {
  APRS_FI_API_KEY?: string
}

const aprsRoutes = new Hono<{ Bindings: APRSBindings }>()

// Validation schemas
const aprsQuerySchema = z.object({
  callsign: z.string().min(1).max(20),
})

const aprsMultiQuerySchema = z.object({
  callsigns: z.array(z.string().min(1).max(20)).max(20), // Max 20 targets per API docs
})

// Helper function to call APRS.fi API
async function callAprsFi<T>(params: Record<string, string>, apiKey: string): Promise<APRSApiResponse<T> | null> {
  const url = new URL('https://api.aprs.fi/api/get')
  url.searchParams.append('apikey', apiKey)
  url.searchParams.append('format', 'json')
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value)
  }

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      console.error(`APRS.fi API error: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json() as APRSApiResponse<T>
    return data
  } catch (error) {
    console.error('Error calling APRS.fi API:', error)
    return null
  }
}

// GET /api/aprs/location/:callsign - Get location data for a specific callsign
aprsRoutes.get('/location/:callsign', async (c) => {
  const callsign = c.req.param('callsign')
  const apiKey = c.env?.APRS_FI_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'APRS_FI_API_KEY not configured' }, 500)
  }
  
  try {
    const data = await callAprsFi<APRSLocation>({ name: callsign, what: 'loc' }, apiKey)
    
    if (!data) {
      return c.json({ error: 'Failed to fetch APRS data' }, 500)
    }
    
    if (data.result !== 'ok') {
      return c.json({ error: `APRS.fi API error: ${data.result}` }, 500)
    }
    
    if (data.entries.length === 0) {
      return c.json({ error: 'Callsign not found' }, 404)
    }
    
    return c.json({ 
      success: true,
      data: data.entries[0]
    })
  } catch (error) {
    console.error('[APRS] Location error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// POST /api/aprs/location - Get location data for multiple callsigns
aprsRoutes.post('/location', async (c) => {
  const body = await c.req.json()
  const parsed = aprsMultiQuerySchema.safeParse(body)
  
  if (!parsed.success) {
    return c.json({ error: 'Invalid request body', details: parsed.error.flatten() }, 400)
  }
  
  const { callsigns } = parsed.data
  const apiKey = c.env?.APRS_FI_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'APRS_FI_API_KEY not configured' }, 500)
  }
  
  try {
    const data = await callAprsFi<APRSLocation>({ name: callsigns.join(','), what: 'loc' }, apiKey)
    
    if (!data) {
      return c.json({ error: 'Failed to fetch APRS data' }, 500)
    }
    
    if (data.result !== 'ok') {
      return c.json({ error: `APRS.fi API error: ${data.result}` }, 500)
    }
    
    return c.json({ 
      success: true,
      count: data.entries.length,
      data: data.entries
    })
  } catch (error) {
    console.error('[APRS] Multi-location error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/aprs/weather/:callsign - Get weather data for a specific WX station
aprsRoutes.get('/weather/:callsign', async (c) => {
  const callsign = c.req.param('callsign')
  const apiKey = c.env?.APRS_FI_API_KEY
  
  // Für Demonstrationszwecke oder wenn kein API-Key vorhanden ist
  if (!apiKey) {
    // Prüfen ob es eine bekannte deutsche Station ist
    const station = GERMAN_WX_STATIONS.find(s => s.callsign === callsign);
    if (station) {
      try {
        const sampleData = await getSampleWXData(callsign);
        return c.json({ 
          success: true,
          demo: true,
          info: 'Demo-Daten (kein API-Key konfiguriert)',
          data: sampleData
        });
      } catch (error) {
        console.error('[APRS] Sample weather error:', error);
        return c.json({ error: 'Internal server error' }, 500);
      }
    }
  }
  
  if (!apiKey) {
    return c.json({ error: 'APRS_FI_API_KEY not configured' }, 500)
  }
  
  try {
    const data = await callAprsFi<APRSWeather>({ name: callsign, what: 'wx' }, apiKey)
    
    if (!data) {
      return c.json({ error: 'Failed to fetch APRS data' }, 500)
    }
    
    if (data.result !== 'ok') {
      return c.json({ error: `APRS.fi API error: ${data.result}` }, 500)
    }
    
    if (data.entries.length === 0) {
      // Wenn keine echten Daten gefunden wurden, Demo-Daten anzeigen falls deutsche Station
      const station = GERMAN_WX_STATIONS.find(s => s.callsign === callsign);
      if (station) {
        const sampleData = await getSampleWXData(callsign);
        return c.json({ 
          success: true,
          demo: true,
          info: 'Keine echten Daten verfügbar, zeige Demo-Daten',
          data: sampleData
        });
      }
      return c.json({ error: 'Weather station not found' }, 404)
    }
    
    return c.json({ 
      success: true,
      data: data.entries[0]
    })
  } catch (error) {
    console.error('[APRS] Weather error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/aprs/telemetry/:callsign - Get telemetry data for a specific station
aprsRoutes.get('/telemetry/:callsign', async (c) => {
  const callsign = c.req.param('callsign')
  const apiKey = c.env?.APRS_FI_API_KEY
  
  if (!apiKey) {
    return c.json({ error: 'APRS_FI_API_KEY not configured' }, 500)
  }
  
  try {
    const data = await callAprsFi<any>({ name: callsign, what: 'obj' }, apiKey)
    
    if (!data) {
      return c.json({ error: 'Failed to fetch APRS data' }, 500)
    }
    
    if (data.result !== 'ok') {
      return c.json({ error: `APRS.fi API error: ${data.result}` }, 500)
    }
    
    return c.json({ 
      success: true,
      data: data.entries
    })
  } catch (error) {
    console.error('[APRS] Telemetry error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/aprs/weather/stations - List known German WX stations
aprsRoutes.get('/weather/stations', (c) => {
  return c.json({ 
    success: true,
    count: GERMAN_WX_STATIONS.length,
    stations: GERMAN_WX_STATIONS
  })
})

export { aprsRoutes }