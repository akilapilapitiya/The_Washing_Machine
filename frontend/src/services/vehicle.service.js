import api from "@/lib/api";

/**
 * Get all vehicles for the authenticated user
 * @returns {Promise<Object>} - List of vehicles
 */
export const getVehicles = async () => {
  const response = await api.get("/vehicle");
  return response.data;
};

/**
 * Get a specific vehicle by ID
 * @param {string} vehid - Vehicle ID
 * @returns {Promise<Object>} - Vehicle data
 */
export const getVehicle = async (vehid) => {
  const response = await api.get(`/vehicle/${vehid}`);
  return response.data;
};

/**
 * Create a new vehicle
 * @param {Object} vehicleData - Vehicle data
 * @returns {Promise<Object>} - Created vehicle
 */
export const createVehicle = async (vehicleData) => {
  const response = await api.post("/vehicle", vehicleData);
  return response.data;
};

/**
 * Update vehicle mileage (employees only)
 * @param {string} vehid - Vehicle ID
 * @param {Object} data - Update data (vehmileage)
 * @returns {Promise<Object>} - Updated vehicle
 */
export const updateVehicle = async (vehid, data) => {
  const response = await api.put(`/vehicle/${vehid}`, data);
  return response.data;
};

/**
 * Delete a vehicle
 * @param {string} vehid - Vehicle ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteVehicle = async (vehid) => {
  const response = await api.delete(`/vehicle/${vehid}`);
  return response.data;
};
