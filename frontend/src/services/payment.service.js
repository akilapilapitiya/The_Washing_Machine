import api from "@/lib/api";

/**
 * Get all payments for the authenticated customer
 * @returns {Promise<Array>} - List of payments
 */
export const getMyPayments = async () => {
  try {
    const response = await api.get("/payment/my");
    return response.data?.data?.payments || [];
  } catch (error) {
    console.error("Error fetching my payments:", error);
    throw error;
  }
};

/**
 * Get all payments (Admin/Manager only)
 */
export const getAllPayments = async () => {
  try {
    const response = await api.get("/payment");
    return response.data?.data?.payments || [];
  } catch (error) {
    console.error("Error fetching all payments:", error);
    throw error;
  }
};

/**
 * Get a specific payment by ID
 */
export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payment/${id}`);
    return response.data?.data?.payment;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new payment (Manager/Owner only)
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post("/payment", paymentData);
    return response.data?.data?.payment;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};
