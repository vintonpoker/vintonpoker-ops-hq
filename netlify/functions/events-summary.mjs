import { requireSession, jsonRes } from "./_lib/session.mjs";
import { readEventsText, summarizeEvents } from "./_lib/eventsStore.mjs";

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const text = await readEventsText();
  const lines = text.split("\n");
  const summary = summarizeEvents(lines);
  return jsonRes({ ok: true, generatedAt: new Date().toISOString(), summary });
};
