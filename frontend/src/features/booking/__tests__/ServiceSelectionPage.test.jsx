import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ServiceSelectionPage from "../ServiceSelectionPage";
import * as serviceService from "@/services/service.service";
import * as vehicleService from "@/services/vehicle.service";

// Mock Services
vi.mock("@/services/service.service");
vi.mock("@/services/vehicle.service");

const mockNavigate = vi.fn();

// Partially mock react-router-dom to intercept useNavigate
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ServiceSelectionPage", () => {
  const mockVehicle = {
    id: 1,
    vehbrand: "Toyota",
    vehmodel: "Prius",
    vehplate: "ABC-1234",
  };
  const mockServices = [
    {
      serviceid: 101,
      servicename: "Gold Package",
      servicetype: "package",
      serviceprice: 2000,
      servicetime: 60,
      servicedetails: "Full detail",
    },
    {
      serviceid: 102,
      servicename: "Interior Clean",
      servicetype: "addon",
      serviceprice: 800,
      servicetime: 20,
      servicedetails: "Vacuum and wipe",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to book page if no vehicleId provided in state", () => {
    render(
      <MemoryRouter initialEntries={["/booking/services"]}>
        <ServiceSelectionPage />
      </MemoryRouter>,
    );
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/book");
  });

  it("renders loading state then services", async () => {
    vehicleService.getVehicle.mockResolvedValue(mockVehicle);
    serviceService.getServices.mockResolvedValue(mockServices);

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/booking/services", state: { vehicleId: 1 } },
        ]}
      >
        <ServiceSelectionPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/loading available services/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Toyota Prius")).toBeInTheDocument();
      expect(screen.getByText("Gold Package")).toBeInTheDocument();
      expect(screen.getByText("Interior Clean")).toBeInTheDocument();
    });
  });

  it("enables continue button only when service is selected", async () => {
    vehicleService.getVehicle.mockResolvedValue(mockVehicle);
    serviceService.getServices.mockResolvedValue(mockServices);

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/booking/services", state: { vehicleId: 1 } },
        ]}
      >
        <ServiceSelectionPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Gold Package")).toBeInTheDocument();
    });

    // Check continue button is disabled initially
    // Note: The button text is "Continue (0)"
    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();
    expect(screen.getByText("Continue (0)")).toBeInTheDocument();

    // Select package
    fireEvent.click(screen.getByText("Gold Package"));

    // Check enabled
    expect(continueBtn).toBeEnabled();
    expect(screen.getByText("Continue (1)")).toBeInTheDocument();

    // Click continue
    fireEvent.click(continueBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/booking/location", {
      state: { vehicleId: 1, serviceIds: [101] },
    });
  });
});
