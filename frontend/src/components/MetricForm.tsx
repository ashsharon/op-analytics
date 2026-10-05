import { useState, FormEvent } from "react";
import type { MetricCategory, NewMetricEntry } from "../api/client";

interface Props {
  onSubmit: (payload: NewMetricEntry) => Promise<void>;
}

const CATEGORY_OPTIONS: { value: MetricCategory; label: string }[] = [
  { value: "uptime", label: "Uptime (%)" },
  { value: "response_time", label: "Response time (ms)" },
  { value: "error_rate", label: "Error rate (%)" },
  { value: "throughput", label: "Throughput (req/s)" },
];

export default function MetricForm({ onSubmit }: Props) {
  const [category, setCategory] = useState<MetricCategory>("uptime");
  const [value, setValue] = useState("");
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const numericValue = Number(value);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      setError("Value must be a non-negative number.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ category, value: numericValue, recorded_date: recordedDate, note: note || undefined });
      setValue("");
      setNote("");
    } catch {
      setError("Could not save this entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Add metric entry form" noValidate>
      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label htmlFor="category">Category</label>
          <br />
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as MetricCategory)}
            style={{ padding: 8 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="value">Value</label>
          <br />
          <input
            id="value"
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-required="true"
            style={{ padding: 8, width: 120 }}
          />
        </div>
        <div>
          <label htmlFor="recordedDate">Date</label>
          <br />
          <input
            id="recordedDate"
            type="date"
            value={recordedDate}
            onChange={(e) => setRecordedDate(e.target.value)}
            style={{ padding: 8 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label htmlFor="note">Note (optional)</label>
          <br />
          <input
            id="note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ padding: 8, width: "100%" }}
          />
        </div>
        <button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Add entry"}
        </button>
      </div>
    </form>
  );
}
