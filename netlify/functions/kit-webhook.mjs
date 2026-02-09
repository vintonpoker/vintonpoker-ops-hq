import { jsonRes } from "./_lib/session.mjs";
import { appendEvent } from "./_lib/eventsStore.mjs";

export default async (req) => {
  // Kit will POST JSON.
  if (req.method !== "POST") return jsonRes({ ok: false, error: "method not allowed" }, 405);

  const secret = process.env.VP_HQ_WEBHOOK_SECRET;
  if (!secret) return jsonRes({ ok: false, error: "VP_HQ_WEBHOOK_SECRET not set" }, 500);

  const got = req.headers.get("x-vphq-webhook-secret") || "";
  if (got !== secret) return jsonRes({ ok: false, error: "unauthorized" }, 401);

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonRes({ ok: false, error: "invalid json" }, 400);
  }

  // We normalize a few possible payload shapes.
  const ts = Date.now();

  const type = body?.event || body?.type || body?.name || "unknown";
  const subscriber = body?.subscriber || body?.data?.subscriber || null;
  const tag = body?.tag || body?.data?.tag || null;
  const form = body?.form || body?.data?.form || null;

  let event = {
    ts,
    raw_type: type,
    type: "unknown",
    subscriber_id: subscriber?.id ?? null,
    email: subscriber?.email_address ?? subscriber?.email ?? null,
    tag_id: tag?.id ?? body?.tag_id ?? null,
    tag_name: tag?.name ?? body?.tag_name ?? null,
    form_id: form?.id ?? body?.form_id ?? null,
    form_name: form?.name ?? body?.form_name ?? null,
  };

  // Map common events
  const t = String(type).toLowerCase();
  if (t.includes("tag") && t.includes("add")) event.type = "tag_added";
  if (t.includes("form") && (t.includes("subscribe") || t.includes("subscribed"))) event.type = "form_subscribed";

  await appendEvent(event);
  return jsonRes({ ok: true });
};
