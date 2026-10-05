import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type Role = "viewer" | "admin";

export type MetricCategory = "uptime" | "response_time" | "error_rate" | "throughput";

export interface MetricEntry {
  id: number;
  category: MetricCategory;
  value: number;
  recorded_date: string;
  note: string | null;
  created_at: string;
}

export interface NewMetricEntry {
  category: MetricCategory;
  value: number;
  recorded_date: string;
  note?: string;
}

export interface MetricSummary {
  category: MetricCategory;
  average: number;
  minimum: number;
  maximum: number;
  count: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  full_name: string;
  role: Role;
}

export async function login(email: string, password: string): Promise<string> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const { data } = await apiClient.post("/auth/login", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data.access_token;
}

export async function register(email: string, password: string, fullName: string) {
  await apiClient.post("/auth/register", { email, password, full_name: fullName });
}

export async function fetchMe(): Promise<CurrentUser> {
  const { data } = await apiClient.get<CurrentUser>("/auth/me");
  return data;
}

export async function fetchMetrics(category?: MetricCategory): Promise<MetricEntry[]> {
  const { data } = await apiClient.get<MetricEntry[]>("/metrics/", {
    params: category ? { category } : {},
  });
  return data;
}

export async function fetchSummary(): Promise<MetricSummary[]> {
  const { data } = await apiClient.get<MetricSummary[]>("/metrics/summary");
  return data;
}

export async function createMetric(payload: NewMetricEntry): Promise<MetricEntry> {
  const { data } = await apiClient.post<MetricEntry>("/metrics/", payload);
  return data;
}

export async function deleteMetric(id: number): Promise<void> {
  await apiClient.delete(`/metrics/${id}`);
}
