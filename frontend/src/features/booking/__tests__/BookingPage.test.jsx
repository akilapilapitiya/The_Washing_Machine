import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import BookingPage from "../BookingPage";
import * as vehicleService from "@/services/vehicle.service";

// Mock the vehicle service
vi.mock("@/services/vehicle.service", () => ({
  getVehicles: vi.fn(),
}));

describe("BookingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    vehicleService.getVehicles.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading vehicles/i)).toBeInTheDocument();
  });

  it("renders empty state when no vehicles found", async () => {
    vehicleService.getVehicles.mockResolvedValue([]);

    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Use getAllByText if multiple elements might match, or getByText with exact: false
      // "No Vehicles Found" seems unique enough.
      expect(screen.getByText(/no vehicles found/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/add vehicle/i)).toBeInTheDocument();
  });

  it("renders vehicles when data is available", async () => {
    const mockVehicles = [
      { id: 1, vehbrand: "Toyota", vehmodel: "Prius", vehplate: "ABC-1234" },
      { id: 2, vehbrand: "Honda", vehmodel: "Civic", vehplate: "XYZ-5678" },
    ];
    vehicleService.getVehicles.mockResolvedValue(mockVehicles);

    render(
      <MemoryRouter>
        <BookingPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      // Use getAllByText because the UI might render brand/model in multiple places (card title, subtitle)
      expect(screen.getAllByText(/Toyota/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Honda/i).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(/Prius/i).length).toBeGreaterThan(0);
  });
});
