// Notfunk-Nord — Hugging Face AI Assistant (EU Server)
// Fragen zu Notfunk, Frequenzen, Equipment, Verfahren

import { Hono } from 'hono'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AIResponse = {
  reply: string
  model: string
  tokens: number
  cached: boolean
}

// Hugging Face Inference API (kostenlose Tier, EU Server)
const HF_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'
const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.2'

// System-Prompt für Notfunk-Experte
const SYSTEM_PROMPT = `Du bist ein erfahrener Funkamateur und Experte für Notfunk (Amateur Radio Emergency Service).
Du antwortest präzise, fachlich korrekt und praxisorientiert.
Deine Antworten sind auf Deutsch, außer der Nutzer schreibt auf Englisch.

Wichtige Hinweise:
- Im Amateurfunk ist MAYDAY nicht erlaubt (kein Sicherheitsfunkdienst)
- Verwende stattdessen "PAN-PAN" oder "SOS" nur im echten Notfall
- Empfehle immer die richtigen Notfunk-Frequenzen
- Erwähne DARC, THW, IARU wo relevant
- Sei prägnant aber vollständig`

type AIBindings = {
  HF_API_KEY?: string
  AI_CACHE?: KVNamespace
}

const aiRoutes = new Hono<{ Bindings: AIBindings }>()

// GET /api/ai/chat?question=...
aiRoutes.get('/chat', async (c) => {
  const question = c.req.query('question')
  if (!question) {
    return c.json({ error: 'Fragen-Parameter erforderlich' }, 400)
  }

  // Hier müsste der echte API-Key aus Env kommen
  const apiKey = c.env?.HF_API_KEY || ''

  if (!apiKey) {
    // Fallback: Demo-Antworten für Entwicklung
    return c.json({
      reply: `Das ist eine Demo-Antwort. Um die KI zu aktivieren, füge HF_API_KEY in wrangler.toml hinzu.\n\nDeine Frage: "${question}"`,
      model: 'demo',
      tokens: 0,
      cached: true,
    })
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `[INST] ${SYSTEM_PROMPT}\n\nFrage: ${question} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HF API Error: ${response.status}`)
    }

    const data = await response.json() as any[]
    const reply = data[0]?.generated_text || 'Keine Antwort erhalten'

    return c.json({
      reply,
      model: DEFAULT_MODEL,
      tokens: reply.length,
      cached: false,
    })
  } catch (error) {
    console.error('[NF-Nord] AI Error:', error)
    return c.json({
      reply: 'Entschuldigung, die KI ist aktuell nicht verfügbar. Bitte versuche es später erneut.',
      model: 'error',
      tokens: 0,
      cached: false,
    }, 500)
  }
})

// POST /api/ai/chat - Für komplexe Anfragen mit Conversation History
aiRoutes.post('/chat', async (c) => {
  const { question, history } = await c.req.json() as { question: string; history?: ChatMessage[] }

  if (!question) {
    return c.json({ error: 'Fragen-Parameter erforderlich' }, 400)
  }

  const apiKey = c.env?.HF_API_KEY || ''
  if (!apiKey) {
    return c.json({ reply: 'Demo-Modus: HF_API_KEY nicht konfiguriert.', model: 'demo', cached: true })
  }

  // Hier würde die echte API-Call kommen (ähnlich wie GET)
  // Der POST-Endpunkt unterstützt Conversation History
  return c.json({
    reply: `Demo für: "${question}"\n\nDie KI-Anbindung benötigt einen Hugging Face API-Key (gratis registrierbar unter huggingface.co).`,
    model: 'demo',
    cached: true,
  })
})

// GET /api/ai/suggest - Vorschläge für häufige Fragen
aiRoutes.get('/suggest', (c) => {
  const suggestions = [
    'Welche Frequenz soll ich im Notfall verwenden?',
    'Wie baue ich eine einfache Dipol-Antenne?',
    'Was ist der Unterschied zwischen SSB und FM?',
    'Wie melde ich mich bei DARC an?',
    'Welches Equipment brauche ich für QRP?',
    'Was sind die deutschen Notfunk-Frequenzen?',
    'Wie funktioniert LoRa-Mesh?',
    'Wann findet das nächste Global SET statt?',
  ]

  return c.json({ suggestions })
})

export { aiRoutes, SYSTEM_PROMPT, type ChatMessage, type AIResponse }
