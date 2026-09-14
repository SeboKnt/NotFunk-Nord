import { Hono } from 'hono'

type EmergencyFreq = {
  name: string
  frequency: number // kHz
  mode: string
  region: string
  description: string
}

type Protocol = {
  name: string
  steps: string[]
  description: string
}

const emergencyRoutes = new Hono()

const emergencyFrequencies: EmergencyFreq[] = [
  {
    name: 'WRC-07 Notruf- und Sicherheitsdienst',
    frequency: 2182,
    mode: 'USB',
    region: 'International',
    description: 'Internationale Schiffsnotruf-Frequenz (MF)',
  },
  {
    name: '156.8 MHz (CH16)',
    frequency: 156.8,
    mode: 'FM',
    region: 'International',
    description: 'Internationale Seenotruf-Frequenz (VHF)',
  },
  {
    name: '121.5 MHz',
    frequency: 121.5,
    mode: 'AM',
    region: 'International',
    description: 'Internationaler Notfunksender für Flugzeuge (VHF)',
  },
  {
    name: '406 MHz EPIRB',
    frequency: 406,
    mode: 'Digital',
    region: 'International',
    description: 'Kosmischer Notfunk-Sender (COSPAS-SARSAT)',
  },
  {
    name: 'Ham-Net Notruf',
    frequency: 3973,
    mode: 'SSB',
    region: 'Norddeutschland',
    description: 'Ham-Net Notrufkanal für Norddeutschland',
  },
  {
    name: 'DARC Notfunk 80m',
    frequency: 3573,
    mode: 'SSB',
    region: 'Deutschland',
    description: 'DARC regionales Notfunknetz 80m',
  },
  {
    name: 'DARC Notfunk 40m',
    frequency: 7095,
    mode: 'SSB',
    region: 'Deutschland',
    description: 'DARC regionales Notfunknetz 40m',
  },
  {
    name: 'DARC Notfunk 20m',
    frequency: 14095,
    mode: 'SSB',
    region: 'Deutschland',
    description: 'DARC regionales Notfunknetz 20m',
  },
  {
    name: 'ARES Net',
    frequency: 3990,
    mode: 'SSB',
    region: 'USA/International',
    description: 'American Red Cross Amateur Radio Emergency Service',
  },
  {
    name: 'WINLINK 2000',
    frequency: 14095,
    mode: 'FSQ',
    region: 'International',
    description: 'Winlink 2000 - Digitale Notfallkommunikation über HF',
  },
  {
    name: 'APRS Notruf',
    frequency: 144.800,
    mode: 'Digital',
    region: 'International',
    description: 'Automatic Packet Reporting System - Positionsnotruf',
  },
  {
    name: 'Mars Net',
    frequency: 3750,
    mode: 'SSB',
    region: 'Deutschland',
    description: 'Deutscher Amateur-Radio-Service (DARC-Mars)',
  },
]

const emergencyProtocols: Protocol[] = [
  {
    name: 'MAYDAY',
    steps: [
      'Dreimal "MAYDAY" rufen',
      'Eigenen Rufnamen nennen',
      'Position (Grid Locator oder Koordinaten)',
      'Notfallart beschreiben',
      'Anzahl der Personen',
      'Eigene Möglichkeiten und Ressourcen',
      'Empfangen "Roger" oder "Affirmative" abwarten',
    ],
    description: 'Internationale Notrufen für Lebensgefahr',
  },
  {
    name: 'PAN-PAN',
    steps: [
      'Dreimal "PAN-PAN" rufen',
      'Eigenen Rufnamen nennen',
      'Position angeben',
      'Art der Notlage',
      'Beihilfe erbitten',
    ],
    description: 'Dringlichkeitsruf (nicht unmittelbar lebensbedrohlich)',
  },
  {
    name: 'Nachtbetrieb',
    steps: [
      'Höhere Bänder wählen (160m, 80m)',
      'Geringere Leistung verwenden',
      'Vertikal-Antenne oder Wire-Antenne',
      'QRP für lokale Verbindungen',
      'Regelmäßige Prowler-Perioden einhalten',
    ],
    description: 'Best Practices für Nachtbetrieb bei Stromausfall',
  },
  {
    name: 'Portable Station',
    steps: [
      'Batterie oder Solarversorgung sicherstellen',
      'Einfache Antenne aufbauen (Endfed, Vertical)',
      'Wetter- und Geländebedingungen beachten',
      'Sichtverbindung mit anderen Stationen herstellen',
      'Regelmäßige Status-Übermittlungen',
    ],
    description: 'Aufbau einer portablem Notfunkstation',
  },
]

// GET /api/emergency/frequencies
emergencyRoutes.get('/frequencies', (c) => {
  const region = c.req.query('region')
  if (region) {
    const filtered = emergencyFrequencies.filter((f) => f.region.includes(region))
    return c.json({ count: filtered.length, frequencies: filtered })
  }
  return c.json({ count: emergencyFrequencies.length, frequencies: emergencyFrequencies })
})

// GET /api/emergency/protocols
emergencyRoutes.get('/protocols', (c) => {
  return c.json({ count: emergencyProtocols.length, protocols: emergencyProtocols })
})

// GET /api/emergency/protocol/:name
emergencyRoutes.get('/protocol/:name', (c) => {
  const name = c.req.param('name').toLowerCase().replace(/\s+/g, '-')
  const protocol = emergencyProtocols.find((p) => p.name.toLowerCase().replace(/\s+/g, '-') === name)
  if (!protocol) return c.json({ error: 'Protocol not found' }, 404)
  return c.json(protocol)
})

// GET /api/emergency/frequency/:freq - Get details for a specific frequency
emergencyRoutes.get('/frequency/:freq', (c) => {
  const freq = c.req.param('freq')
  const target = emergencyFrequencies.find(
    (f) => f.frequency.toString() === freq || f.name.toLowerCase().includes(freq.toLowerCase())
  )
  if (!target) return c.json({ error: 'Frequency not found' }, 404)
  return c.json(target)
})

export { emergencyRoutes, emergencyFrequencies, emergencyProtocols }
