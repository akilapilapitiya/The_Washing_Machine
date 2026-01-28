import api from "@/lib/api";

export const getAvailableEmployees = async (date, startTime, endTime) => {
  const params = new URLSearchParams({ date, startTime, endTime });
  const response = await api.get(`/employee/available?${params.toString()}`);
  return response.data?.data?.employees || [];
};

export const getAllEmployees = async () => {
  const response = await api.get("/employee");
  return response.data?.data?.employees || [];
};

export const getEmployees = getAllEmployees;

export const addEmployee = async (data) => {
  const response = await api.post("/authemployee/signup", data);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employee/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id) => {
  await api.delete(`/employee/${id}`);
};
