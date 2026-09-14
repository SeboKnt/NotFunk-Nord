import { Hono } from 'hono'

type QSO = {
  id: string
  timestamp: string
  callsign: string
  gridLocator: string
  frequency: number
  mode: string
  rstSent: string
  rstReceived: string
  notes?: string
  iarlPreamble?: boolean
  serialNumber?: string
}

const logbookRoutes = new Hono()

// In-memory storage (use D1 database in production)
let qsoLog: QSO[] = []
let nextId = 1

// GET /api/logbook - List all QSOs
logbookRoutes.get('/', (c) => {
  const sort = c.req.query('sort')
  const limit = Number(c.req.query('limit'))
  const callsign = c.req.query('callsign')

  let result = [...qsoLog]

  if (callsign) {
    result = result.filter((q) => q.callsign.toLowerCase().includes(callsign.toLowerCase()))
  }

  if (sort === 'date') {
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  if (limit && !isNaN(limit)) {
    result = result.slice(0, limit)
  }

  return c.json({ count: result.length, qso: result })
})

// POST /api/logbook - Add new QSO
logbookRoutes.post('/', async (c) => {
  const body = await c.req.json()
  const qso: QSO = {
    id: String(nextId++),
    timestamp: new Date().toISOString(),
    callsign: body.callsign,
    gridLocator: (body.gridLocator || '').toUpperCase(),
    frequency: Number(body.frequency),
    mode: body.mode,
    rstSent: body.rstSent,
    rstReceived: body.rstReceived,
    notes: body.notes,
    iarlPreamble: body.iarlPreamble,
    serialNumber: body.serialNumber,
  }
  qsoLog.push(qso)
  return c.json(qso, 201)
})

// GET /api/logbook/:id - Get specific QSO
logbookRoutes.get('/:id', (c) => {
  const id = c.req.param('id')
  const qso = qsoLog.find((q) => q.id === id)
  if (!qso) return c.json({ error: 'QSO not found' }, 404)
  return c.json(qso)
})

// PUT /api/logbook/:id - Update QSO
logbookRoutes.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const index = qsoLog.findIndex((q) => q.id === id)
  if (index === -1) return c.json({ error: 'QSO not found' }, 404)

  qsoLog[index] = { ...qsoLog[index], ...body, id }
  return c.json(qsoLog[index])
})

// DELETE /api/logbook/:id - Delete QSO
logbookRoutes.delete('/:id', (c) => {
  const id = c.req.param('id')
  const index = qsoLog.findIndex((q) => q.id === id)
  if (index === -1) return c.json({ error: 'QSO not found' }, 404)

  qsoLog.splice(index, 1)
  return c.json({ success: true })
})

// Stats endpoint
logbookRoutes.get('/stats', (c) => {
  const uniqueCallsigns = new Set(qsoLog.map((q) => q.callsign)).size
  const uniqueGridLocators = new Set(qsoLog.map((q) => q.gridLocator).filter(Boolean)).size
  const uniqueModes = new Set(qsoLog.map((q) => q.mode)).size

  return c.json({
    totalQSO: qsoLog.length,
    uniqueCallsigns,
    uniqueGridLocators,
    uniqueModes,
    dateRange: qsoLog.length > 0 ? {
      earliest: qsoLog.reduce((min, q) => q.timestamp < min ? q.timestamp : min, qsoLog[0].timestamp),
      latest: qsoLog.reduce((max, q) => q.timestamp > max ? q.timestamp : max, qsoLog[0].timestamp),
    } : null,
  })
})

export { logbookRoutes, qsoLog, nextId }
