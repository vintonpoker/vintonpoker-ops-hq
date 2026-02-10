import { requireSession, jsonRes } from "./_lib/session.mjs";
import { buildSnapshot } from "./_lib/buildSnapshot.mjs";

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  const snap = await buildSnapshot();

  return jsonRes({
    ok: true,
    generatedAt: snap.generatedAt,
    scoreboard: {
      ...snap.scoreboard,
      conversions: { last7d: 0 },
      youtube: { viewsLast7d: 0 },
      affiliates: { clicksLast7d: 0, conversionsLast7d: 0, commissionLast7d: 0 },
    },
    sources: {
      stripe: snap.sources.stripe,
      kit: snap.sources.kit,
      youtube: { status: "stub" },
      netlify: { status: "stub" },
      refersion: { status: "stub" },
      ga: { status: "stub" },
      gsc: { status: "stub" },
    },
  });
};
