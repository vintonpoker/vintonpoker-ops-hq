export default function Card({ title, children }: { title: string; children: any }) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, color: "#666" }}>{title}</div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}
