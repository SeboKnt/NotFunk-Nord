// Notfunk-Nord — RSS News Aggregator
// Aggregiert Feeds von DARC, THW, BBK, IARU, ARRL und wandelt sie in ein einheitliches Format um

import { Hono } from 'hono'

type KVCacheBindings = {
  NEWS_CACHE: KVNamespace
}

type NewsItem = {
  title: string
  link: string
  pubDate: string  // ISO 8601
  source: string   // Feed name (e.g. "DARC", "THW")
  category: string // BOS | Weather | Events | General
  description: string
}

// Konfiguration der RSS-Feeds
const RSS_FEEDS: Array<{
  url: string
  name: string
  category: string
  enabled: boolean
}> = [
  // Deutschland-spezifisch
  {
    url: 'https://www.darc.de/rss/feed-notfunk.xml',
    name: 'DARC Notfunk',
    category: 'BOS',
    enabled: true,
  },
  {
    url: 'https://www.thw.de/DE/thw-offen/service/rss/thw-rss.xml',
    name: 'THW Infos',
    category: 'BOS',
    enabled: true,
  },
  {
    url: 'https://www.bbk.bund.de/DE/themen/sicherheit-und-katastrophenschutz/notfallvorsorge/rss-node.html',
    name: 'BBK Notfall',
    category: 'BOS',
    enabled: false, // Benötigt XML-Parsing-Logik
  },
  // International
  {
    url: 'https://www.iaru.org/news/',
    name: 'IARU News',
    category: 'General',
    enabled: false, // Keine RSS-URL verfügbar
  },
  {
    url: 'https://www.arrl.org/rss/news',
    name: 'ARRL News',
    category: 'General',
    enabled: true,
  },
]

// Parser-Funktion für RSS/Atom-Feeds
async function parseRSS(url: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url)
    const text = await response.text()

    // Einfaches Regex-basiertes Parsing (für Cloudflare Workers optimiert)
    const items: NewsItem[] = []

    // Titel extrahieren
    const titleRegex = /<title[^>]*>([^<]+)<\/title>/g
    let titleMatch
    while ((titleMatch = titleRegex.exec(text)) !== null) {
      items.push({
        title: titleMatch[1].trim(),
        link: '',
        pubDate: new Date().toISOString(),
        source: '',
        category: '',
        description: '',
      })
    }

    // Link extrahieren
    const linkRegex = /<link[^>]*>([^<]+)<\/link>/g
    let linkMatch
    while ((linkMatch = linkRegex.exec(text)) !== null) {
      if (items.length > 0 && !items[items.length - 1].link) {
        items[items.length - 1].link = linkMatch[1].trim()
      }
    }

    // Publikationsdatum extrahieren
    const dateRegex = /<pubDate>([^<]+)<\/pubDate>|<dc:date>([^<]+)<\/dc:date>/g
    let dateMatch
    while ((dateMatch = dateRegex.exec(text)) !== null) {
      const dateStr = dateMatch[1] || dateMatch[2]
      if (items.length > 0 && !items[items.length - 1].pubDate) {
        items[items.length - 1].pubDate = new Date(dateStr).toISOString()
      }
    }

    return items.slice(0, 10) // Maximal 10 Items pro Feed
  } catch (error) {
    console.error(`[NF-Nord] RSS Parser Error for ${url}:`, error)
    return []
  }
}

// Haupt-Router
const newsRoutes = new Hono<{ Bindings: KVCacheBindings }>()

const CACHE_KEY = 'notfunk-news'
const CACHE_TTL = 900 // 15 Minuten

