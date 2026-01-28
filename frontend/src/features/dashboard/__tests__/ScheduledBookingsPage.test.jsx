import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ScheduledBookingsPage from "../ScheduledBookingsPage";
import * as bookingService from "@/services/booking.service";
import { BrowserRouter } from "react-router-dom";

// Mocks
vi.mock("@/services/booking.service", () => ({
  getBookings: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
}));

// window.confirm Mock
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe("ScheduledBookingsPage", () => {
  const mockBookings = [
    {
      bookingid: 1,
      bookingstatus: "pending",
      vehicle: { brand: "Toyota", model: "Corolla", plate: "CAB-1234" },
      vehbrand: "Toyota",
      vehmodel: "Corolla",
      vehplate: "CAB-1234",
      services: [{ serviceName: "Full Wash" }],
      bookingdate: "2025-05-01",
      bookingstarttime: "10:00",
      bookingendtime: "11:00",
      bookingtotalprice: 1500,
    },
    {
      bookingid: 2,
      bookingstatus: "completed",
      vehbrand: "Honda",
      vehmodel: "Civic",
      bookingdate: "2025-04-20",
      bookingstarttime: "09:00",
      bookingendtime: "10:00",
      bookingtotalprice: 2000,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ScheduledBookingsPage />
      </BrowserRouter>,
    );
  };

  it("renders loading state initially", () => {
    bookingService.getBookings.mockReturnValue(new Promise(() => {}));
    renderComponent();
    // Loader check (using Lucide mock or generic class if we mocked Lucide? No, usually generic)
    // The component renders a spinner div.
    // Expect "My Bookings" NOT to be present yet if loader blocks it?
    // No, loader is conditional return.
    expect(screen.queryByText("My Bookings")).not.toBeInTheDocument();
  });

  it("renders upcoming bookings", async () => {
    bookingService.getBookings.mockResolvedValue(mockBookings);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("My Bookings")).toBeInTheDocument();
    });

    // Check for Title "Upcoming (1)" - filtered pending/inProgress
    expect(screen.getByText(/upcoming \(1\)/i)).toBeInTheDocument();

    // Check Toyota Corolla Card
    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("CAB-1234")).toBeInTheDocument();
  });

  it("renders empty state when no upcoming bookings", async () => {
    bookingService.getBookings.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No upcoming bookings")).toBeInTheDocument();
    });
  });

  it("opens manage modal and cancels booking", async () => {
    bookingService.getBookings.mockResolvedValue(mockBookings);
    bookingService.deleteBooking.mockResolvedValue({ success: true });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    });

    // Click "Manage"
    fireEvent.click(screen.getByText("Manage"));

    // Modal opens
    expect(screen.getByText("Manage Booking")).toBeInTheDocument();
    expect(screen.getByText("Service #1")).toBeInTheDocument();

    // Click Cancel
    mockConfirm.mockReturnValue(true);
    fireEvent.click(screen.getByText("Cancel Booking"));

    await waitFor(() => {
      expect(bookingService.deleteBooking).toHaveBeenCalledWith(1);
    });
  });

  it("updates booking date/time", async () => {
    bookingService.getBookings.mockResolvedValue(mockBookings);
    bookingService.updateBooking.mockResolvedValue({ success: true });

    // Mock global alert
    window.alert = vi.fn();

    renderComponent();
    await waitFor(() => screen.getByText("Toyota Corolla"));

    fireEvent.click(screen.getByText("Manage"));

    // Update Time
    const timeInput = screen.getByDisplayValue("10:00");
    fireEvent.change(timeInput, { target: { value: "12:00" } });

    // Save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(bookingService.updateBooking).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          startTime: "12:00",
        }),
      );
    });
  });
});
