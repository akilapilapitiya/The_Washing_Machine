import api from "@/lib/api";

/**
 * Test API connection
 * @returns {Promise} Database connection info
 */
export const testConnection = async () => {
  const response = await api.get("/db");
  return response.data;
};
