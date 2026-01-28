import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DailyIncomeReportPage from "../DailyIncomeReportPage";
import * as reportService from "@/services/report.service";

// Factory Mock - Standardized
vi.mock("@/services/report.service", () => ({
  getDailyIncomeReport: vi.fn(),
  getEmployeePerformanceReport: vi.fn(),
}));

// Mock URL
window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();

describe("DailyIncomeReportPage", () => {
  const mockReportData = [
    { date: "2025-01-01", transaction_count: 5, total_income: 15000 },
    { date: "2025-01-02", transaction_count: 3, total_income: 8500 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    reportService.getDailyIncomeReport.mockReturnValue(new Promise(() => {}));
    render(<DailyIncomeReportPage />);
    expect(screen.getByText("Daily Income Report")).toBeInTheDocument();
    // Verify NOT displaying data yet
    expect(screen.queryByText("2025-01-01")).not.toBeInTheDocument();
  });

  it("renders report data correctly", async () => {
    reportService.getDailyIncomeReport.mockResolvedValue(mockReportData);

    render(<DailyIncomeReportPage />);

    // Wait for the service call
    await waitFor(() => {
      expect(reportService.getDailyIncomeReport).toHaveBeenCalled();
    });

    // Wait for data update
    await waitFor(() => {
      // "Rs. 15,000" - use getAllByText because it appears in Tooltip AND Table
      const elements = screen.getAllByText(/15,000/);
      expect(elements.length).toBeGreaterThan(0);
    });

    expect(screen.getByText("2025-01-01")).toBeInTheDocument();
    // Total Revenue 23,500
    expect(screen.getAllByText(/23,500/)[0]).toBeInTheDocument();
  });

  it("renders empty state when no data", async () => {
    reportService.getDailyIncomeReport.mockResolvedValue([]);

    render(<DailyIncomeReportPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/no data for selected period/i),
      ).toBeInTheDocument();
    });
  });

  it("handles download CSV", async () => {
    reportService.getDailyIncomeReport.mockResolvedValue(mockReportData);
    render(<DailyIncomeReportPage />);

    await waitFor(() =>
      expect(screen.getAllByText(/23,500/)[0]).toBeInTheDocument(),
    );

    const downloadBtn = screen.getByText(/download csv report/i);
    fireEvent.click(downloadBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
