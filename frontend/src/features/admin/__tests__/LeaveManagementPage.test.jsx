import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LeaveManagementPage from "../LeaveManagementPage";
import * as schedulerService from "@/services/scheduler.service";
import * as employeeService from "@/services/employee.service";

vi.mock("@/services/scheduler.service", () => ({
  getAllLeaves: vi.fn(),
  recordLeave: vi.fn(),
}));

vi.mock("@/services/employee.service", () => ({
  getEmployees: vi.fn(),
}));

describe("LeaveManagementPage", () => {
  const mockEmployees = [
    { empid: 1, empname: "John Doe", emptype: "employee" },
    { empid: 2, empname: "Jane Smith", emptype: "mechanic" },
  ];

  const mockLeaves = [
    {
      leaveid: 101,
      empid: 1,
      empname: "John Doe",
      leavestartdate: "2025-02-01",
      leaveenddate: "2025-02-05",
      leavereason: "Family Trip",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    schedulerService.getAllLeaves.mockReturnValue(new Promise(() => {}));
    employeeService.getEmployees.mockReturnValue(new Promise(() => {}));
    render(<LeaveManagementPage />);
    expect(screen.queryByText("Staff Attendance")).not.toBeInTheDocument();
  });

  it("renders dashboard with content", async () => {
    schedulerService.getAllLeaves.mockResolvedValue(mockLeaves);
    employeeService.getEmployees.mockResolvedValue(mockEmployees);

    render(<LeaveManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Staff Attendance")).toBeInTheDocument();
    });

    const johns = screen.getAllByText(/John Doe/);
    expect(johns.length).toBeGreaterThan(0);
    expect(screen.getByText('"Family Trip"')).toBeInTheDocument();
  });

  it("handles leave submission", async () => {
    schedulerService.getAllLeaves.mockResolvedValue([]);
    employeeService.getEmployees.mockResolvedValue(mockEmployees);
    schedulerService.recordLeave.mockResolvedValue({ success: true });

    const { container } = render(<LeaveManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("Staff Attendance")).toBeInTheDocument();
    });

    // Select Employee
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });

    // Dates (using container selector)
    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: "2025-03-01" } }); // Start
    fireEvent.change(dateInputs[1], { target: { value: "2025-03-05" } }); // End

    // Reason
    fireEvent.change(screen.getByPlaceholderText(/reason for absence/i), {
      target: { value: "Sick" },
    });

    // Submit
    fireEvent.click(
      screen.getByRole("button", { name: /deploy time-off block/i }),
    );

    await waitFor(() => {
      expect(schedulerService.recordLeave).toHaveBeenCalledWith({
        empid: "1",
        startDate: "2025-03-01",
        endDate: "2025-03-05",
        reason: "Sick",
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(/leave deployment finalized successfully/i),
      ).toBeInTheDocument();
    });
  });
});
