import { useEffect, useState } from "react";

type Summary = any;

type AlertsResp = any;

export default function CommandCenter() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<AlertsResp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          fetch("/.netlify/functions/summary").then((r) => r.json()),
          fetch("/.netlify/functions/alerts").then((r) => r.json()),
        ]);
        setSummary(s);
        setAlerts(a);
      } catch (e: any) {
        setErr(e?.message || String(e));
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>VP Ops HQ</h1>
      <p style={{ color: "#666" }}>Command Center (v1 stub)</p>
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}
      <h2>Scoreboard</h2>
      <pre>{JSON.stringify(summary?.scoreboard ?? null, null, 2)}</pre>
      <h2>Alerts</h2>
      <pre>{JSON.stringify(alerts?.alerts ?? null, null, 2)}</pre>
      <h2>Sources</h2>
      <pre>{JSON.stringify(summary?.sources ?? null, null, 2)}</pre>
    </div>
  );
}
