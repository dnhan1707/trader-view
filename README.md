Trader View — Fast Stock Terminal (Next.js)
==========================================

A minimalist, professional trading terminal UI built with Next.js 14, optimized for speed. It consumes your provided REST endpoints via a local proxy and renders:

- Overview: Ticker details and API health
- Indicators: SMA, EMA, MACD, RSI with small charts and table
- Market: Live status and upcoming holidays
- Stocks: Short interest and short volume
- News: Recent articles for the selected ticker
- Reference: Exchanges, Dividends, IPOs, Condition Codes

<img width="2549" height="1215" alt="traderview" src="https://github.com/user-attachments/assets/465e622e-ebbd-4f47-a633-05559f95482d" />


Requirements
------------
- Node.js 18+
- Your backend running locally (default `http://localhost:8080`) exposing the endpoints in the supplied OpenAPI.

Quick Start (Windows PowerShell)
--------------------------------
```powershell
# 1) Install dependencies
npm install

# 2) (Optional) Point to your API if not default
$env:API_BASE_URL = "http://localhost:8080"

# 3) Run the app
npm run dev
```

Open http://localhost:3000 and use the top search to change symbols (press `/` to focus the input).

Configuration
-------------
- API proxy rewrite: Frontend requests to `/backend/*` are proxied to `API_BASE_URL` (default `http://localhost:8080`). Configure via env var or `.env.local`:

```
API_BASE_URL=http://localhost:8080
```

Design Notes
------------
- Dark “terminal” theme for readability and reduced visual noise
- Lightweight components and minimal dependencies for fast interaction
- Uses `lightweight-charts` for small sparkline-like indicator charts
- Graceful fallbacks: when response shapes differ, tables auto-infer columns

Project Scripts
---------------
- `npm run dev`: Start the dev server
- `npm run build`: Production build
- `npm run start`: Start production server

Folder Structure (high-level)
-----------------------------
- `app/`: App Router pages and global styles
- `components/`: Reusable UI + panels
- `lib/api.ts`: Thin wrapper over the provided endpoints
- `next.config.js`: Rewrites `/backend/*` to your API

Troubleshooting
---------------
- CORS/Network: Using the rewrite avoids browser CORS issues. Ensure backend is reachable on the configured port.
- Empty data: Some endpoints return different shapes. UI will still display available fields in tables.
