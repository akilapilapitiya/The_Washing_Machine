import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeePerformanceReportPage from "../EmployeePerformanceReportPage";
import * as reportService from "@/services/report.service";

// Factory Mock - Standardized
vi.mock("@/services/report.service", () => ({
  getDailyIncomeReport: vi.fn(),
  getEmployeePerformanceReport: vi.fn(),
}));

window.URL.createObjectURL = vi.fn();
window.URL.revokeObjectURL = vi.fn();

describe("EmployeePerformanceReportPage", () => {
  const mockReportData = [
    {
      empid: 1,
      empname: "John Doe",
      emptype: "employee",
      completed_jobs: 10,
      total_revenue: 50000,
    },
    {
      empid: 2,
      empname: "Jane Smith",
      emptype: "senior",
      completed_jobs: 8,
      total_revenue: 45000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    reportService.getEmployeePerformanceReport.mockReturnValue(
      new Promise(() => {}),
    );
    render(<EmployeePerformanceReportPage />);
    expect(screen.getByText("Employee Performance")).toBeInTheDocument();
  });

  it("renders report data correctly", async () => {
    reportService.getEmployeePerformanceReport.mockResolvedValue(
      mockReportData,
    );

    render(<EmployeePerformanceReportPage />);

    await waitFor(() => {
      const elements = screen.getAllByText("John Doe");
      expect(elements.length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText(/50,000/)[0]).toBeInTheDocument();
  });
});
