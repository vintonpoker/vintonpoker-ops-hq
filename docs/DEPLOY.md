# Deploy + Protect VP Ops HQ (Netlify)

This repo deploys to Netlify as a static dashboard (`dashboard/`) plus Netlify Functions (`netlify/functions/`).

## Deploy
- Netlify build settings are already configured via `netlify.toml`:
  - **Base directory:** `dashboard`
  - **Build command:** `npm run build`
  - **Publish directory:** `dist`
  - **Functions directory:** `netlify/functions`

## Password protect the entire HQ (recommended)
Netlify password protection is configured in the Netlify **UI** (not via `netlify.toml`).

1) Open the Netlify site for **vphq.netlify.app**
2) Go to: **Site settings → Access control → Password protection**
3) Enable password protection and set the username/password

### Notes
- This is the fastest way to keep the Ops HQ private while we iterate daily.
- Later we can upgrade to Netlify Identity/JWT if needed.

## Environment variables
Set these in: **Site settings → Build & deploy → Environment**

- `VP_HQ_API_KEY` (optional for later; not required in v1 once site is password-protected)

