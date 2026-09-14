import { Hono } from 'hono'
import { z } from 'zod'

const qthRoutes = new Hono()

// Maidenhead Locator System (Grid Squares)
// https://en.wikipedia.org/wiki/Maidenhead_Locator_System

type LatLon = { lat: number; lon: number }

/**
 * Convert latitude/longitude to a Maidenhead locator.
 * Supports 2, 4, 6, 8 and 10 character precision.
 */
export function toLocator(lat: number, lon: number, precision: 2 | 4 | 6 | 8 | 10 = 6): string {
  // Normalize to valid ranges
  lat = Math.max(-90, Math.min(90, lat))
  lon = Math.max(-180, Math.min(180, lon))

  const lonAdj = lon + 180 // 0..360
  const latAdj = lat + 90 // 0..180

  let result = ''

  // Field: 20° lon x 10° lat
  const fieldLon = Math.floor(lonAdj / 20)
  const fieldLat = Math.floor(latAdj / 10)
  result += String.fromCharCode(65 + fieldLon) + String.fromCharCode(65 + fieldLat)

  if (precision <= 2) return result

  // Square: 2° lon x 1° lat
  const sqLon = Math.floor((lonAdj % 20) / 2)
  const sqLat = Math.floor((latAdj % 10) / 1)
  result += sqLon.toString() + sqLat.toString()

  if (precision <= 4) return result

  // Subsquare: 5' lon x 2.5' lat
  const lonRem = (lonAdj % 2) * 60 // minutes
  const latRem = (latAdj % 1) * 60
  const subLon = Math.floor(lonRem / 5)
  const subLat = Math.floor(latRem / 2.5)
  result += String.fromCharCode(97 + subLon) + String.fromCharCode(97 + subLat)

  if (precision <= 6) return result

  // Extended square: 2.5" lon x 1.25" lat
  const exLonRem = (lonRem % 5) * 60 // seconds
  const exLatRem = (latRem % 2.5) * 60
  const exLon = Math.floor(exLonRem / 30) // 2.5 * 60 = 150 sec, 150/30 = 5
  const exLat = Math.floor(exLatRem / 75) // 1.25 * 60 = 75 sec
  result += exLon.toString() + exLat.toString()

  if (precision <= 8) return result

  // Ultra precision: 0.625" lon x 0.3125" lat
  const ultraLonRem = (exLonRem % 30) * 10 // 0.1 sec units
  const ultraLatRem = (exLatRem % 75) * 10
  const ultraLon = Math.floor(ultraLonRem / 6.25) // 0.625 * 10 = 6.25
  const ultraLat = Math.floor(ultraLatRem / 3.125) // 0.3125 * 10 = 3.125
  result += ultraLon.toString() + ultraLat.toString()

  return result
}

/**
 * Decode a Maidenhead locator to lat/lon (bottom-left corner and center).
 */
export function fromLocator(locator: string): { corner: LatLon; center: LatLon } {
  const loc = locator.trim().toUpperCase()
  if (loc.length < 4) throw new Error('Locator must be at least 4 characters')

  // Field: 20° lon x 10° lat
  let lon = (loc.charCodeAt(0) - 65) * 20 - 180
  let lat = (loc.charCodeAt(1) - 65) * 10 - 90

  // Square: 2° lon x 1° lat
  if (loc.length >= 4) {
    lon += parseInt(loc[2], 10) * 2
    lat += parseInt(loc[3], 10) * 1
  }

  // Subsquare: 5' lon x 2.5' lat
  if (loc.length >= 6) {
    const subLon = loc.charCodeAt(4) - 97
    const subLat = loc.charCodeAt(5) - 97
    lon += (subLon * 5) / 60
    lat += (subLat * 2.5) / 60
  }

  // Extended: 2.5" lon x 1.25" lat
  let exLon = 0
  let exLat = 0
  if (loc.length >= 8) {
    exLon = parseInt(loc[6], 10) * (2.5 / 60 / 60)
    exLat = parseInt(loc[7], 10) * (1.25 / 60 / 60)
  }

  const corner = { lat, lon }
  const center = {
    lat: lat + exLat + (loc.length >= 6 ? 2.5 / 120 : 0.5),
    lon: lon + exLon + (loc.length >= 6 ? 5 / 120 : 1),
  }
  return { corner, center }
}

/** Great-circle distance between two lat/lon points in km (Haversine). */
export function haversine(a: LatLon, b: LatLon): number {
  const R = 6371 // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** Initial bearing between two lat/lon points in degrees. */
export function bearing(a: LatLon, b: LatLon): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const dLon = toRad(b.lon - a.lon)
  const y = Math.sin(dLon) * Math.cos(toRad(b.lat))
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.cos(dLon)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

// Validation schemas
const latLonSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
})

const locatorSchema = z.object({
  locator: z.string().min(4).max(10).regex(/^[A-Za-z0-9]+$/, 'Invalid locator characters'),
})

// POST /api/qth/locator - Convert lat/lon to locator
qthRoutes.post('/locator', (c) => {
  const body = c.req.json().then((data) => latLonSchema.parse(data))
  return body.then(
    ({ lat, lon }) => c.json({ lat, lon, locator: toLocator(lat, lon), precision: 6 }),
    (e) => c.json({ error: 'Invalid lat/lon', details: e.message }, 400)
  )
})

// GET /api/qth/locator?lat=53.55&lon=10.0
qthRoutes.get('/locator', (c) => {
  const lat = Number(c.req.query('lat'))
  const lon = Number(c.req.query('lon'))
  if (isNaN(lat) || isNaN(lon)) return c.json({ error: 'lat and lon are required' }, 400)
  return c.json({ lat, lon, locator: toLocator(lat, lon) })
})

// GET /api/qth/decode?locator=JO43
qthRoutes.get('/decode', (c) => {
  const locator = c.req.query('locator')
  if (!locator) return c.json({ error: 'locator query parameter required' }, 400)
  try {
    const { corner, center } = fromLocator(locator)
    return c.json({
      locator: locator.toUpperCase(),
      corner: { lat: round(corner.lat), lon: round(corner.lon) },
      center: { lat: round(center.lat), lon: round(center.lon) },
    })
  } catch (e) {
    return c.json({ error: 'Invalid locator', details: (e as Error).message }, 400)
  }
})

// GET /api/qth/distance?from=JO43&to=JO31
qthRoutes.get('/distance', (c) => {
  const from = c.req.query('from')
  const to = c.req.query('to')
  if (!from || !to) return c.json({ error: 'from and to locators required' }, 400)
  try {
    const a = fromLocator(from).center
    const b = fromLocator(to).center
    const km = haversine(a, b)
    return c.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      km: round(km),
      miles: round(km * 0.621371),
      nauticalMiles: round(km * 0.539957),
    })
  } catch (e) {
    return c.json({ error: 'Invalid locator', details: (e as Error).message }, 400)
  }
})

// GET /api/qth/bearing?from=JO43&to=JO31
qthRoutes.get('/bearing', (c) => {
  const from = c.req.query('from')
  const to = c.req.query('to')
  if (!from || !to) return c.json({ error: 'from and to locators required' }, 400)
  try {
    const a = fromLocator(from).center
    const b = fromLocator(to).center
    const brg = bearing(a, b)
    const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    return c.json({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      bearing: round(brg),
      compassDirection: compass[Math.round(brg / 22.5) % 16],
    })
  } catch (e) {
    return c.json({ error: 'Invalid locator', details: (e as Error).message }, 400)
  }
})

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

export { qthRoutes }
