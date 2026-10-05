import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MetricForm from "./MetricForm";

describe("MetricForm", () => {
  it("rejects a negative value", async () => {
    const onSubmit = vi.fn();
    render(<MetricForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/value/i), { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: /add entry/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/non-negative/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid entry", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<MetricForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/value/i), { target: { value: "99.9" } });
    fireEvent.click(screen.getByRole("button", { name: /add entry/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ category: "uptime", value: 99.9 });
  });
});
