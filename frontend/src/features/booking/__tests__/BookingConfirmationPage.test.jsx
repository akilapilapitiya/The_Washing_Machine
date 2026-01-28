import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import BookingConfirmationPage from "../BookingConfirmationPage";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";
import * as bookingService from "@/services/booking.service";

// Explicit mocks
vi.mock("@/services/service.service", () => ({
  getServices: vi.fn(),
}));
vi.mock("@/services/vehicle.service", () => ({
  getVehicle: vi.fn(),
}));
vi.mock("@/services/booking.service", () => ({
  createBooking: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("BookingConfirmationPage", () => {
  const mockState = {
    vehicleId: 1,
    serviceIds: [101, 102],
    locationId: "home",
    employeeId: 1,
    date: "2026-02-01",
    time: "10:00",
  };

  const mockVehicle = {
    id: 1,
    vehbrand: "Toyota",
    vehmodel: "Prius",
    vehplate: "ABC-1234",
  };
  const mockServices = [
    { serviceid: 101, servicename: "Gold Package", serviceprice: 2000 },
    { serviceid: 102, servicename: "Interior Clean", serviceprice: 800 },
    { serviceid: 103, servicename: "Unselected", serviceprice: 500 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders booking summary correctly", async () => {
    vehicleService.getVehicle.mockResolvedValue(mockVehicle);
    serviceService.getServices.mockResolvedValue(mockServices);

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/booking/confirmation", state: mockState },
        ]}
      >
        <BookingConfirmationPage />
      </MemoryRouter>,
    );

    // Wait for vehicle
    await waitFor(() => {
      expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    });

    // Wait for services and price
    await waitFor(() => {
      expect(screen.getByText(/Gold Package/i)).toBeInTheDocument();
      expect(screen.getByText(/Interior Clean/i)).toBeInTheDocument();

      // Price appears in Subtotal and Total, so use getAll
      const prices = screen.getAllByText(/2,800/);
      expect(prices.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("submits booking and navigates on confirm", async () => {
    vehicleService.getVehicle.mockResolvedValue(mockVehicle);
    serviceService.getServices.mockResolvedValue(mockServices);
    bookingService.createBooking.mockResolvedValue({ success: true });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/booking/confirmation", state: mockState },
        ]}
      >
        <BookingConfirmationPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Gold Package/i)).toBeInTheDocument();
    });

    const confirmBtn = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(confirmBtn);

    expect(bookingService.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleId: 1,
        services: [101, 102],
        employeeId: 1,
        // locationLatitude etc are default in component
      }),
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/dashboard/bookings",
        expect.objectContaining({
          state: { success: true },
        }),
      );
    });
  });

  it("handles submission error", async () => {
    vehicleService.getVehicle.mockResolvedValue(mockVehicle);
    serviceService.getServices.mockResolvedValue(mockServices);
    bookingService.createBooking.mockRejectedValue(new Error("Network Failed"));

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/booking/confirmation", state: mockState },
        ]}
      >
        <BookingConfirmationPage />
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/Gold Package/i)).toBeInTheDocument(),
    );

    const confirmBtn = screen.getByRole("button", { name: /confirm booking/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText(/Network Failed/i)).toBeInTheDocument();
    });
  });
});
