export default async () => {
  // v1 mock payload; will be replaced by provider fetch + normalization
  const now = new Date().toISOString();
  return new Response(
    JSON.stringify(
      {
        ok: true,
        generatedAt: now,
        scoreboard: {
          revenue: { yesterday: 0, last7d: 0, mtd: 0 },
          leads: { yesterday: 0, last7d: 0 },
          conversions: { last7d: 0 },
          youtube: { viewsLast7d: 0 },
          affiliates: { clicksLast7d: 0, conversionsLast7d: 0, commissionLast7d: 0 },
        },
        sources: {
          stripe: { status: "stub" },
          kit: { status: "stub" },
          youtube: { status: "stub" },
          netlify: { status: "stub" },
          refersion: { status: "stub" },
          ga: { status: "stub" },
          gsc: { status: "stub" },
        },
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
};
