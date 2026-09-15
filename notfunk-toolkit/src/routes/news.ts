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
  // THW drei aktive RSS-Feeds (Einsätze / Meldungen / Übungen)
  {
    url: 'https://www.thw.de/SiteGlobals/Functions/RSS/DE/RSSNewsfeed_Einsaetze.xml',
    name: 'THW Einsätze',
    category: 'BOS',
    enabled: true,
  },
  {
    url: 'https://www.thw.de/SiteGlobals/Functions/RSS/DE/RSSNewsfeed_Meldungen.xml',
    name: 'THW Meldungen',
    category: 'BOS',
    enabled: true,
  },
  {
    url: 'https://www.thw.de/SiteGlobals/Functions/RSS/DE/RSSNewsfeed_Uebungen.xml',
    name: 'THW Übungen',
    category: 'BOS',
    enabled: false,
  },
  // DARC / ARRL / IARU 均已下线或需要特殊处理，暂不启用
]

// Parser für RSS/Atom-Feeds — block-basiert pro <item>
async function parseRSS(url: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(url)
    const text = await response.text()

    // Regex-extraktion pro <item>-Block
    function decodeEntities(s: string): string {
      return s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    }

    const items: NewsItem[] = []
    const itemMatches = [...text.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/g)]
    for (const m of itemMatches.slice(0, 10)) {
      const block = m[1]
      const title = decodeEntities(block.match(/<title[^>]*>([^<]*)<\/title>/)?.[1] ?? '')
      const link = block.match(/<link[^>]*>([^<]*)<\/link>/)?.[1] ?? ''
      const pubDateMatch = block.match(/<pubDate>([^<]*)<\/pubDate>|<dc:date>([^<]*)<\/dc:date>/)
      const pubDate = pubDateMatch?.[1] || pubDateMatch?.[2] || ''
      const desc = decodeEntities(block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1] ?? '')
      if (!title && !link) continue
      items.push({
        title,
        link,
        pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: '',
        category: '',
        description: desc,
      })
    }
    return items
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
