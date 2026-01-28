import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PaymentHistoryPage from "../PaymentHistoryPage";
import * as paymentService from "@/services/payment.service";
import * as receiptUtils from "@/utils/receipt";

// Mock Services and Utils
vi.mock("@/services/payment.service", () => ({
  getMyPayments: vi.fn(),
}));

vi.mock("@/utils/receipt", () => ({
  printReceipt: vi.fn(),
}));

describe("PaymentHistoryPage", () => {
  const mockPayments = [
    {
      paymentid: 1001,
      paymentdate: "2025-01-20",
      paymentamount: 2500,
      paymenttype: "card",
      vehbrand: "Toyota",
      vehmodel: "Corolla",
      vehplate: "CAA-1111",
      services: ["Full Wash", "Wax"],
    },
    {
      paymentid: 1002,
      paymentdate: "2025-02-15",
      paymentamount: 1200,
      paymenttype: "cash",
      vehbrand: "Honda",
      vehmodel: "Civic",
      vehplate: "CAB-2222",
      services: ["Interior Clean"],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    paymentService.getMyPayments.mockReturnValue(new Promise(() => {}));
    render(<PaymentHistoryPage />);
    // Check for spinner or lack of content
    // Specifically looking for "Payment History" title which is always there?
    // Actually loader replaces content?
    // Code check: if (loading) return <div ... <Loader2 ...
    // So Title is NOT there during load.
    // Let's check for "Payment History" NOT being there, or check for spinner class?
    // It's safer to rely on queryByText('Payment History') being null or wait.

    // Actually, finding by class is hard. Let's assume title is missing.
    expect(screen.queryByText("Payment History")).not.toBeInTheDocument();
  });

  it("renders payment list", async () => {
    paymentService.getMyPayments.mockResolvedValue(mockPayments);

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
      expect(screen.getByText("Honda Civic")).toBeInTheDocument();
    });

    expect(screen.getByText("Rs. 2,500")).toBeInTheDocument();
    expect(screen.getByText("Rs. 1,200")).toBeInTheDocument();
  });

  it("renders empty state when no payments", async () => {
    paymentService.getMyPayments.mockResolvedValue([]);

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/no payments recorded/i)).toBeInTheDocument();
    });
  });

  it("calls receipt printing function", async () => {
    paymentService.getMyPayments.mockResolvedValue(mockPayments);

    render(<PaymentHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    });

    // Find receipt button. Text "Download Receipt".
    // Buttons are per card.
    const downloadBtns = screen.getAllByText(/download receipt/i);
    fireEvent.click(downloadBtns[0]); // Click first one

    expect(receiptUtils.printReceipt).toHaveBeenCalledWith(mockPayments[0]);
  });
});
