import { requireSession, jsonRes } from "./_lib/session.mjs";
import { listSnapshotKeys } from "./_lib/snapshotsStore.mjs";

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const alerts = [];

  // Snapshot freshness
  try {
    const keys = await listSnapshotKeys({ limit: 2 });
    if (!keys || keys.length === 0) {
      alerts.push({
        id: "no-snapshots",
        severity: "warning",
        title: "No snapshots yet",
        detail: "Snapshot system is enabled but no snapshots are stored yet. The daily job will populate this at 6am Mazatlan.",
      });
    }
  } catch (e) {
    alerts.push({
      id: "snapshots-error",
      severity: "error",
      title: "Snapshot storage error",
      detail: e?.message || String(e),
    });
  }

  return jsonRes({ ok: true, generatedAt: new Date().toISOString(), alerts });
};
