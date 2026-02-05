# CLAUDE.md

## Project Overview

Stock Earnings Tracker — a React + TypeScript web app for tracking daily earnings reports from publicly traded companies. Uses Vercel serverless functions as API proxies to Financial Modeling Prep (FMP) and Google Gemini APIs.

## Commands

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # TypeScript check + Vite production build
npm run lint          # ESLint with zero warnings tolerance
npm test              # Vitest in watch mode
npm test -- --run     # Vitest single run (CI mode)
npm run test:coverage # Coverage report (V8)
```

## Architecture

- **Frontend**: React 19, TypeScript 5.7, Vite 7.2, Recharts for charts, date-fns for dates
- **Backend**: Vercel serverless functions in `/api/` — proxy all external API calls to keep keys server-side
- **Testing**: Vitest + Testing Library + jsdom (84 tests)
- **Deployment**: Vercel with GitHub Actions CI (lint, test, build, Lighthouse)

### Directory Layout

```
api/                  Vercel serverless functions (earnings-calendar, stock-quote, batch-quotes, analyze-earnings, etc.)
api/services/         Backend services (Gemini AI, search)
src/components/       React components (StockCard, StockModal, StockChart, DateSelector, SearchBar, Controls, etc.)
src/services/         API client (retry logic), earnings service, stock service, mock data
src/types/            TypeScript interfaces (Stock, EarningsReport, StockPrice, MarketStatus, etc.)
src/config/           API config, S&P 500 list
src/contexts/         SettingsContext (timezone, persisted to localStorage)
```

### Key Patterns

- All external API calls go through `/api/` serverless functions — never call FMP/Gemini directly from frontend
- `apiClient.ts` has automatic retry (3 retries, exponential backoff)
- Earnings data is fetched in chunks of 5 symbols via `earningsService.ts`
- Auto-refresh intervals adjust by market status: 30s (earnings time), 1min (market hours), 5min (off hours)
- API responses use cache headers (1-5 min) to optimize FMP rate limits (~250 calls/day free tier)

## Code Style

- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`)
- ESLint 9 flat config with `@typescript-eslint` and React hooks plugins
- `@typescript-eslint/no-explicit-any` is disabled
- React functional components with hooks only (no class components)
- CSS in `App.css` and `index.css` (no CSS modules or CSS-in-JS)

## Environment Variables

See `.env.local.example`:
- `FMP_API_KEY` — Financial Modeling Prep API key (required for production, server-side only)
- `FINNHUB_API_KEY` — Finnhub API key
- `VITE_USE_MOCK_DATA=true` — enables mock data for development without API keys
