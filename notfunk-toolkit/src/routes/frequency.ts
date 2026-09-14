import { Hono } from 'hono'

type Band = {
  name: string
  min: number
  max: number
  modes: string[]
  description: string
}

type Mode = {
  name: string
  abbreviation: string
  bandwidth: number
  description: string
  typicalUse: string[]
}

const bands: Band[] = [
  {
    name: '160m',
    min: 1800,
    max: 2000,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'MF-Band, nächtliche DX-Funktion, gut für lokale Verbindungen bei Tag',
  },
  {
    name: '80m',
    min: 3500,
    max: 3800,
    modes: ['SSB', 'CW', 'FT8', 'AM'],
    description: 'MF-Notfunk-Band, zuverlässig bei Tag und Nacht für ~1000km',
  },
  {
    name: '60m',
    min: 5330.5,
    max: 5407,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'HAMRAD-Notfunkband (5 MHz), gute Mittelstreckenverbindungen',
  },
  {
    name: '40m',
    min: 7000,
    max: 7200,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'Ideal für Notfunk, zuverlässige DX über 1500-3000km',
  },
  {
    name: '30m',
    min: 10100,
    max: 10150,
    modes: ['CW', 'FT8'],
    description: 'Digitalmode-Band, SSB verboten, gute DX bei hoher Sonnenaktivität',
  },
  {
    name: '20m',
    min: 14000,
    max: 14350,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'Haupt-DX-Band, überlebt auch bei niedrigem Sonnenfleckenzyklus',
  },
  {
    name: '17m',
    min: 18068,
    max: 18168,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'UV-Band, zuverlässige DX bei Sonnenmaximum, schlechter bei Minimum',
  },
  {
    name: '15m',
    min: 21000,
    max: 21450,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'Kurzwellen-DX-Band, optimale Verbindungen bei hoher Sonnenaktivität',
  },
  {
    name: '12m',
    min: 24890,
    max: 24990,
    modes: ['SSB', 'CW', 'FT8'],
    description: 'UV-Band, nur bei starkem Sonnenfleckenzyklus aktiv nutzbar',
  },
  {
    name: '10m',
    min: 28000,
    max: 29700,
    modes: ['SSB', 'CW', 'FT8', 'FM', 'ATV'],
    description: 'VHF-Notfunkband, meteor-scatter und F2-Propagation möglich',
  },
  {
    name: '6m',
    min: 50000,
    max: 54000,
    modes: ['SSB', 'CW', 'FT8', 'FM', 'SSTV'],
    description: 'VHF-, UV-Notfunkband, regionale Verbindungen, Sporadische E-Propagation',
  },
  {
    name: '2m',
    min: 144000,
    max: 146000,
    modes: ['SSB', 'CW', 'FT8', 'FM', 'ATV', 'SSTV'],
    description: 'Haupt-VHF-Notfunkband, lokale Reichweite bis ~50km',
  },
  {
    name: '70cm',
    min: 430000,
    max: 440000,
    modes: ['FM', 'SSB', 'FT8', 'ATV'],
    description: 'UHF-Notfunkband, gute Gebäudedurchdringung, Satellitenkommunikation',
  },
  {
    name: '23cm',
    min: 1240000,
    max: 1300000,
    modes: ['FM', 'ATV', 'SSB'],
    description: 'Mikrowellenband, lokale und Satellitenverbindungen',
  },
  {
    name: '13cm',
    min: 2300000,
    max: 2450000,
    modes: ['FM', 'ATV'],
    description: 'Mikrowellenband für lokale Hochgeschwindigkeitsdatenübertragung',
  },
]

const modes: Mode[] = [
  {
    name: 'Amateur Radio Emergency Service',
    abbreviation: 'ARES',
    bandwidth: 3000,
    description: 'US-Notfalldienst für Amateurfunk im Katastrophenfall',
    typicalUse: ['Notfallkommunikation', 'Behördenkoordination'],
  },
  {
    name: 'Single Sideband',
    abbreviation: 'SSB',
    bandwidth: 2400,
    description: 'Effiziente Sprachmodulation für Fernverbindungen',
    typicalUse: ['DX-Kontakt', 'Notfallkommunikation', 'Regelmäßiger Funkverkehr'],
  },
  {
    name: 'Continuous Wave',
    abbreviation: 'CW',
    bandwidth: 1500,
    description: 'Morsecode mit sehr guter Reichweite und geringem Bandbreitenbedarf',
    typicalUse: ['DX-Kontakt', 'Schwache Signale', 'QRP-Operationen'],
  },
  {
    name: 'Frequency Shift Keying - FT8',
    abbreviation: 'FT8',
    bandwidth: 50,
    description: 'Digitale Weak-Signal-Mode von Joe Taylor W1JKL',
    typicalUse: ['DX-Worken', 'Contesten', 'Seltene Stationen'],
  },
  {
    name: 'Frequency Modulation',
    abbreviation: 'FM',
    bandwidth: 12000,
    description: 'Sprachmodulation mit gutem Rauschabstand',
    typicalUse: ['Lokale Kommunikation', 'Relaisbetrieb', 'Nahbereichsnetzwerke'],
  },
  {
    name: 'Amateur Television',
    abbreviation: 'ATV',
    bandwidth: 45000000,
    description: 'Übertragung von bewegten Bildern',
    typicalUse: ['Satellitenkommunikation', 'Demonstrationen'],
  },
  {
    name: 'Slow Scan Television',
    abbreviation: 'SSTV',
    bandwidth: 3000,
    description: 'Übertragung von statischen Bildern über Funk',
    typicalUse: ['Bildübertragung', 'Spezialereignisse'],
  },
]

const frequencyRoutes = new Hono()

// GET /api/frequency/bands
frequencyRoutes.get('/bands', (c) => {
  return c.json({
    bands: bands.map((b) => ({ ...b })),
    total: bands.length,
  })
})

// GET /api/frequency/band/:name
frequencyRoutes.get('/band/:name', (c) => {
  const name = c.req.param('name').toLowerCase().replace('-', 'm')
  const band = bands.find((b) => b.name.toLowerCase() === name)
  if (!band) return c.json({ error: `Band ${name} not found` }, 404)
  return c.json(band)
})

// GET /api/frequency/modes
frequencyRoutes.get('/modes', (c) => {
  return c.json({ modes })
})

// GET /api/frequency/search?mode=SSB&band=20m
frequencyRoutes.get('/search', (c) => {
  const mode = c.req.query('mode')?.toUpperCase()
  const band = c.req.query('band')?.toLowerCase()

  let results = [...bands]

  if (band) {
    const normalizedBand = band.replace(/m$/, 'm').toLowerCase()
    results = results.filter((b) => b.name.toLowerCase() === normalizedBand)
  }

  if (mode) {
    results = results.filter((b) => b.modes.includes(mode))
  }

  return c.json({
    results,
    total: results.length,
    filters: { mode, band },
  })
})

export { frequencyRoutes, bands, modes }
