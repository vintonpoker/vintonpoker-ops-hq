import { requireSession, jsonRes } from "./_lib/session.mjs";
import { buildSnapshot } from "./_lib/buildSnapshot.mjs";
import { isoDayStamp, putSnapshot } from "./_lib/snapshotsStore.mjs";

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const snapshot = await buildSnapshot();
  const stamp = isoDayStamp(new Date());
  const key = `snapshots/${stamp}.json`;

  await putSnapshot({ key, snapshot });

  return jsonRes({ ok: true, key, snapshot });
};
