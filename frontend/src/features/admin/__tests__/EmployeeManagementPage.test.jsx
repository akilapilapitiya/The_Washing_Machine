import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeManagementPage from "../EmployeeManagementPage";
import * as employeeService from "@/services/employee.service";

// Mock Service properly
vi.mock("@/services/employee.service", () => ({
  getEmployees: vi.fn(),
  getRoles: vi.fn(),
  addEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe("EmployeeManagementPage", () => {
  const mockEmployees = [
    {
      empid: 1,
      empname: "John Doe",
      email: "john@example.com",
      emptel: "0771234567",
      empnic: "123456789V",
      emptype: "employee",
      created_at: "2025-01-01",
    },
    {
      empid: 2,
      empname: "Jane Boss",
      email: "jane@example.com",
      emptel: "0711234567",
      empnic: "987654321V",
      emptype: "owner",
      created_at: "2025-01-01",
    },
  ];

  const mockRoles = [
    { roleid: 1, rolename: "owner" },
    { roleid: 2, rolename: "employee" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    employeeService.getEmployees.mockReturnValue(new Promise(() => {}));
    employeeService.getRoles.mockReturnValue(new Promise(() => {}));

    render(<EmployeeManagementPage />);
    expect(screen.getByText(/loading directory/i)).toBeInTheDocument();
  });

  it("renders employee list", async () => {
    employeeService.getEmployees.mockResolvedValue(mockEmployees);
    employeeService.getRoles.mockResolvedValue({
      success: true,
      data: mockRoles,
    });

    render(<EmployeeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Jane Boss")).toBeInTheDocument();
  });

  it("opens add employee modal", async () => {
    employeeService.getEmployees.mockResolvedValue(mockEmployees);
    employeeService.getRoles.mockResolvedValue({
      success: true,
      data: mockRoles,
    });

    render(<EmployeeManagementPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // "Add Employee" appears in header. If list is empty, also appears in empty state.
    // In this test, list is populated, so only one button in header.
    const addBtn = screen.getByRole("button", { name: /add employee/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/add new employee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it("handles add employee submission", async () => {
    employeeService.getEmployees.mockResolvedValue([]);
    employeeService.getRoles.mockResolvedValue({
      success: true,
      data: mockRoles,
    });
    employeeService.addEmployee.mockResolvedValue({ success: true });

    render(<EmployeeManagementPage />);

    // Wait for "No employees yet"
    await waitFor(() =>
      expect(screen.getByText(/no employees yet/i)).toBeInTheDocument(),
    );

    // Here "Add Employee" appears twice: top header AND empty state.
    // We can click either or select specifically.
    const addButtons = screen.getAllByRole("button", { name: /add employee/i });
    fireEvent.click(addButtons[0]); // Click the first one (header)

    // Form interactions
    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: "New Guy" },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/phone/i), {
      target: { value: "0770000000" },
    });
    fireEvent.change(screen.getByLabelText(/nic/i), {
      target: { value: "123123123V" },
    });
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: "employee" },
    });

    // Submit button inside form -> "Add Employee" text again.
    // The submit button text is "Add Employee".
    // Since modal is open, we should look for the button inside the form/modal.
    // Or simpler: getAllByRole and pick the *last* one (typically the modal action).
    // Or matching exact name.

    // Let's use `within`.
    // But screen.getAllByRole('button', {name: "Add Employee"}) is easy.
    // 0: Header, 1: Empty State, 2: Modal Submit.
    // Let's rely on specific attributes or text if possible.
    // The Submit button has type="submit".

    // We can assume the last one is the one in the modal which just opened.
    const buttons = screen.getAllByRole("button", { name: /add employee/i });
    fireEvent.click(buttons[buttons.length - 1]);

    await waitFor(() => {
      expect(employeeService.addEmployee).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Guy",
          type: "employee",
        }),
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/new employee registered successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("handles delete employee", async () => {
    employeeService.getEmployees.mockResolvedValue(mockEmployees);
    employeeService.getRoles.mockResolvedValue({
      success: true,
      data: mockRoles,
    });
    employeeService.deleteEmployee.mockResolvedValue({ success: true });

    mockConfirm.mockReturnValue(true);

    render(<EmployeeManagementPage />);

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument(),
    );

    const deleteBtns = screen.getAllByTitle("Remove Employee");
    fireEvent.click(deleteBtns[0]);

    expect(mockConfirm).toHaveBeenCalled();
    expect(employeeService.deleteEmployee).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText(/employee removed/i)).toBeInTheDocument();
    });
  });
});
