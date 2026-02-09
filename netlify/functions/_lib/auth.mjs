// Reserved for later: function-level API key gating.
// v1 relies on Netlify site password protection.

export function requireKey(req) {
  const expected = process.env.VP_HQ_API_KEY;
  if (!expected) {
    return { ok: false, res: new Response(JSON.stringify({ ok: false, error: "VP_HQ_API_KEY not set" }, null, 2), { status: 500, headers: { "content-type": "application/json" } }) };
  }
  const got = req.headers.get("x-vphq-key");
  if (!got || got !== expected) {
    return { ok: false, res: new Response(JSON.stringify({ ok: false, error: "unauthorized" }, null, 2), { status: 401, headers: { "content-type": "application/json" } }) };
  }
  return { ok: true };
}
