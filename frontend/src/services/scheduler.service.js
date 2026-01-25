import api from "@/lib/api";

/**
 * Fetch blocked dates (leaves) for a specific employee
 */
export const getBlockedDates = async (empid) => {
  const response = await api.get(`/schedule/employee/${empid}`);
  return response.data.data; // Array of ISO date strings
};

/**
 * Fetch detailed schedule for a specific employee and date
 */
export const getDaySchedule = async (empid, date) => {
  const response = await api.get(`/schedule/employee/${empid}`, {
    params: { date },
  });
  return response.data.data; // Array of schedule objects
};

/**
 * Fetch all leaves (Owner only)
 */
export const getAllLeaves = async () => {
  const response = await api.get("/leave");
  return response.data.data;
};

/**
 * Record a new leave (Owner only)
 */
export const recordLeave = async (leaveData) => {
  const response = await api.post("/leave", leaveData);
  return response.data.data;
};

/**
 * Fetch my leaves (Employee)
 */
export const getMyLeaves = async () => {
  const response = await api.get("/leave/my-leaves");
  return response.data.data;
};
