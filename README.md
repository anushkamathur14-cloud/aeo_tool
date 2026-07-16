# BrandSignal

BrandSignal is an investor-demo-ready AI Visibility Intelligence platform. It shows brands where they appear in AI answers, why competitors win, and which actions are most likely to improve visibility.

## Features

- Executive visibility dashboard with realistic Peacock (OTT) demo data
- Prompt Explorer with multi-engine answers, citations, mentions, sentiment, and explanations
- Competitor, entity graph, historical tracking, opportunities, optimizer, and reports
- Extensible provider adapters for ChatGPT, Claude, Gemini, Grok, and Perplexity
- Demo-safe Scanner: mock by default; live/hybrid when session-only user keys are supplied
- Transparent, unit-tested BrandSignal Visibility Score (0–100)

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The application and seeded UI work without a database. For persisted scans:

```bash
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
```

Then open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Vercel deployment

1. Push this directory to `https://github.com/anushkamathur14-cloud/aeo_tool`.
2. Import that repository in Vercel; framework detection should select Next.js.
3. The demo UI deploys with no environment variables.
4. To persist scan history, attach Vercel Postgres/Neon/Supabase and set `DATABASE_URL`.
5. Run `npx prisma migrate deploy` against the production database.

API keys entered in Settings are kept in the browser session and sent only over HTTPS when a live scan is run. They are not persisted by the demo. For a real multi-user release, add authentication and an encrypted secret store before enabling shared credentials.

## Architecture

- `src/app/(app)` — product routes and layouts
- `src/components` — reusable UI and visualization components
- `src/lib/domain` — pure prompt, scoring, and explanation logic
- `src/lib/providers` — common provider adapter interface
- `src/app/api/v1/scan` — Zod-validated scan endpoint (24-prompt cap)
- `prisma` — production-ready Postgres schema and demo seed

BrandSignal intentionally uses analytics views rather than a chatbot interface.
