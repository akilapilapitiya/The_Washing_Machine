import api from "@/lib/api";

/**
 * Get all employees
 */
export const getEmployees = async () => {
  const response = await api.get("/employee");
  return response.data?.data?.employees || [];
};

/**
 * Register a new employee (Owner only)
 */
export const addEmployee = async (employeeData) => {
  const response = await api.post("/authemployee/signup", {
    ...employeeData,
    password: "Employee@123", // Standard default password
  });
  return response.data;
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id) => {
  const response = await api.delete(`/employee/${id}`);
  return response.data;
};

/**
 * Update employee details (Promote etc)
 */
export const updateEmployee = async (id, updates) => {
  const response = await api.put(`/employee/${id}`, updates);
  return response.data;
};
