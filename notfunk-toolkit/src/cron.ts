import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'

type Bindings = {
  NEWS_CACHE: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

// Cron job endpoint to update news cache
app.get('/cron/news', async (c) => {
  // In a real implementation, this would fetch news and update the cache
  // For now, we'll just return a success message
  return c.json({
    success: true,
    message: 'Cron job executed successfully',
    timestamp: new Date().toISOString()
  })
})

// Fallback for root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'NotFunk-Nord Cron Service',
    description: 'Cron jobs for NotFunk-Nord services',
    endpoints: {
      news: '/cron/news'
    }
  })
})

export default app