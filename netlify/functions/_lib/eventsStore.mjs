import { getStore } from "@netlify/blobs";

const STORE = "vphq";
const KEY = "kit-events.jsonl";

export async function appendEvent(event) {
  const store = getStore(STORE);
  const prev = (await store.get(KEY, { type: "text" })) || "";
  const line = JSON.stringify(event);
  // naive append; ok for low volume. later switch to chunking.
  const next = prev + line + "\n";
  await store.set(KEY, next, { contentType: "text/plain" });
}

export async function readEventsText() {
  const store = getStore(STORE);
  return (await store.get(KEY, { type: "text" })) || "";
}

export function summarizeEvents(lines, nowMs = Date.now()) {
  const windows = {
    last24h: nowMs - 24 * 60 * 60 * 1000,
    last7d: nowMs - 7 * 24 * 60 * 60 * 1000,
  };

  const out = {
    totals: { events: 0 },
    last24h: { events: 0, tagAdded: {}, formSubscribed: {} },
    last7d: { events: 0, tagAdded: {}, formSubscribed: {} },
  };

  for (const line of lines) {
    if (!line) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    out.totals.events += 1;

    const ts = typeof e.ts === "number" ? e.ts : Date.parse(e.ts || "");
    if (!Number.isFinite(ts)) continue;

    const buckets = [];
    if (ts >= windows.last24h) buckets.push("last24h");
    if (ts >= windows.last7d) buckets.push("last7d");
    for (const b of buckets) {
      out[b].events += 1;
      if (e.type === "tag_added") {
        const name = e.tag_name || String(e.tag_id || "unknown");
        out[b].tagAdded[name] = (out[b].tagAdded[name] || 0) + 1;
      }
      if (e.type === "form_subscribed") {
        const name = e.form_name || String(e.form_id || "unknown");
        out[b].formSubscribed[name] = (out[b].formSubscribed[name] || 0) + 1;
      }
    }
  }

  return out;
}
