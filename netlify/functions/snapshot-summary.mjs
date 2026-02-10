import { requireSession, jsonRes } from "./_lib/session.mjs";
import { listSnapshotKeys, getSnapshot } from "./_lib/snapshotsStore.mjs";

function safeNum(x) {
  return typeof x === "number" && Number.isFinite(x) ? x : null;
}

function diff(a, b) {
  const A = safeNum(a);
  const B = safeNum(b);
  if (A === null || B === null) return null;
  return Math.round((A - B) * 100) / 100;
}

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const keys = await listSnapshotKeys({ limit: 10 });
  const sorted = keys.sort().reverse();

  const latestKey = sorted[0] || null;
  const prevKey = sorted[1] || null;

  const latest = latestKey ? await getSnapshot(latestKey) : null;
  const prev = prevKey ? await getSnapshot(prevKey) : null;

  const deltas = latest && prev ? {
    revenueYesterdayDelta: diff(latest?.scoreboard?.revenue?.yesterday, prev?.scoreboard?.revenue?.yesterday),
    refundsYesterdayDelta: diff(latest?.scoreboard?.refunds?.yesterday, prev?.scoreboard?.refunds?.yesterday),
  } : null;

  return jsonRes({
    ok: true,
    generatedAt: new Date().toISOString(),
    latestKey,
    prevKey,
    latest,
    prev,
    deltas,
  });
};
