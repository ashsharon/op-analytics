import type { MetricSummary } from "../api/client";

const CATEGORY_LABELS: Record<string, string> = {
  uptime: "Uptime (%)",
  response_time: "Response time (ms)",
  error_rate: "Error rate (%)",
  throughput: "Throughput (req/s)",
};

export default function SummaryCards({ summaries }: { summaries: MetricSummary[] }) {
  if (summaries.length === 0) {
    return <p>No metrics recorded yet.</p>;
  }

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}
    >
      {summaries.map((s) => (
        <div
          key={s.category}
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}
          aria-label={`${CATEGORY_LABELS[s.category] ?? s.category} summary`}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: "0.95rem", color: "#4b5563" }}>
            {CATEGORY_LABELS[s.category] ?? s.category}
          </h3>
          <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 700 }}>{s.average}</p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
            min {s.minimum} · max {s.maximum} · {s.count} entries
          </p>
        </div>
      ))}
    </div>
  );
}
