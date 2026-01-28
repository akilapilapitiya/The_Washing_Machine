import api from "@/lib/api";

export const createIncident = async (data) => {
  const response = await api.post("/incident", data);
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get("/incident");
  return response.data;
};

export const updateIncidentStatus = async (id, status) => {
  const response = await api.patch(`/incident/${id}`, { status });
  return response.data;
};
