# VP Ops HQ — Snapshots (No Kit Webhooks)

Kit webhooks are not available on the current plan, so VP Ops HQ uses **daily snapshots** to compute deltas.

## How it works
- A scheduled Netlify Function runs daily at **06:00 America/Mazatlan** (13:00 UTC) and stores a snapshot in Netlify Blobs.
- Snapshots contain Stripe revenue/refunds and Kit key tag counts.
- The dashboard compares the latest snapshot to the previous one to compute "what changed".

## Endpoints
- `POST /.netlify/functions/snapshot`
  - Manual snapshot (requires VP HQ login)
- `GET /.netlify/functions/snapshot-summary`
  - Latest + previous snapshot + computed deltas (requires VP HQ login)

## Storage
- Netlify Blobs store: `vphq`
- Keys: `snapshots/YYYY-MM-DD.json`
