import { useEffect, useState } from "react";
import Login from "./Login";

type Summary = any;
type AlertsResp = any;

export default function CommandCenter() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<AlertsResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  async function load() {
    setErr(null);
    setNeedsLogin(false);
    try {
      const [sRes, aRes] = await Promise.all([
        fetch("/.netlify/functions/summary"),
        fetch("/.netlify/functions/alerts"),
      ]);

      if (sRes.status === 401 || aRes.status === 401) {
        setNeedsLogin(true);
        return;
      }

      if (!sRes.ok) throw new Error(`Summary failed: ${sRes.status}`);
      if (!aRes.ok) throw new Error(`Alerts failed: ${aRes.status}`);

      const s = await sRes.json();
      const a = await aRes.json();
      setSummary(s);
      setAlerts(a);
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (needsLogin) return <Login onAuthed={load} />;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>VP Ops HQ</h1>
      <p style={{ color: "#666" }}>Command Center (v1)</p>
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}
      <h2>Scoreboard</h2>
      <pre>{JSON.stringify(summary?.scoreboard ?? null, null, 2)}</pre>
      <h2>Alerts</h2>
      <pre>{JSON.stringify(alerts?.alerts ?? null, null, 2)}</pre>
      <h2>Sources</h2>
      <pre>{JSON.stringify(summary?.sources ?? null, null, 2)}</pre>
      <button
        onClick={async () => {
          await fetch("/.netlify/functions/logout");
          await load();
        }}
        style={{ marginTop: 16, padding: "10px 14px" }}
      >
        Log out
      </button>
    </div>
  );
}
