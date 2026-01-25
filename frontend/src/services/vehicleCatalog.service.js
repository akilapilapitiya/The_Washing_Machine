import api from "@/lib/api";

export const getCatalog = async () => {
  const response = await api.get("/vehicle-catalog");
  return response.data;
};

export const addToCatalog = async (item) => {
  const response = await api.post("/vehicle-catalog", item);
  return response.data;
};

export const removeFromCatalog = async (id) => {
  const response = await api.delete(`/vehicle-catalog/${id}`);
  return response.data;
};