// GET /api/news - Alle News aggregieren mit Caching
newsRoutes.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10')
  const category = c.req.query('category')
  const source = c.req.query('source')
  const forceRefresh = c.req.query('refresh') === '1'

  // Prüfe Cache (ohne KV: einfache Memory-Cache Simulation)
  // In Produktion: c.env.NEWS_CACHE.get(CACHE_KEY) verwenden
  if (!forceRefresh) {
    // Simulierter Cache-Hit für Demo
    const cached = c.env?.NEWS_CACHE
    if (cached) {
      try {
        const cachedData = await cached.get(CACHE_KEY, 'json') as any
        if (cachedData) {
          return c.json({
            count: cachedData.items.length,
            items: cachedData.items.slice(0, limit),
            sources: cachedData.sources,
            lastUpdate: cachedData.lastUpdate,
            cached: true,
          })
        }
      } catch (e) {
        // Cache-Fehler, fahre mit normaler Abfrage fort
      }
    }
  }

  // Parallel alle aktivierten Feeds abrufen
  const enabledFeeds = RSS_FEEDS.filter((feed) => feed.enabled)
  const results = await Promise.all(
    enabledFeeds.map(async (feed) => {
      const items = await parseRSS(feed.url)
      return items.map((item) => ({
        ...item,
        source: feed.name,
        category: feed.category,
      }))
    })
  )

  // Alle Items zusammenführen
  let allItems: NewsItem[] = results.flat()

  // Nach Datum sortieren (neueste zuerst)
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

  // Filter anwenden
  if (category) {
    allItems = allItems.filter((item) => item.category === category)
  }
  if (source) {
    allItems = allItems.filter((item) => item.source === source)
  }

  // Limit anwenden
  allItems = allItems.slice(0, limit)

  const response = {
    count: allItems.length,
    items: allItems,
    sources: enabledFeeds.map((f) => f.name),
    lastUpdate: new Date().toISOString(),
    cached: false,
  }

  // In Cache speichern (wenn KV verfügbar)
  if (c.env?.NEWS_CACHE) {
    try {
      await c.env.NEWS_CACHE.put(CACHE_KEY, JSON.stringify(response), {
        expirationTtl: CACHE_TTL,
      })
    } catch (e) {
      // Cache-Speicherung optional
    }
  }

  return c.json(response)
})

// GET /api/news/sources - Verfügbare Quellen
newsRoutes.get('/sources', (c) => {
  return c.json({
    sources: RSS_FEEDS.map((feed) => ({
      name: feed.name,
      category: feed.category,
      enabled: feed.enabled,
      url: feed.url,
    })),
    total: RSS_FEEDS.length,
    enabled: RSS_FEEDS.filter((f) => f.enabled).length,
  })
})

// GET /api/news/category/:category - News nach Kategorie
newsRoutes.get('/category/:category', async (c) => {
  const category = c.req.param('category')
  const limit = parseInt(c.req.query('limit') || '10')

  // Kategorien: BOS | Weather | Events | General
  const validCategories = ['BOS', 'Weather', 'Events', 'General']
  if (!validCategories.includes(category)) {
    return c.json({ error: 'Invalid category', valid: validCategories }, 400)
  }

  // Feeds für diese Kategorie filtern
  const categoryFeeds = RSS_FEEDS.filter(
    (feed) => feed.enabled && feed.category === category
  )

  if (categoryFeeds.length === 0) {
    return c.json({ count: 0, items: [], category })
  }

  const results = await Promise.all(
    categoryFeeds.map(async (feed) => {
      const items = await parseRSS(feed.url)
      return items.map((item) => ({
        ...item,
        source: feed.name,
        category: feed.category,
      }))
    })
  )

  let allItems: NewsItem[] = results.flat()
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  allItems = allItems.slice(0, limit)

  return c.json({
    count: allItems.length,
    items: allItems,
    category,
  })
})

// POST /api/news/cache/clear - Cache leeren (für Development)
newsRoutes.post('/cache/clear', (c) => {
  // Hinweis: Bei Cloudflare Workers müsste hier KV oder D1 verwendet werden
  return c.json({ message: 'Cache cleared (simuliert)', timestamp: new Date().toISOString() })
})

export { newsRoutes, parseRSS, RSS_FEEDS, type NewsItem }
