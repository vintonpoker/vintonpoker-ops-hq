import { getStore } from "@netlify/blobs";

const STORE = "vphq";

export async function putSnapshot({ key, snapshot }) {
  const store = getStore(STORE);
  await store.set(key, JSON.stringify(snapshot, null, 2), {
    contentType: "application/json",
  });
}

export async function listSnapshotKeys({ prefix = "snapshots/", limit = 30 } = {}) {
  const store = getStore(STORE);
  const res = await store.list({ prefix, limit });
  return (res?.blobs || []).map((b) => b.key);
}

export async function getSnapshot(key) {
  const store = getStore(STORE);
  const text = await store.get(key, { type: "text" });
  if (!text) return null;
  return JSON.parse(text);
}

export function isoDayStamp(date = new Date()) {
  // YYYY-MM-DD in UTC
  return date.toISOString().slice(0, 10);
}
