import api from "@/lib/api";

/**
 * Get all bookings for the authenticated user
 * @returns {Promise<Array>} - List of bookings
 */
export const getBookings = async () => {
  try {
    const response = await api.get("/booking");
    return response.data?.data?.bookings || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

/**
 * Get a specific booking by ID
 */
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/booking/${id}`);
    return response.data?.data?.booking;
  } catch (error) {
    console.error(`Error fetching booking ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/booking", bookingData);
    return response.data?.data?.booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Resolve and lock an auto-assigned employee before date/time selection
 */
export const resolveBookingEmployee = async ({
  vehicleId,
  services,
  locationType = "branch",
}) => {
  try {
    const response = await api.post("/booking/resolve-employee", {
      vehicleId,
      services,
      locationType,
    });
    return response.data?.data?.assignment;
  } catch (error) {
    console.error("Error resolving booking employee:", error);
    throw error;
  }
};

/**
 * Update an existing booking
 */
export const updateBooking = async (id, updates) => {
  try {
    const response = await api.put(`/booking/${id}`, updates);
    return response.data?.data?.booking;
  } catch (error) {
    console.error(`Error updating booking ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a booking
 */
export const deleteBooking = async (id) => {
  try {
    await api.delete(`/booking/${id}`);
  } catch (error) {
    console.error(`Error deleting booking ${id}:`, error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (id, status) => {
  try {
    const response = await api.put(`/booking/${id}`, { status });
    return response.data?.data?.booking;
  } catch (error) {
    console.error(`Error updating booking status ${id}:`, error);
    throw error;
  }
};
