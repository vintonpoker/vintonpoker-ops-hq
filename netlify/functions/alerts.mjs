import { requireKey } from "./_lib/auth.mjs";

export default async (req) => {
  const auth = requireKey(req);
  if (!auth.ok) return auth.res;

  return new Response(
    JSON.stringify(
      {
        ok: true,
        generatedAt: new Date().toISOString(),
        alerts: [
          { id: "stub-1", severity: "info", title: "Alerts endpoint is stubbed", detail: "Wire provider checks next." },
        ],
      },
      null,
      2
    ),
    { headers: { "content-type": "application/json" } }
  );
};
