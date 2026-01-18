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
 * @param {number} id - Vehicle ID
 * @returns {Promise<Object>} - Vehicle data
 */
export const getVehicle = async (id) => {
  const response = await api.get(`/vehicle/${id}`);
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
 * @param {number} id - Vehicle ID
 * @param {Object} data - Update data (vehmileage)
 * @returns {Promise<Object>} - Updated vehicle
 */
export const updateVehicle = async (id, data) => {
  const response = await api.put(`/vehicle/${id}`, data);
  return response.data;
};

/**
 * Delete a vehicle
 * @param {number} id - Vehicle ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicle/${id}`);
  return response.data;
};
