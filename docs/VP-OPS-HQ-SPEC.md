# VP Ops HQ — Spec (v1)

## Goal
Build a nimble, daily-iterated operations HQ for Vinton Poker that provides:
- **Command Center** view of the business (scoreboard + alerts + money moves)
- Modular drill-down pages (Funnel, Email/Kit, Traffic/Content, Affiliate, Reliability)
- A secure data layer via Netlify Functions

## Non-goals (v1)
- No write actions to external systems (read-only metrics + recommended actions only)
- No changes to leakhunter-app repo/branches

## Principles
- **Daily Brief is the product**: every day produce a short, actionable status + deltas
- **Nimble**: build thin slices that ship; avoid “big dashboard rewrite” traps
- **Security first**: secrets in Netlify env; never shipped to browser

## Architecture
- `dashboard/` React + TS + Vite UI
- `netlify/functions/` data endpoints calling provider APIs
- Shared helpers in `netlify/functions/_lib/`

### API security
All endpoints (except `health`) require header:
- `x-vphq-key: $VP_HQ_API_KEY`

If missing/incorrect → `401`.

## Data sources (planned)
- Stripe
- Kit (ConvertKit)
- YouTube
- Netlify
- Refersion
- Google Analytics
- Google Search Console

## v1 pages
1. `/` Command Center
2. `/funnel`
3. `/email-kit`
4. `/traffic-content`
5. `/affiliates`
6. `/reliability`
7. `/runbooks`

## v1 UI components
- `ScoreboardCard`
- `AlertsPanel`
- `MoneyMovesPanel`
- `SourceStatusGrid`

## v1 endpoints (stubs)
- `GET /.netlify/functions/health`
- `GET /.netlify/functions/summary` (mock)
- `GET /.netlify/functions/alerts` (mock)

## Environment variables (planned)
- `VP_HQ_API_KEY`

Provider keys later:
- `STRIPE_SECRET_KEY`
- `KIT_API_KEY`
- `YOUTUBE_API_KEY` (or OAuth)
- `NETLIFY_ACCESS_TOKEN`
- `REFERSION_API_KEY`
- `GA_PROPERTY_ID` (+ creds)
- `GSC_SITE_URL` (+ creds)

## Daily operating cadence (planned)
- Check scoreboard + alerts each morning
- Investigate reds
- Ship one improvement (dashboard, alert logic, runbook)

