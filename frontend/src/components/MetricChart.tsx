import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MetricEntry } from "../api/client";

interface Props {
  entries: MetricEntry[];
  category: string;
}

export default function MetricChart({ entries, category }: Props) {
  const data = entries
    .slice()
    .sort((a, b) => a.recorded_date.localeCompare(b.recorded_date))
    .map((e) => ({ date: e.recorded_date, value: e.value }));

  if (data.length === 0) {
    return <p>No data for this category yet.</p>;
  }

  return (
    <div role="img" aria-label={`Line chart of ${category} over time`}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" name={category} stroke="#1d4ed8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
