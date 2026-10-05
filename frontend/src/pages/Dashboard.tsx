import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchMe,
  fetchMetrics,
  fetchSummary,
  createMetric,
  deleteMetric,
} from "../api/client";
import type {
  CurrentUser,
  MetricEntry,
  MetricSummary,
  MetricCategory,
  NewMetricEntry,
} from "../api/client";
import MetricChart from "../components/MetricChart";
import SummaryCards from "../components/SummaryCards";
import MetricForm from "../components/MetricForm";

const CATEGORIES: MetricCategory[] = ["uptime", "response_time", "error_rate", "throughput"];

export default function Dashboard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [summaries, setSummaries] = useState<MetricSummary[]>([]);
  const [entries, setEntries] = useState<MetricEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<MetricCategory>("uptime");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadAll = useCallback(async (category: MetricCategory) => {
    setLoading(true);
    try {
      const [me, summary, metricEntries] = await Promise.all([
        fetchMe(),
        fetchSummary(),
        fetchMetrics(category),
      ]);
      setUser(me);
      setSummaries(summary);
      setEntries(metricEntries);
      setLoadError(null);
    } catch {
      setLoadError("Could not load dashboard data. Please log in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }
    loadAll(activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCategoryChange(category: MetricCategory) {
    setActiveCategory(category);
    const data = await fetchMetrics(category);
    setEntries(data);
  }

  async function handleCreate(payload: NewMetricEntry) {
    await createMetric(payload);
    await loadAll(activeCategory);
  }

  async function handleDelete(id: number) {
    await deleteMetric(id);
    await loadAll(activeCategory);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Ops Analytics Dashboard</h1>
        <div>
          {user && (
            <span style={{ marginRight: 12, fontSize: "0.9rem", color: "#4b5563" }}>
              {user.full_name} ({user.role})
            </span>
          )}
          <button onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {loading && <p>Loading…</p>}
      {loadError && <p role="alert">{loadError}</p>}

      {!loading && !loadError && (
        <>
          <section aria-labelledby="summary-heading" style={{ marginTop: 24 }}>
            <h2 id="summary-heading">Overview</h2>
            <SummaryCards summaries={summaries} />
          </section>

          <section aria-labelledby="chart-heading" style={{ marginTop: 32 }}>
            <h2 id="chart-heading">Trend</h2>
            <div role="tablist" aria-label="Metric category" style={{ marginBottom: 12 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={activeCategory === cat}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    marginRight: 8,
                    fontWeight: activeCategory === cat ? 700 : 400,
                    textDecoration: activeCategory === cat ? "underline" : "none",
                  }}
                >
                  {cat.replace("_", " ")}
                </button>
              ))}
            </div>
            <MetricChart entries={entries} category={activeCategory.replace("_", " ")} />
          </section>

          {user?.role === "admin" && (
            <section aria-labelledby="admin-heading" style={{ marginTop: 32 }}>
              <h2 id="admin-heading">Add a metric entry (admin only)</h2>
              <MetricForm onSubmit={handleCreate} />

              <h3 style={{ marginTop: 24 }}>Entries in this category</h3>
              <ul>
                {entries.map((e) => (
                  <li key={e.id} style={{ marginBottom: 4 }}>
                    {e.recorded_date}: {e.value} {e.note ? `— ${e.note}` : ""}{" "}
                    <button aria-label={`Delete entry from ${e.recorded_date}`} onClick={() => handleDelete(e.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  );
}
