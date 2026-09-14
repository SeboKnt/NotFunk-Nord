import { Hono } from 'hono'

type LatLon = { lat: number; lon: number }

type PropagationResult = {
  timestamp: string
  location: LatLon
  predictions: {
    muf: number
    luf: number
    foF2: number
    ionosphericCondition: 'good' | 'moderate' | 'poor' | 'storm'
    recommendedBand: string
  }
}

const propagationRoutes = new Hono()

/**
 * Calculate ionospheric propagation parameters for a given location.
 * Uses simplified IONOS model suitable for edge computation.
 */
const calculatePropagation = (lat: number, lon: number): PropagationResult => {
  const now = new Date()
  const hour = now.getUTCHours() + now.getUTCMinutes() / 60

  // Solar flux index varies over ~11 year cycle (simplified)
  const solarFlux = 70 + Math.sin(((now.getFullYear() - 2020) % 11) / 11 * Math.PI) * 60
  // Add daily variation
  const solarFluxVariation = Math.max(0, Math.cos(((hour - 12) % 24) / 24 * 2 * Math.PI)) * 20
  const effectiveFlux = solarFlux + solarFluxVariation

  // Day/Night factor based on local time
  const localHour = ((hour + lon / 15) % 24 + 24) % 24
  const dayFactor = Math.max(0, Math.cos((localHour - 12) / 24 * 2 * Math.PI))

  // Latitude factor
  const latFactor = 1 - Math.abs(lat) / 90 * 0.3

  // MUF (Maximum Usable Frequency) in MHz
  const muf = Math.max(1, Math.min(100, effectiveFlux * 0.6 * dayFactor * latFactor + 15))

  // LUF (Lowest Usable Frequency) in MHz
  const luf = Math.max(1, muf * 0.15 + 2)

  // foF2 (Critical frequency of F2-layer) in MHz
  const foF2 = muf * 0.7 + 1

  // Determine ionospheric condition
  let condition: PropagationResult['predictions']['ionosphericCondition'] = 'moderate'
  if (muf > 30 && dayFactor > 0.5) {
    condition = 'good'
  } else if (muf < 10 || dayFactor < 0.1) {
    condition = 'poor'
  } else if (effectiveFlux > 150) {
    condition = 'storm'
  }

  // Recommend best band
  const bandMap: [number, number, string][] = [
    [0, 5, '6m'],
    [5, 10, '10m'],
    [10, 18, '15m'],
    [18, 25, '20m'],
    [25, 35, '40m'],
    [35, 50, '80m'],
    [50, 100, '160m'],
  ]

  let recommendedBand = '20m'
  for (const [min, max, band] of bandMap) {
    if (muf >= min && muf < max) {
      recommendedBand = band
      break
    }
  }

  return {
    timestamp: now.toISOString(),
    location: { lat, lon },
    predictions: {
      muf,
      luf,
      foF2,
      ionosphericCondition: condition,
      recommendedBand,
    },
  }
}

// GET /api/propagation/muf?lat=53.55&lon=10.0
propagationRoutes.get('/muf', (c) => {
  const lat = Number(c.req.query('lat'))
  const lon = Number(c.req.query('lon'))
  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ error: 'lat and lon query parameters are required' }, 400)
  }
  const result = calculatePropagation(lat, lon)
  return c.json({
    muf: Math.round(result.predictions.muf * 100) / 100,
    luf: Math.round(result.predictions.luf * 100) / 100,
    recommendedBand: result.predictions.recommendedBand,
    timestamp: result.timestamp,
    location: result.location,
  })
})

// GET /api/propagation/luf?lat=53.55&lon=10.0
propagationRoutes.get('/luf', (c) => {
  const lat = Number(c.req.query('lat'))
  const lon = Number(c.req.query('lon'))
  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ error: 'lat and lon query parameters are required' }, 400)
  }
  const result = calculatePropagation(lat, lon)
  return c.json({
    luf: Math.round(result.predictions.luf * 100) / 100,
    timestamp: result.timestamp,
    location: result.location,
  })
})

// GET /api/propagation/fof2?lat=53.55&lon=10.0
propagationRoutes.get('/fof2', (c) => {
  const lat = Number(c.req.query('lat'))
  const lon = Number(c.req.query('lon'))
  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ error: 'lat and lon query parameters are required' }, 400)
  }
  const result = calculatePropagation(lat, lon)
  return c.json({
    foF2: Math.round(result.predictions.foF2 * 100) / 100,
    timestamp: result.timestamp,
    location: result.location,
  })
})

// GET /api/propagation/predict?lat=53.55&lon=10.0 - Full prediction
propagationRoutes.get('/predict', (c) => {
  const lat = Number(c.req.query('lat'))
  const lon = Number(c.req.query('lon'))
  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ error: 'lat and lon query parameters are required' }, 400)
  }
  return c.json(calculatePropagation(lat, lon))
})

// GET /api/propagation/status - Default Hamburg location
propagationRoutes.get('/status', (c) => {
  const result = calculatePropagation(53.55, 10.0)
  return c.json({
    ...result,
    globalContext: {
      solarCyclePhase: `Solar cycle phase: ${(((new Date().getFullYear() - 2020) % 11) / 11 * 100).toFixed(0)}%`,
      recommendedBand: result.predictions.recommendedBand,
      notes: [
        'Predictions based on simplified IONOS model',
        'Actual conditions may vary due to solar storms and geomagnetic activity',
        'For real-time data, see https://www.spaceweather.gov',
      ],
    },
  })
})

export { propagationRoutes, calculatePropagation }
