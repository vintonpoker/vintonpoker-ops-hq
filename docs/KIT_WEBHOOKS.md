# Kit Webhooks → VP Ops HQ

VP Ops HQ can compute "tag added" / "form subscribed" volumes (last 24h / 7d) by ingesting Kit webhooks.

## Endpoint
- Webhook URL: `https://vphq.netlify.app/.netlify/functions/kit-webhook`

## Security
Set env var in Netlify:
- `VP_HQ_WEBHOOK_SECRET`

In Kit webhook configuration, set a header:
- `x-vphq-webhook-secret: <VP_HQ_WEBHOOK_SECRET>`

(Any request missing/incorrect secret is rejected.)

## Events to enable (recommended)
- Tag added
- Form subscribed

