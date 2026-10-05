import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SummaryCards from "./SummaryCards";
import type { MetricSummary } from "../api/client";

describe("SummaryCards", () => {
  it("shows a message when there are no summaries", () => {
    render(<SummaryCards summaries={[]} />);
    expect(screen.getByText(/no metrics recorded yet/i)).toBeInTheDocument();
  });

  it("renders a card per category with average, min, max and count", () => {
    const summaries: MetricSummary[] = [
      { category: "uptime", average: 98.5, minimum: 97, maximum: 100, count: 4 },
    ];
    render(<SummaryCards summaries={summaries} />);

    expect(screen.getByLabelText(/uptime \(%\) summary/i)).toBeInTheDocument();
    expect(screen.getByText("98.5")).toBeInTheDocument();
    expect(screen.getByText(/min 97 · max 100 · 4 entries/i)).toBeInTheDocument();
  });
});
