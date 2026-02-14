export function Metric({ label, value, sub }: { label: string; value: any; sub?: any }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 13, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
      {sub !== undefined && <div style={{ marginTop: 4, fontSize: 12, color: "#888" }}>{sub}</div>}
    </div>
  );
}
