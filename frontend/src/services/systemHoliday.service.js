import api from "@/lib/api";

// Get all holidays
export const getHolidays = async () => {
  const response = await api.get("/holidays");
  return response.data;
};

// Get holidays by date range
export const getHolidaysByRange = async (startDate, endDate) => {
  const response = await api.get(
    `/holidays/range?start=${startDate}&end=${endDate}`,
  );
  return response.data;
};

// Get upcoming holidays (next 90 days)
export const getUpcomingHolidays = async () => {
  const response = await api.get("/holidays/upcoming");
  return response.data;
};

// Check if a specific date is a holiday
export const checkHolidayDate = async (date) => {
  const response = await api.get(`/holidays/check/${date}`);
  return response.data;
};

// Get holiday by ID
export const getHolidayById = async (id) => {
  const response = await api.get(`/holidays/${id}`);
  return response.data;
};

// Create new holiday (owner only)
export const createHoliday = async (holidayData) => {
  const response = await api.post("/holidays", holidayData);
  return response.data;
};

// Update holiday (owner only)
export const updateHoliday = async (id, holidayData) => {
  const response = await api.put(`/holidays/${id}`, holidayData);
  return response.data;
};

// Delete holiday (owner only)
export const deleteHoliday = async (id) => {
  const response = await api.delete(`/holidays/${id}`);
  return response.data;
};
