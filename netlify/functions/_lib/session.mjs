import crypto from "node:crypto";

const COOKIE_NAME = "vphq_session";

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlToBuf(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Buffer.from(str, "base64");
}

function sign(payloadJson, secret) {
  const payload = b64url(Buffer.from(payloadJson));
  const sig = crypto.createHmac("sha256", secret).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

function verify(token, secret) {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  const got = b64urlToBuf(sig);
  if (got.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(got, expected)) return null;
  const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json);
}

function parseCookies(req) {
  const header = req.headers.get("cookie") || "";
  const out = {};
  header.split(";").forEach((part) => {
    const [k, ...rest] = part.trim().split("=");
    if (!k) return;
    out[k] = decodeURIComponent(rest.join("="));
  });
  return out;
}

export function requireSession(req) {
  const secret = process.env.VP_HQ_SESSION_SECRET;
  if (!secret) {
    return { ok: false, res: jsonRes({ ok: false, error: "VP_HQ_SESSION_SECRET not set" }, 500) };
  }
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  const payload = verify(token, secret);
  if (!payload) {
    return { ok: false, res: jsonRes({ ok: false, error: "unauthorized" }, 401) };
  }
  // Optional expiry
  if (payload?.exp && Date.now() > payload.exp) {
    return { ok: false, res: jsonRes({ ok: false, error: "session expired" }, 401) };
  }
  return { ok: true, payload };
}

export function makeSessionCookie({ days = 30 } = {}) {
  const secret = process.env.VP_HQ_SESSION_SECRET;
  if (!secret) throw new Error("VP_HQ_SESSION_SECRET not set");
  const exp = Date.now() + days * 24 * 60 * 60 * 1000;
  const token = sign(JSON.stringify({ exp }), secret);
  // HttpOnly prevents JS access; SameSite=Lax is fine for same-site
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${days * 24 * 60 * 60}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function jsonRes(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}
