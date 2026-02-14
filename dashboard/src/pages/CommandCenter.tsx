import { useEffect, useState } from "react";
import Login from "./Login";
import Card from "../components/Card";
import { Metric } from "../components/Metric";
import { money, delta as fmtDelta, num } from "../lib/format";

type Summary = any;
type AlertsResp = any;
type SnapshotSummaryResp = any;

function Grid({ children }: { children: any }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        marginTop: 12,
      }}
    >
      {children}
    </div>
  );
}

export default function CommandCenter() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [alerts, setAlerts] = useState<AlertsResp | null>(null);
  const [snapSummary, setSnapSummary] = useState<SnapshotSummaryResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  async function load() {
    setErr(null);
    setNeedsLogin(false);
    try {
      const [sRes, aRes, ssRes] = await Promise.all([
        fetch("/.netlify/functions/summary"),
        fetch("/.netlify/functions/alerts"),
        fetch("/.netlify/functions/snapshot-summary"),
      ]);

      if (sRes.status === 401 || aRes.status === 401 || ssRes.status === 401) {
        setNeedsLogin(true);
        return;
      }

      if (!sRes.ok) throw new Error(`Summary failed: ${sRes.status}`);
      if (!aRes.ok) throw new Error(`Alerts failed: ${aRes.status}`);
      if (!ssRes.ok) throw new Error(`Snapshot summary failed: ${ssRes.status}`);

      setSummary(await sRes.json());
      setAlerts(await aRes.json());
      setSnapSummary(await ssRes.json());
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (needsLogin) return <Login onAuthed={load} />;

  const sb = summary?.scoreboard || {};
  const src = summary?.sources || {};
  const d = snapSummary?.deltas || {};

  const kitKey = src?.kit?.keyTagCounts || {};

  return (
    <div style={{ padding: 24, fontFamily: "system-ui", background: "#f6f7f9", minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0 }}>VP Ops HQ</h1>
          <div style={{ color: "#666", marginTop: 4 }}>Command Center</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={async () => {
              await fetch("/.netlify/functions/snapshot", { method: "POST" });
              await load();
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
          >
            Take Snapshot
          </button>
          <button
            onClick={async () => {
              await fetch("/.netlify/functions/logout");
              await load();
            }}
            style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
          >
            Log out
          </button>
        </div>
      </div>

      {err && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff", border: "1px solid #ffd1d1" }}>
          <div style={{ color: "crimson", fontWeight: 700 }}>Error</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{err}</pre>
        </div>
      )}

      <Grid>
        <Card title="Revenue">
          <Metric label="Yesterday" value={money(sb?.revenue?.yesterday)} sub={`Δ vs prev: ${fmtDelta(d?.revenueYesterdayDelta)}`} />
          <Metric label="Last 7d" value={money(sb?.revenue?.last7d)} />
          <Metric label="MTD" value={money(sb?.revenue?.mtd)} />
        </Card>

        <Card title="Refunds">
          <Metric label="Yesterday" value={money(sb?.refunds?.yesterday)} sub={`Δ vs prev: ${fmtDelta(d?.refundsYesterdayDelta)}`} />
          <Metric label="Last 7d" value={money(sb?.refunds?.last7d)} />
          <Metric label="MTD" value={money(sb?.refunds?.mtd)} />
        </Card>

        <Card title="Funnel buckets (Kit)">
          <Metric
            label="Masterclass Prospect"
            value={num(kitKey?.["Masterclass Prospect"]?.subscriber_count)}
            sub={`Δ: ${fmtDelta(d?.masterclassProspectDelta)}`}
          />
          <Metric
            label="Masterclass Customer"
            value={num(kitKey?.["Masterclass Customer"]?.subscriber_count)}
            sub={`Δ: ${fmtDelta(d?.masterclassCustomerDelta)}`}
          />
          <Metric
            label="In: AI Operator Bootcamp"
            value={num(kitKey?.["In: AI Operator Bootcamp"]?.subscriber_count)}
            sub={`Δ: ${fmtDelta(d?.bootcampInDelta)}`}
          />
          <Metric
            label="Completed: Affiliate Activation"
            value={num(kitKey?.["Completed: Affiliate Activation"]?.subscriber_count)}
            sub={`Δ: ${fmtDelta(d?.affiliateCompletedDelta)}`}
          />
        </Card>

        <Card title="Source health">
          <Metric label="Stripe" value={String(src?.stripe?.status || "—")} />
          <Metric label="Kit" value={String(src?.kit?.status || "—")} sub={src?.kit?.status === "ok" ? `${src?.kit?.forms} forms / ${src?.kit?.tags} tags` : src?.kit?.error} />
        </Card>
      </Grid>

      <div style={{ marginTop: 12 }}>
        <Card title="Alerts">
          {Array.isArray(alerts?.alerts) && alerts.alerts.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {alerts.alerts.map((a: any) => (
                <li key={a.id} style={{ marginBottom: 8 }}>
                  <strong>{a.severity?.toUpperCase?.() || "ALERT"}:</strong> {a.title}
                  {a.detail ? <div style={{ color: "#666" }}>{a.detail}</div> : null}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: "#666" }}>No alerts.</div>
          )}
        </Card>
      </div>
    </div>
  );
}
