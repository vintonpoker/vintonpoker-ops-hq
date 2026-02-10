import { buildSnapshot } from "./_lib/buildSnapshot.mjs";
import { isoDayStamp, putSnapshot } from "./_lib/snapshotsStore.mjs";

export const config = {
  // 06:00 America/Mazatlan = 13:00 UTC (no DST assumed).
  schedule: "0 13 * * *",
};

export default async () => {
  const snapshot = await buildSnapshot();
  const stamp = isoDayStamp(new Date());
  const key = `snapshots/${stamp}.json`;
  await putSnapshot({ key, snapshot });

  return new Response(JSON.stringify({ ok: true, key }, null, 2), {
    headers: { "content-type": "application/json" },
  });
};
