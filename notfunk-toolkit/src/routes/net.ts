import { Hono } from 'hono'

type NetParticipant = {
  callsign: string
  gridLocator: string
  checkedInAt: string
  lastQTH: string
}

type Net = {
  id: string
  name: string
  frequency: number
  mode: string
  schedule: string
  description: string
  participants: NetParticipant[]
  created: string
}

const netRoutes = new Hono()

// In-memory storage
let nets: Net[] = []
let nextId = 1

// GET /api/net - List all nets
netRoutes.get('/', (c) => {
  return c.json({ count: nets.length, nets })
})

// POST /api/net - Create new net
netRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const net: Net = {
    id: String(nextId++),
    name: body.name,
    frequency: Number(body.frequency),
    mode: body.mode,
    schedule: body.schedule,
    description: body.description,
    participants: [],
    created: new Date().toISOString(),
  }
  nets.push(net)
  return c.json(net, 201)
})

// GET /api/net/:id - Get specific net
netRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const net = nets.find((n) => n.id === id)
  if (!net) return c.json({ error: 'Net not found' }, 404)
  return c.json(net)
})

// POST /api/net/:id/checkin - Check in to a net
netRoutes.post('/:id/checkin', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const net = nets.find((n) => n.id === id)
  if (!net) return c.json({ error: 'Net not found' }, 404)

  const participant: NetParticipant = {
    callsign: body.callsign,
    gridLocator: (body.gridLocator || '').toUpperCase(),
    checkedInAt: new Date().toISOString(),
    lastQTH: body.lastQTH || '',
  }
  net.participants.push(participant)
  return c.json({ success: true, participant, net })
})

// POST /api/net/:id/checkout - Checkout from a net
netRoutes.post('/:id/checkout', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const net = nets.find((n) => n.id === id)
  if (!net) return c.json({ error: 'Net not found' }, 404)

  net.participants = net.participants.filter(
    (p) => p.callsign !== body.callsign
  )
  return c.json({ success: true, remaining: net.participants.length })
})

// Predefined emergency nets for the North
netRoutes.get('/preset', (c) => {
  const presetNets = [
    {
      name: 'Nördliches Notfunknetz',
      frequency: 3573,
      mode: 'SSB',
      schedule: 'Mo-Fr 18:00-19:00 UTC',
      description: 'Regionales Notfunknetz für den Norden',
    },
    {
      name: 'DARC Notfunkdienst',
      frequency: 14095,
      mode: 'SSB',
      schedule: 'Täglich 12:00-13:00 UTC',
      description: 'DARC-regionaler Notfunkdienst',
    },
    {
      name: 'ARES Nord',
      frequency: 21350,
      mode: 'SSB',
      schedule: 'Mi 19:00-20:00 UTC',
      description: 'Emergency Service Netz für den Norden',
    },
  ]
  return c.json({ presetNets })
})

export { netRoutes, nets }
