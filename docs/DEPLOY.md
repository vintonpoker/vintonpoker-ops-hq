# Deploy VP Ops HQ (Netlify)

This repo deploys to Netlify as a static dashboard (`dashboard/`) plus Netlify Functions (`netlify/functions/`).

## Build settings
Configured via `netlify.toml`:
- **Base directory:** `dashboard`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

## Free access control (HQ Lock)
This project uses a free login mechanism:
- Visit the site → it will show a login screen
- Password is configured in Netlify env vars

### Required env vars
Set in: **Site settings → Build & deploy → Environment**
- `VP_HQ_PASSWORD`
- `VP_HQ_SESSION_SECRET`

Generate a secret (example):
- macOS/Linux: `openssl rand -hex 32`

