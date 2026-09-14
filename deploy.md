# Deployment Guide

## Cloudflare Workers (API)

```bash
cd notfunk-toolkit
npx wrangler login
npx wrangler deploy
```

Dann die Domain `notfunk-nord.de` im Cloudflare Dashboard zuweisen.

## Cloudflare Pages (Frontend)

Die statische Seite liegt in `public/` im Root des Repos.

Option 1: Über das Cloudflare Dashboard
- Repo verbinden (GitHub)
- Build Command: `true` (nichts bauen, statische Dateien kopieren)
- Output Directory: `public`
- Publish Directory: `public`

Option 2: CLI
```bash
npx wrangler pages deploy public/ --project-name=notfunk-nord
```

## Domain einrichten

1. In Cloudflare Dashboard: `notfunk-nord.de` hinzufügen
2. Nameserver auf Cloudflare umstellen (Hetzner: Nameserver ändern zu Cloudflare-Nameservern)
3. In Cloudflare:
   - DNS A Record für `@` und `www` → Cloudflare IP
   - Workers Route: `*.notfunk-nord.de/*` → Worker "notfunk-toolkit"
   - Pages URL: `notfunk-nord.pages.dev` → Custom Domain `notfunk-nord.de`
