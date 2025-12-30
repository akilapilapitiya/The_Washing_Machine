import api from "@/lib/api";

// Customer Authentication Service

/**
 * Sign in customer
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} - User data and token
 */
export const signIn = async (credentials) => {
  const response = await api.post("/authcustomer/signin", credentials);
  return response.data;
};

/**
 * Sign up new customer
 * @param {Object} userData - Customer registration data
 * @returns {Promise<Object>} - User data and token
 */
export const signUp = async (userData) => {
  const response = await api.post("/authcustomer/signup", userData);
  return response.data;
};

/**
 * Sign out customer
 * @returns {Promise<Object>} - Success message
 */
export const signOut = async () => {
  const response = await api.post("/authcustomer/signout");
  return response.data;
};

/**
 * Reset password
 * @param {Object} data - Email and new password
 * @returns {Promise<Object>} - Success message
 */
export const resetPassword = async (data) => {
  const response = await api.put("/authcustomer/passwordreset", data);
  return response.data;
};
