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

export const getEmployee = async (id) => {
  const response = await api.get(`/employee/${id}`);
  return response.data?.data?.employee;
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

export const updateEmployeeProfilePicture = async (id, file) => {
  const formData = new FormData();
  formData.append("profile_picture", file);
  const response = await api.patch(
    `/employee/${id}/profile-picture`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data?.data?.employee;
};

export const changePassword = async (id, oldPassword, newPassword) => {
  const response = await api.patch(`/employee/${id}/change-password`, {
    oldPassword,
    newPassword,
  });
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/employee/roles");
  return response.data;
};
