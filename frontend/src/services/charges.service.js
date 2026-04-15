import api from "@/lib/api";

// Add extra item (Employee)
export const addExtraItem = async (bookingId, data) => {
  const response = await api.post(`/bookings/${bookingId}/extras`, data);
  return response.data;
};

// Remove extra item
export const removeExtraItem = async (extraId) => {
  const response = await api.delete(`/extras/${extraId}`);
  return response.data;
};

// Update price (Cashier)
export const updateItemPrice = async (extraId, price) => {
  const response = await api.put(`/extras/${extraId}/price`, {
    price,
  });
  return response.data;
};

// Update base service price per booking (Cashier)
export const updateServicePrice = async (bookingId, serviceId, price) => {
  const response = await api.put(
    `/bookings/${bookingId}/services/${serviceId}/price`,
    {
      price,
    },
  );
  return response.data;
};
