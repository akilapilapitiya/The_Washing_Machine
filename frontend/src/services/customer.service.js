import api from "@/lib/api";

/**
 * Get all customers (Admin/Manager only)
 * @returns {Promise<Array>} - List of customers
 */
export const getCustomers = async () => {
  try {
    const response = await api.get("/customer");
    return response.data?.data?.customers || [];
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

/**
 * Get a single customer by ID
 * @param {number|string} id - Customer ID
 * @returns {Promise<Object>} - Customer data
 */
export const getCustomer = async (id) => {
  try {
    const response = await api.get(`/customer/${id}`);
    return response.data?.data?.customer;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

/**
 * Update a customer
 * @param {number|string} id - Customer ID
 * @param {Object} updates - Updated customer data
 */
export const updateCustomer = async (id, updates) => {
  try {
    const response = await api.put(`/customer/${id}`, updates);
    return response.data?.data?.customer;
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param {number|string} id - Customer ID
 */
export const deleteCustomer = async (id) => {
  try {
    await api.delete(`/customer/${id}`);
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};
