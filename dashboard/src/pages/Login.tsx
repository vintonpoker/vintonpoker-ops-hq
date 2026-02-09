import { useState } from "react";

export default function Login({ onAuthed }: { onAuthed: () => void }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/.netlify/functions/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Login failed (${res.status})`);
      }
      onAuthed();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>VP Ops HQ</h1>
      <p style={{ color: "#666" }}>Login</p>
      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, fontSize: 16 }}
          autoFocus
        />
        <button disabled={busy} style={{ marginTop: 12, padding: "10px 14px", fontSize: 16 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        {err && <div style={{ marginTop: 12, color: "crimson" }}>{err}</div>}
      </form>
    </div>
  );
}
