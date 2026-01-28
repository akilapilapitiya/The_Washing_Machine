import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EmployeeSelectionPage from "../EmployeeSelectionPage";
import * as employeeService from "@/services/employee.service";

// Mock Employee Service
vi.mock("@/services/employee.service");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("EmployeeSelectionPage", () => {
  const mockEmployees = [
    { empid: 1, empname: "John Doe", emptype: "senior" }, // Owner should be filtered out by component logic if tested
    { empid: 2, empname: "Jane Smith", emptype: "junior" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    employeeService.getEmployees.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking/employee",
            state: { vehicleId: 1, serviceIds: [101], locationId: "home" },
          },
        ]}
      >
        <EmployeeSelectionPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/syncing operatives/i)).toBeInTheDocument();
  });

  it("renders employee list and allows selection", async () => {
    employeeService.getEmployees.mockResolvedValue(mockEmployees);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking/employee",
            state: { vehicleId: 1, serviceIds: [101], locationId: "home" },
          },
        ]}
      >
        <EmployeeSelectionPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    // "Any Employee" is selected by default
    expect(screen.getByText("Any Employee")).toBeInTheDocument();

    // Select John Doe
    fireEvent.click(screen.getByText("John Doe"));

    // Click Continue
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    fireEvent.click(continueBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/booking/datetime", {
      state: {
        vehicleId: 1,
        serviceIds: [101],
        locationId: "home",
        employeeId: 1,
      },
    });
  });

  it("filters out owners", async () => {
    const mixedEmployees = [
      { empid: 1, empname: "Owner Guy", emptype: "owner" },
      { empid: 2, empname: "Regular Guy", emptype: "mid" },
    ];
    employeeService.getEmployees.mockResolvedValue(mixedEmployees);

    render(
      <MemoryRouter>
        <EmployeeSelectionPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Regular Guy")).toBeInTheDocument();
    });

    expect(screen.queryByText("Owner Guy")).not.toBeInTheDocument();
  });
});
