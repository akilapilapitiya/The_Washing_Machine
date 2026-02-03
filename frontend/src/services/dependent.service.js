import api from "@/lib/api";

export const getMyDependents = async () => {
  const response = await api.get("/dependent/me");
  return response.data?.data || [];
};

export const addDependent = async (data) => {
  const response = await api.post("/dependent", data);
  return response.data?.data;
};

export const deleteDependent = async (id) => {
  const response = await api.delete(`/dependent/${id}`);
  return response.data;
};
