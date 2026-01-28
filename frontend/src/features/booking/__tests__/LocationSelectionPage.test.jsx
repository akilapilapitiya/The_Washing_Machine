import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LocationSelectionPage from "../LocationSelectionPage";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LocationSelectionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders location options", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking/location",
            state: { vehicleId: 1, serviceIds: [101] },
          },
        ]}
      >
        <LocationSelectionPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/main branch/i)).toBeInTheDocument();
    expect(screen.getByText(/home visit/i)).toBeInTheDocument();
  });

  it("enables continue button upon selection and navigates", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/booking/location",
            state: { vehicleId: 1, serviceIds: [101] },
          },
        ]}
      >
        <LocationSelectionPage />
      </MemoryRouter>,
    );

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Select Main Branch by clicking text or card. The card is a button.
    // getByText finds the text inside the button. Bubbling click works.
    fireEvent.click(screen.getByText(/main branch/i));

    expect(continueBtn).toBeEnabled();

    fireEvent.click(continueBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/booking/employee", {
      state: { vehicleId: 1, serviceIds: [101], locationId: "main-branch" },
    });
  });
});
