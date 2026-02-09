# VP Ops HQ — Security (Free Route)

## Goal
Keep VP Ops HQ private **without paid Netlify features** and without exposing API keys in the browser.

## Approach (v1): HQ Lock
- A Netlify Function `/.netlify/functions/login` verifies a password (`VP_HQ_PASSWORD`).
- On success, it sets an **HttpOnly** session cookie (`vphq_session`) signed with `VP_HQ_SESSION_SECRET`.
- All data endpoints require a valid session cookie.

### Environment variables
Set these in Netlify:
- `VP_HQ_PASSWORD` — login password
- `VP_HQ_SESSION_SECRET` — long random secret (used to sign cookies)

## Notes
- This is intended for a small number of trusted users (you).
- Later we can upgrade to Netlify Identity/JWT if you want multi-user access.
