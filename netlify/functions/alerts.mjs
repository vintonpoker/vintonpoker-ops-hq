import { requireSession, jsonRes } from "./_lib/session.mjs";

export default async (req) => {
  const auth = requireSession(req);
  if (!auth.ok) return auth.res;

  return jsonRes({
    ok: true,
    generatedAt: new Date().toISOString(),
    alerts: [
      {
        id: "stub-1",
        severity: "info",
        title: "Alerts endpoint is stubbed",
        detail: "Wire provider checks next.",
      },
    ],
  });
};
