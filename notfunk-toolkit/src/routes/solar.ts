import { Hono } from 'hono'

type SolarData = {
  timestamp: string
  flux: number
  kpIndex: number
  xrayClass: string
  aIndex: number
  predictedTrend: 'stable' | 'improving' | 'degrading'
}

type SunriseSet = {
  sunrise: string
  sunset: string
  twilightStart: string
  twilightEnd: string
}

const solarRoutes = new Hono()

/**
 * Calculate approximate sunrise/sunset times for a given location and date.
 */
function calculateSunTimes(lat: number, lon: number, date: Date = new Date()): SunriseSet {
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()

  // Solar declination approximation
  const declination = 23.45 * Math.sin(((360 / 365) * (month - 81)) * (2 * Math.PI / 360))
  const latRad = (lat * Math.PI) / 180
  const declRad = (declination * Math.PI) / 180

  // Hour angle for sunrise/sunset (when sun is at horizon)
  const cosHA = -Math.tan(latRad) * Math.tan(declRad)
  if (cosHA > 1 || cosHA < -1) {
    // Polar day/night
    return {
      sunrise: '--:--',
      sunset: '--:--',
      twilightStart: '--:--',
      twilightEnd: '--:--',
    }
  }

  const ha = Math.acos(cosHA) * 180 / Math.PI
  const solarNoon = 12 - lon / 15
  const dayLength = 2 * ha / 15

  const sunset = solarNoon + dayLength / 2
  const sunrise = solarNoon - dayLength / 2
  const civilTwilightOffset = 6 // minutes

  return {
    sunrise: formatTime(sunrise),
    sunset: formatTime(sunset),
    twilightStart: formatTime(sunrise - civilTwilightOffset / 60),
    twilightEnd: formatTime(sunset + civilTwilightOffset / 60),
  }
}

function formatTime(decimalHours: number): string {
  // Normalize to 0-24
  decimalHours = ((decimalHours % 24) + 24) % 24
  const hours = Math.floor(decimalHours)
  const minutes = Math.floor((decimalHours - hours) * 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Predict solar flux index based on solar cycle position.
 */
function predictSolarFlux(date: Date = new Date()): number {
  const year = date.getFullYear()
  const solarCyclePhase = ((year - 2020) % 11) / 11
  const baseFlux = 70 + Math.sin(solarCyclePhase * Math.PI) * 80
  return Math.round(baseFlux)
}

/**
 * Predict KP index with slight diurnal variation.
 */
function predictKpIndex(date: Date = new Date()): number {
  const hour = date.getUTCHours()
  const baseKp = 3
  const variation = Math.sin((hour / 24) * 2 * Math.PI) * 1
  return Math.max(0, Math.min(9, Math.round(baseKp + variation)))
}

/**
 * Predict X-ray flare class based on KP and solar flux.
 */
function predictXrayClass(kp: number, flux: number): string {
  if (kp >= 7 && flux >= 150) return 'X'
  if (kp >= 6 && flux >= 120) return 'M'
  if (kp >= 4 && flux >= 80) return 'C'
  return 'B'
}

/**
 * Determine geomagnetic activity trend.
 */
function predictTrend(flux: number, kp: number): SolarData['predictedTrend'] {
  if (flux >= 120 && kp >= 4) return 'improving'
  if (flux <= 80 && kp <= 2) return 'degrading'
  return 'stable'
}

// GET /api/solar/flux
solarRoutes.get('/flux', (c) => {
  const date = new Date()
  const flux = predictSolarFlux(date)
  return c.json({
    flux,
    unit: 'SFU (Solar Flux Units)',
    timestamp: date.toISOString(),
    solarCycleNote: `Solar cycle phase: ${(((date.getFullYear() - 2020) % 11) / 11 * 100).toFixed(0)}%`,
  })
})

// GET /api/solar/kp
solarRoutes.get('/kp', (c) => {
  const date = new Date()
  const kp = predictKpIndex(date)
  return c.json({
    kpIndex: kp,
    scale: '0-9 (planetary K-index)',
    interpretation: getKpInterpretation(kp),
    timestamp: date.toISOString(),
  })
})

// GET /api/solar/xray
solarRoutes.get('/xray', (c) => {
  const date = new Date()
  const kp = predictKpIndex(date)
  const flux = predictSolarFlux(date)
  const xrayClass = predictXrayClass(kp, flux)
  return c.json({
    xrayClass,
    scale: 'A, B, C, M, X (increasing intensity)',
    interpretation: getXrayInterpretation(xrayClass),
    timestamp: date.toISOString(),
  })
})

// GET /api/solar/summary - Full solar summary
solarRoutes.get('/summary', (c) => {
  const date = new Date()
  const flux = predictSolarFlux(date)
  const kp = predictKpIndex(date)
  const xrayClass = predictXrayClass(kp, flux)
  const trend = predictTrend(flux, kp)

  return c.json({
    timestamp: date.toISOString(),
    solarFlux: flux,
    kpIndex: kp,
    xrayClass,
    aIndex: Math.round(kp * 2),
    predictedTrend: trend,
    sunTimes: calculateSunTimes(53.55, 10.0, date),
    notes: getSolarNotes(trend),
  })
})

// Helpers
function getKpInterpretation(kp: number): string {
  if (kp >= 7) return 'Starker geomagnetischer Sturm - Störungen der Ionosphäre erwartet'
  if (kp >= 5) return 'Geomagnetischer Sturm - Mögliche Störungen der Funkverbindungen'
  if (kp >= 3) return 'Unruhige geomagnetische Bedingungen'
  return 'Ruhige geomagnetische Bedingungen - Gute Ausbreitungsbedingungen'
}

function getXrayInterpretation(class_: string): string {
  switch (class_) {
    case 'X':
      return 'Starkes Sonneneruption - Kann globale Funkstörungen verursachen'
    case 'M':
      return 'Mittlere Sonneneruption - Mögliche polare Dämpfung'
    case 'C':
      return 'Schwache Sonneneruption - Normalerweise keine Auswirkungen'
    default:
      return 'Keine signifikante Aktivität'
  }
}

function getSolarNotes(trend: string): string[] {
  switch (trend) {
    case 'improving':
      return [
        'Verbesserte Ausbreitungsbedingungen erwartet',
        'Hohe Frequenzen (10m, 15m) sollten gut nutzbar sein',
        'Solare Flux > 120 - DX-Verbindungen wahrscheinlich',
      ]
    case 'degrading':
      return [
        'Verschlechterte Ausbreitungsbedingungen',
        'Niedrige Frequenzen (80m, 160m) sollten bevorzugt werden',
        'Sonarische Flux < 80 - DX-Verbindungen schwieriger',
      ]
    default:
      return [
        'Moderate Ausbreitungsbedingungen',
        'Mittlere Frequenzen (20m, 40m) sollten gut funktionieren',
      ]
  }
}

export { solarRoutes, predictSolarFlux, predictKpIndex, predictXrayClass, predictTrend, calculateSunTimes }
