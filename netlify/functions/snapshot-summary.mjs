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

function tagCount(snapshot, tagName) {
  return snapshot?.sources?.kit?.keyTagCounts?.[tagName]?.subscriber_count ?? null;
}

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  try {
    const keys = await listSnapshotKeys({ limit: 10 });
    const sorted = (keys || []).slice().sort().reverse();

    const latestKey = sorted[0] || null;
    const prevKey = sorted[1] || null;

    const latest = latestKey ? await getSnapshot(latestKey) : null;
    const prev = prevKey ? await getSnapshot(prevKey) : null;

    const deltas =
      latest && prev
        ? {
            revenueYesterdayDelta: diff(
              latest?.scoreboard?.revenue?.yesterday,
              prev?.scoreboard?.revenue?.yesterday
            ),
            refundsYesterdayDelta: diff(
              latest?.scoreboard?.refunds?.yesterday,
              prev?.scoreboard?.refunds?.yesterday
            ),

            masterclassProspectDelta: diff(tagCount(latest, "Masterclass Prospect"), tagCount(prev, "Masterclass Prospect")),
            masterclassCustomerDelta: diff(tagCount(latest, "Masterclass Customer"), tagCount(prev, "Masterclass Customer")),
            bootcampInDelta: diff(tagCount(latest, "In: AI Operator Bootcamp"), tagCount(prev, "In: AI Operator Bootcamp")),
            affiliateCompletedDelta: diff(tagCount(latest, "Completed: Affiliate Activation"), tagCount(prev, "Completed: Affiliate Activation")),
          }
        : null;

    return jsonRes({
      ok: true,
      generatedAt: new Date().toISOString(),
      latestKey,
      prevKey,
      deltas,
      // Keep payload small in UI; full snapshots still accessible via blob keys if needed later.
    });
  } catch (e) {
    return jsonRes({ ok: false, error: e?.message || String(e), where: "snapshot-summary" }, 200);
  }
};
