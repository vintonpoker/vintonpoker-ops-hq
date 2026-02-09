import { jsonRes, makeSessionCookie } from "./_lib/session.mjs";

export default async (req) => {
  if (req.method !== "POST") {
    return jsonRes({ ok: false, error: "method not allowed" }, 405);
  }

  const expected = process.env.VP_HQ_PASSWORD;
  if (!expected) return jsonRes({ ok: false, error: "VP_HQ_PASSWORD not set" }, 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "invalid json" }, 400);
  }

  const pw = String(body?.password || "");
  if (!pw || pw !== expected) {
    return jsonRes({ ok: false, error: "invalid password" }, 401);
  }

  const setCookie = makeSessionCookie({ days: 30 });
  return jsonRes({ ok: true }, 200, { "set-cookie": setCookie });
};
