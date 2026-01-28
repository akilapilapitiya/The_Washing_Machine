import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AllBookingsPage from "../AllBookingsPage";
import * as bookingService from "@/services/booking.service";
import { BrowserRouter } from "react-router-dom";

// Mocks
vi.mock("@/services/booking.service", () => ({
  getBookings: vi.fn(),
  updateBooking: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "@/contexts/AuthContext";

describe("AllBookingsPage", () => {
  const mockBookings = [
    {
      bookingid: 1,
      bookingstatus: "pending",
      vehbrand: "Toyota",
      vehmodel: "Corolla",
      vehplate: "CAB-1234",
      cusname: "Alice",
      bookingdate: "2025-05-01",
      bookingstarttime: "10:00",
      bookingendtime: "11:00",
    },
    {
      bookingid: 2,
      bookingstatus: "inProgress",
      vehbrand: "BMW",
      vehmodel: "X5",
      cusname: "Bob",
      bookingdate: "2025-05-01",
      bookingstarttime: "12:00",
      bookingendtime: "13:00",
    },
    {
      bookingid: 3,
      bookingstatus: "completed",
      vehbrand: "Audi",
      vehmodel: "A4",
      cusname: "Charlie",
      bookingdate: "2025-04-20",
      bookingstarttime: "09:00",
      bookingendtime: "10:00",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ isOwner: true, isCashier: false });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AllBookingsPage />
      </BrowserRouter>,
    );
  };

  it("renders loading state initially", () => {
    bookingService.getBookings.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText("Loading bookings...")).toBeInTheDocument();
  });

  it("renders all bookings sorted by tabs", async () => {
    const user = userEvent.setup();
    bookingService.getBookings.mockResolvedValue(mockBookings);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Service Bookings")).toBeInTheDocument();
    });

    // Default Tab: Upcoming (Pending)
    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Switch to Active Tab
    const activeTab = screen.getByRole("tab", { name: /active/i });
    await user.click(activeTab);

    // Wait for Tab Content (BMW X5 is in InProgress)
    await waitFor(() => {
      expect(screen.getByText("BMW X5")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Switch to Completed Tab
    const completedTab = screen.getByRole("tab", { name: /completed/i });
    await user.click(completedTab);

    // Wait for Tab Content
    await waitFor(() => {
      expect(screen.getByText("Audi A4")).toBeInTheDocument();
    });
  });

  it("renders specialized view for non-admin employees", async () => {
    useAuth.mockReturnValue({ isOwner: false, isCashier: false });
    bookingService.getBookings.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("My Assignments")).toBeInTheDocument();
    });
  });

  it("handles empty states", async () => {
    bookingService.getBookings.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No upcoming bookings")).toBeInTheDocument();
    });
  });
});
