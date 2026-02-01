import api from "@/lib/api";

export const getVehicleModels = async () => {
  const response = await api.get("/vehicle-catalog");
  return response.data?.data || [];
};

export const addVehicleModel = async (item) => {
  const response = await api.post("/vehicle-catalog", item);
  return response.data?.data || response.data;
};

export const deleteVehicleModel = async (id) => {
  const response = await api.delete(`/vehicle-catalog/${id}`);
  return response.data;
};

export const getCatalog = getVehicleModels;
export const addToCatalog = addVehicleModel;
export const removeFromCatalog = deleteVehicleModel;
