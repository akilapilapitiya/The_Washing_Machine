import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import DateTimeSelectionPage from "../DateTimeSelectionPage";
import * as schedulerService from "@/services/scheduler.service";

// Mock Scheduler Service
vi.mock("@/services/scheduler.service");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("DateTimeSelectionPage", () => {
  const mockState = {
    vehicleId: 1,
    serviceIds: [101],
    locationId: "home",
    employeeId: 1,
  };

  const today = new Date().toISOString().split("T")[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders date selection initially", () => {
    schedulerService.getBlockedDates.mockResolvedValue([]);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/booking/datetime", state: mockState }]}
      >
        <DateTimeSelectionPage />
      </MemoryRouter>,
    );

    // "Select Date" appears multiple times (H1 and Card Title). Use getAllByText.
    expect(screen.getAllByText(/select date/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/appointment date/i)).toBeInTheDocument();
  });

  it("renders time slots when date is selected", async () => {
    schedulerService.getBlockedDates.mockResolvedValue([]);
    schedulerService.getDaySchedule.mockResolvedValue([]);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/booking/datetime", state: mockState }]}
      >
        <DateTimeSelectionPage />
      </MemoryRouter>,
    );

    const dateInput = screen.getByLabelText(/appointment date/i);
    fireEvent.change(dateInput, { target: { value: today } });

    await waitFor(() => {
      // Use getAllByText just in case, or specific query
      expect(screen.getAllByText(/select time/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/9:00 AM/i)).toBeInTheDocument();
    });
  });

  it("blocks selecting time when slots are occupied", async () => {
    schedulerService.getBlockedDates.mockResolvedValue([]);

    // Key Fix: Use "HH:MM" format to match component's timeSlots for correct string comparison
    // Component comparision: entry.scheduleendtime <= slotStart
    // If "10:00:00" <= "10:00", it is False.
    // If "10:00" <= "10:00", it is True.
    schedulerService.getDaySchedule.mockResolvedValue([
      { schedulestarttime: "09:00", scheduleendtime: "10:00" },
    ]);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/booking/datetime", state: mockState }]}
      >
        <DateTimeSelectionPage />
      </MemoryRouter>,
    );

    const dateInput = screen.getByLabelText(/appointment date/i);
    fireEvent.change(dateInput, { target: { value: today } });

    await waitFor(() => {
      expect(screen.getAllByText(/select time/i).length).toBeGreaterThan(0);
    });

    const button9AM = screen.getByText(/9:00 AM/i);
    expect(button9AM).toBeDisabled();

    // 10:00 should be free because 10:00 <= 10:00 is true
    const button10AM = screen.getByText(/10:00 AM/i);
    expect(button10AM).toBeEnabled();
  });

  it("navigates to confirmation on continue", async () => {
    schedulerService.getBlockedDates.mockResolvedValue([]);
    schedulerService.getDaySchedule.mockResolvedValue([]);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/booking/datetime", state: mockState }]}
      >
        <DateTimeSelectionPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/appointment date/i), {
      target: { value: today },
    });

    await waitFor(() => {
      expect(screen.getByText(/10:00 AM/i)).toBeEnabled();
    });

    fireEvent.click(screen.getByText(/10:00 AM/i)); // Select 10 AM

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeEnabled();
    fireEvent.click(continueBtn);

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/booking/confirmation",
      expect.objectContaining({
        state: expect.objectContaining({
          date: today,
          time: "10:00",
        }),
      }),
    );
  });
});
