import api from "@/lib/api";

/**
 * Get all services
 * @returns {Promise<Object>} - List of services
 */
export const getServices = async () => {
  const response = await api.get("/service");
  return response.data?.data?.services || [];
};

/**
 * Get a specific service by ID
 * @param {number} serviceid - Service ID
 * @returns {Promise<Object>} - Service data
 */
export const getService = async (serviceid) => {
  const response = await api.get(`/service/${serviceid}`);
  return response.data?.data?.service;
};

/**
 * Create a new service (owner/manager only)
 * @param {Object} serviceData - Service data
 * @returns {Promise<Object>} - Created service
 */
export const createService = async (serviceData) => {
  const response = await api.post("/service", serviceData);
  return response.data?.data?.service;
};

/**
 * Update a service (owner/manager only)
 * @param {number} serviceid - Service ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} - Updated service
 */
export const updateService = async (serviceid, data) => {
  const response = await api.put(`/service/${serviceid}`, data);
  return response.data?.data?.service;
};

/**
 * Delete a service (owner/manager only)
 * @param {number} serviceid - Service ID
 * @returns {Promise<Object>} - Success message
 */
export const deleteService = async (serviceid) => {
  const response = await api.delete(`/service/${serviceid}`);
  return response.data;
};
